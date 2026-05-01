import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { savedJobs } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "job_seeker") {
    return NextResponse.json({ saved: false });
  }

  const [existing] = await db
    .select()
    .from(savedJobs)
    .where(
      and(eq(savedJobs.jobId, jobId), eq(savedJobs.jobSeekerId, user.id))
    )
    .limit(1);

  return NextResponse.json({ saved: !!existing });
}