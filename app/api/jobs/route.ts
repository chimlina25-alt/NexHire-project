// app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "@/app/db";
import { jobs, jobApplications } from "@/app/db/schema";
import { requireEmployer } from "@/lib/require-employer";

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
  description: z.string().min(1),
  requirements: z.string().nullable().optional(),
  applicationDeadline: z.string().nullable().optional(),
  applicationPlatform: z.string().default("internal"),
  externalApplyLink: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  status: z.enum(["draft", "active", "closed"]).default("active"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine");

  if (mine === "1") {
    const auth = await requireEmployer();
    if (auth.error) return auth.error;

    const list = await db
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
        createdAt: jobs.createdAt,
        postedAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        applicantCount: sql<number>`(
          SELECT COUNT(*)::int FROM ${jobApplications}
          WHERE ${jobApplications.jobId} = ${jobs.id}
        )`,
      })
      .from(jobs)
      .where(eq(jobs.employerId, auth.user.id))
      .orderBy(desc(jobs.createdAt));

    return NextResponse.json(list);
  }

  // Public — only active jobs
  const list = await db
    .select()
    .from(jobs)
    .where(eq(jobs.status, "active"))
    .orderBy(desc(jobs.createdAt));

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const auth = await requireEmployer();
  if (auth.error) return auth.error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid job data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const [job] = await db
    .insert(jobs)
    .values({
      employerId: auth.user.id,
      title: d.title,
      category: d.category,
      location: d.location,
      arrangement: d.arrangement,
      employmentType: d.employmentType,
      experienceLevel: d.experienceLevel,
      salaryMin: d.salaryMin ?? null,
      salaryMax: d.salaryMax ?? null,
      description: d.description,
      requirements: d.requirements ?? null,
      applicationDeadline: d.applicationDeadline
        ? new Date(d.applicationDeadline)
        : null,
      applicationPlatform: d.applicationPlatform || "internal",
      externalApplyLink: d.externalApplyLink ?? null,
      contactEmail: d.contactEmail ?? null,
      status: d.status,
    })
    .returning();

  return NextResponse.json(job);
}