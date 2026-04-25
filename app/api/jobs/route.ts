import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/app/db";
import { employerProfiles, jobs } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

const arrangementMap: Record<string, "on_site" | "remote" | "hybrid"> = {
  "On-site": "on_site",
  Remote: "remote",
  Hybrid: "hybrid",
};

const employmentTypeMap: Record<
  string,
  "full_time" | "part_time" | "contract" | "freelance" | "internship"
> = {
  "Full-time": "full_time",
  "Part-time": "part_time",
  Contract: "contract",
  Freelance: "freelance",
  Internship: "internship",
};

const experienceMap: Record<
  string,
  "entry" | "mid" | "senior" | "lead" | "executive"
> = {
  "Entry Level": "entry",
  "Mid Level": "mid",
  Senior: "senior",
  "Lead / Manager": "lead",
  Executive: "executive",
};

export async function GET(req: NextRequest) {
  try {
    const me = await getCurrentUser("auth");
    const q = req.nextUrl.searchParams.get("q") ?? "";
    const jobType = req.nextUrl.searchParams.get("jobType") ?? "";
    const arrangement = req.nextUrl.searchParams.get("arrangement") ?? "";
    const experience = req.nextUrl.searchParams.get("experience") ?? "";
    const mine = req.nextUrl.searchParams.get("mine") === "1";

    const filters: any[] = [];

    if (mine && me?.role === "employer") {
      filters.push(eq(jobs.employerId, me.id));
    } else {
      filters.push(eq(jobs.status, "active"));
    }

    if (q) {
      filters.push(
        or(
          ilike(jobs.title, `%${q}%`),
          ilike(jobs.category, `%${q}%`),
          ilike(employerProfiles.companyName, `%${q}%`)
        )!
      );
    }

    if (jobType && employmentTypeMap[jobType]) {
      filters.push(eq(jobs.employmentType, employmentTypeMap[jobType]));
    }

    if (arrangement && arrangementMap[arrangement]) {
      filters.push(eq(jobs.arrangement, arrangementMap[arrangement]));
    }

    if (experience && experienceMap[experience]) {
      filters.push(eq(jobs.experienceLevel, experienceMap[experience]));
    }

    const rows = await db
      .select({
        id: jobs.id,
        employerId: jobs.employerId,
        title: jobs.title,
        category: jobs.category,
        location: jobs.location,
        arrangement: jobs.arrangement,
        type: jobs.employmentType,
        experience: jobs.experienceLevel,
        description: jobs.description,
        requirements: jobs.requirements,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        deadline: jobs.applicationDeadline,
        postedAt: jobs.createdAt,
        contactEmail: jobs.contactEmail,
        status: jobs.status,
        company: employerProfiles.companyName,
        profileImage: employerProfiles.profileImage,
      })
      .from(jobs)
      .innerJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
      .where(and(...filters))
      .orderBy(desc(jobs.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET JOBS ERROR:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role !== "employer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (!body.title || !body.category || !body.location || !body.description) {
      return NextResponse.json(
        { error: "Title, category, location, and description are required" },
        { status: 400 }
      );
    }

    const [job] = await db
      .insert(jobs)
      .values({
        employerId: me.id,
        title: body.title,
        category: body.category,
        location: body.location,
        arrangement: body.arrangement ?? "on_site",
        employmentType: body.employmentType ?? "full_time",
        experienceLevel: body.experienceLevel ?? "entry",
        salaryMin: body.salaryMin ? Number(body.salaryMin) : null,
        salaryMax: body.salaryMax ? Number(body.salaryMax) : null,
        description: body.description,
        requirements: body.requirements ?? "",
        applicationDeadline: body.applicationDeadline
          ? new Date(body.applicationDeadline)
          : null,
        applicationPlatform: body.applicationPlatform ?? "internal",
        externalApplyLink: body.externalApplyLink ?? null,
        contactEmail: body.contactEmail ?? null,
        status: body.status ?? "draft",
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("POST JOB ERROR:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
