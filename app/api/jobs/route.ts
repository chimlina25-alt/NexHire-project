import { NextResponse } from "next/server";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { jobs, employerProfiles } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  location: z.string().min(1),
  arrangement: z.enum(["on_site", "remote", "hybrid"]).default("on_site"),
  employmentType: z
    .enum(["full_time", "part_time", "contract", "freelance", "internship"])
    .default("full_time"),
  experienceLevel: z
    .enum(["entry", "mid", "senior", "lead", "executive"])
    .default("entry"),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  applicationDeadline: z.string().nullable().optional(),
  description: z.string().min(1),
  requirements: z.string().optional(),
  applicationPlatform: z.string().default("internal"),
  externalApplyLink: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  status: z.enum(["draft", "active", "closed"]).default("draft"),
});

export async function GET(req: Request) {
  const user = await getCurrentUser("auth");
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine");
  const status = searchParams.get("status");
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const arrangement = searchParams.get("arrangement") || "";
  const experience = searchParams.get("experience") || "";

  // Employer fetching their own jobs
  if (mine && user?.role === "employer") {
    const conditions: any[] = [eq(jobs.employerId, user.id)];
    if (status) conditions.push(eq(jobs.status, status as any));

    const result = await db
      .select()
      .from(jobs)
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt));

    return NextResponse.json(result);
  }

  // Public job listing for job seekers
  const conditions: any[] = [eq(jobs.status, "active")];

  if (search) {
    conditions.push(
      or(
        ilike(jobs.title, `%${search}%`),
        ilike(jobs.category, `%${search}%`),
        ilike(jobs.location, `%${search}%`),
        ilike(jobs.description, `%${search}%`)
      )
    );
  }

  // Map display labels back to DB enums
  const typeMap: Record<string, string> = {
    "Full-time": "full_time",
    "Part-time": "part_time",
    Contract: "contract",
    Freelance: "freelance",
    Internship: "internship",
  };
  const arrangementMap: Record<string, string> = {
    "On-site": "on_site",
    Remote: "remote",
    Hybrid: "hybrid",
  };
  const experienceMap: Record<string, string> = {
    "Entry Level": "entry",
    "Mid Level": "mid",
    Senior: "senior",
    "Lead / Manager": "lead",
    Executive: "executive",
  };

  if (type && typeMap[type]) {
    conditions.push(eq(jobs.employmentType, typeMap[type] as any));
  }
  if (arrangement && arrangementMap[arrangement]) {
    conditions.push(eq(jobs.arrangement, arrangementMap[arrangement] as any));
  }
  if (experience && experienceMap[experience]) {
    conditions.push(eq(jobs.experienceLevel, experienceMap[experience] as any));
  }

  const result = await db
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
      updatedAt: jobs.updatedAt,
      employerId: jobs.employerId,
      companyName: employerProfiles.companyName,
      companyImage: employerProfiles.profileImage,
      companyIndustry: employerProfiles.industry,
    })
    .from(jobs)
    .leftJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
    .where(and(...conditions))
    .orderBy(desc(jobs.createdAt));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid data" },
      { status: 400 }
    );
  }

  const [job] = await db
    .insert(jobs)
    .values({
      employerId: user.id,
      title: parsed.data.title,
      category: parsed.data.category,
      location: parsed.data.location,
      arrangement: parsed.data.arrangement,
      employmentType: parsed.data.employmentType,
      experienceLevel: parsed.data.experienceLevel,
      salaryMin: parsed.data.salaryMin ?? null,
      salaryMax: parsed.data.salaryMax ?? null,
      applicationDeadline: parsed.data.applicationDeadline
        ? new Date(parsed.data.applicationDeadline)
        : null,
      description: parsed.data.description,
      requirements: parsed.data.requirements ?? null,
      applicationPlatform: parsed.data.applicationPlatform,
      externalApplyLink: parsed.data.externalApplyLink ?? null,
      contactEmail: parsed.data.contactEmail ?? null,
      status: parsed.data.status,
      postedAt: parsed.data.status === "active" ? new Date() : null,
    })
    .returning();

  return NextResponse.json(job, { status: 201 });
}