import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { savedJobs, jobs } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "job_seeker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const [existing] = await db
    .select()
    .from(savedJobs)
    .where(
      and(eq(savedJobs.jobId, jobId), eq(savedJobs.jobSeekerId, user.id))
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ saved: true, id: existing.id });
  }

  const [saved] = await db
    .insert(savedJobs)
    .values({ jobId, jobSeekerId: user.id })
    .returning();

  return NextResponse.json({ saved: true, id: saved.id }, { status: 201 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "job_seeker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .delete(savedJobs)
    .where(
      and(eq(savedJobs.jobId, jobId), eq(savedJobs.jobSeekerId, user.id))
    );

  return NextResponse.json({ saved: false });
}