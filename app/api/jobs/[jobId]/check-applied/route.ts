import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { jobApplications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _: Request,
  { params }: { params: { jobId: string } }
) {
  const me = await getCurrentUser("auth");
  if (!me || me.role !== "job_seeker") {
    return NextResponse.json({ applied: false });
  }

  const [row] = await db
    .select()
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.jobId, params.jobId),
        eq(jobApplications.jobSeekerId, me.id)
      )
    )
    .limit(1);

  return NextResponse.json({ applied: !!row });
}