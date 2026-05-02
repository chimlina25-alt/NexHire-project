import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/app/db";
import { jobs, employerProfiles, sessions, users } from "@/app/db/schema";
import { createHash } from "crypto";
import { cookies } from "next/headers";
import { and, gt } from "drizzle-orm";

async function getEmployerIdFromRequest(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("session_token")?.value;
    if (!rawToken) return null;

    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!session) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) return null;

    return user.id;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine");

    // ── Employer: fetch their own jobs (all statuses including drafts) ──
    if (mine === "1") {
      const userId = await getEmployerIdFromRequest();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const myJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.employerId, userId))
        .orderBy(desc(jobs.createdAt));

      return NextResponse.json({ jobs: myJobs, total: myJobs.length });
    }

    // ── Public: fetch active jobs with filters ──
    const category = searchParams.get("category") || "";
    const arrangement = searchParams.get("arrangement") || "";
    const employmentType = searchParams.get("employmentType") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let allJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        category: jobs.category,
        location: jobs.location,
        arrangement: jobs.arrangement,
        employmentType: jobs.employmentType,
        experienceLevel: jobs.experienceLevel,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        description: jobs.description,
        requirements: jobs.requirements,
        applicationDeadline: jobs.applicationDeadline,
        applicationPlatform: jobs.applicationPlatform,
        externalApplyLink: jobs.externalApplyLink,
        contactEmail: jobs.contactEmail,
        status: jobs.status,
        postedAt: jobs.postedAt,
        createdAt: jobs.createdAt,
        employerId: jobs.employerId,
        companyName: employerProfiles.companyName,
        industry: employerProfiles.industry,
        companySize: employerProfiles.companySize,
        currentAddress: employerProfiles.currentAddress,
        profileImage: employerProfiles.profileImage,
        websiteLink: employerProfiles.websiteLink,
      })
      .from(jobs)
      .leftJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
      .where(eq(jobs.status, "active"))
      .orderBy(desc(jobs.postedAt));

    if (category) {
      allJobs = allJobs.filter((j) => j.category === category);
    }
    if (arrangement) {
      allJobs = allJobs.filter((j) => j.arrangement === arrangement);
    }
    if (employmentType) {
      allJobs = allJobs.filter((j) => j.employmentType === employmentType);
    }
    if (search) {
      const q = search.toLowerCase();
      allJobs = allJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.companyName || "").toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }

    const total = allJobs.length;
    const paginated = allJobs.slice(offset, offset + limit);

    return NextResponse.json({ jobs: paginated, total, page, limit });
  } catch (error) {
    console.error("JOBS GET ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getEmployerIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category,
      location,
      arrangement,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
      applicationDeadline,
      description,
      requirements,
      applicationPlatform,
      externalApplyLink,
      contactEmail,
      status,
    } = body;

    if (!title?.trim())
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (!category?.trim())
      return NextResponse.json({ error: "Category is required." }, { status: 400 });
    if (!location?.trim())
      return NextResponse.json({ error: "Location is required." }, { status: 400 });
    if (!description?.trim())
      return NextResponse.json({ error: "Description is required." }, { status: 400 });

    const [newJob] = await db
      .insert(jobs)
      .values({
        employerId: userId,
        title: title.trim(),
        category: category.trim(),
        location: location.trim(),
        arrangement: arrangement ?? "on_site",
        employmentType: employmentType ?? "full_time",
        experienceLevel: experienceLevel ?? "entry",
        salaryMin: salaryMin ?? null,
        salaryMax: salaryMax ?? null,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        description: description.trim(),
        requirements: requirements?.trim() ?? null,
        applicationPlatform: applicationPlatform || "internal",
        externalApplyLink: externalApplyLink || null,
        contactEmail: contactEmail || null,
        status: status ?? "draft",
        postedAt: status === "active" ? new Date() : null,
      })
      .returning();

    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error("JOBS POST ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}