import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { jobApplications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "job_seeker") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { applicationId } = await params;
  
  await db
    .update(jobApplications)
    .set({ status: "pending", updatedAt: new Date() })
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.jobSeekerId, user.id)));
  
  return NextResponse.json({ success: true });
}