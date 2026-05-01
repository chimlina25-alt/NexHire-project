import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { jobs, notifications } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobId } = await params;

    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    await db
      .update(jobs)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(jobs.id, jobId));

    await db.insert(notifications).values({
      recipientId: job.employerId,
      type: "system",
      title: "Your job post has been removed by admin",
      description: `Your job posting "${job.title}" has been closed by an administrator. Please contact support if you have any questions.`,
      link: "/dashboard",
      meta: { adminAction: "job_closed", jobId: job.id } as Record<string, unknown>,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobId } = await params;
    const body = await req.json();

    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    await db
      .update(jobs)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(jobs.id, jobId));

    if (body.status === "active" && job.status === "closed") {
      await db.insert(notifications).values({
        recipientId: job.employerId,
        type: "system",
        title: "Your job post has been restored",
        description: `Your job posting "${job.title}" has been reactivated by an administrator and is now live again.`,
        link: "/dashboard",
        meta: { adminAction: "job_restored", jobId: job.id } as Record<string, unknown>,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}