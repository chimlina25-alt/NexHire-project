import { NextResponse } from "next/server";
import { eq, desc, and, gt, or, ilike, gte, lte } from "drizzle-orm";
import { db } from "@/app/db";
import { jobs, employerProfiles, sessions, users } from "@/app/db/schema";
import { createHash } from "crypto";
import { cookies } from "next/headers";

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

    // ── Employer: fetch their own jobs (all statuses including drafts) ────────
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

    // ── Public: active jobs with all filters applied in SQL ───────────────────
    const search         = searchParams.get("search")?.trim() ?? "";
    const category       = searchParams.get("category")?.trim() ?? "";
    const arrangement    = searchParams.get("arrangement")?.trim() ?? "";
    const employmentType = searchParams.get("employmentType")?.trim() ?? "";
    const experienceLevel = searchParams.get("experienceLevel")?.trim() ?? "";
    const salaryMin      = searchParams.get("salaryMin") ? Number(searchParams.get("salaryMin")) : null;
    const salaryMax      = searchParams.get("salaryMax") ? Number(searchParams.get("salaryMax")) : null;
    const page           = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit          = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
    const offset         = (page - 1) * limit;

    // Build WHERE conditions — always start with status = active
    const conditions = [eq(jobs.status, "active")];

    // Exact-match enum filters
    if (arrangement)    conditions.push(eq(jobs.arrangement,    arrangement    as any));
    if (employmentType) conditions.push(eq(jobs.employmentType, employmentType as any));
    if (experienceLevel) conditions.push(eq(jobs.experienceLevel, experienceLevel as any));
    if (category)       conditions.push(ilike(jobs.category, category));

    // Salary range — match jobs whose range overlaps the requested range.
    // A job matches if it has no salary (negotiable) OR its salary overlaps.
    if (salaryMin !== null) conditions.push(gte(jobs.salaryMax, salaryMin));
    if (salaryMax !== null) conditions.push(lte(jobs.salaryMin, salaryMax));

    // Full-text search across title, category, location, and company name
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          ilike(jobs.title,    pattern),
          ilike(jobs.category, pattern),
          ilike(jobs.location, pattern),
          // companyName lives on employerProfiles — handled via the join below
          ilike(employerProfiles.companyName, pattern),
        )!
      );
    }

    const filtered = await db
      .select({
        id:                  jobs.id,
        title:               jobs.title,
        category:            jobs.category,
        location:            jobs.location,
        arrangement:         jobs.arrangement,
        employmentType:      jobs.employmentType,
        experienceLevel:     jobs.experienceLevel,
        salaryMin:           jobs.salaryMin,
        salaryMax:           jobs.salaryMax,
        description:         jobs.description,
        requirements:        jobs.requirements,
        applicationDeadline: jobs.applicationDeadline,
        applicationPlatform: jobs.applicationPlatform,
        externalApplyLink:   jobs.externalApplyLink,
        contactEmail:        jobs.contactEmail,
        status:              jobs.status,
        postedAt:            jobs.postedAt,
        createdAt:           jobs.createdAt,
        employerId:          jobs.employerId,
        companyName:         employerProfiles.companyName,
        companyImage:        employerProfiles.profileImage,
        companyIndustry:     employerProfiles.industry,
        companyDescription:  employerProfiles.companyDescription,
        companySize:         employerProfiles.companySize,
        currentAddress:      employerProfiles.currentAddress,
        websiteLink:         employerProfiles.websiteLink,
      })
      .from(jobs)
      .leftJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
      .where(and(...conditions))
      .orderBy(desc(jobs.postedAt));

    const total     = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

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
        employerId:          userId,
        title:               title.trim(),
        category:            category.trim(),
        location:            location.trim(),
        arrangement:         arrangement       ?? "on_site",
        employmentType:      employmentType    ?? "full_time",
        experienceLevel:     experienceLevel   ?? "entry",
        salaryMin:           salaryMin         ?? null,
        salaryMax:           salaryMax         ?? null,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        description:         description.trim(),
        requirements:        requirements?.trim() ?? null,
        applicationPlatform: applicationPlatform  || "internal",
        externalApplyLink:   externalApplyLink    || null,
        contactEmail:        contactEmail         || null,
        status:              status               ?? "draft",
        postedAt:            status === "active" ? new Date() : null,
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