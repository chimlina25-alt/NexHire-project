import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { savedJobs } from "@/app/db/schema";
import { requireUser } from "@/lib/current-user";

export async function POST(
  _: Request,
  { params }: { params: { jobId: string } }
) {
  const auth = await requireUser("job_seeker");
  if ("error" in auth) return auth.error;

  const [saved] = await db
    .insert(savedJobs)
    .values({
      jobId: params.jobId,
      jobSeekerId: auth.user.userId,
    })
    .onConflictDoNothing()
    .returning();

  return NextResponse.json(saved ?? { ok: true });
}

export async function DELETE(
  _: Request,
  { params }: { params: { jobId: string } }
) {
  const auth = await requireUser("job_seeker");
  if ("error" in auth) return auth.error;

  await db
    .delete(savedJobs)
    .where(
      and(
        eq(savedJobs.jobId, params.jobId),
        eq(savedJobs.jobSeekerId, auth.user.userId)
      )
    );

  return NextResponse.json({ ok: true });
}