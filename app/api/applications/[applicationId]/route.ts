// app/api/applications/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import {
  jobApplications,
  jobs,
  jobSeekerProfiles,
  users,
  notifications,
} from "@/app/db/schema";
import { requireEmployer } from "@/lib/require-employer";

const updateSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected", "interview", "withdrawn"]),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireEmployer();
  if (auth.error) return auth.error;

  const [app] = await db
    .select({
      id: jobApplications.id,
      jobId: jobApplications.jobId,
      jobTitle: jobs.title,
      jobLocation: jobs.location,
      status: jobApplications.status,
      coverLetter: jobApplications.coverLetter,
      cvUrl: jobApplications.cvUrl,
      cvFileName: jobApplications.cvFileName,
      appliedAt: jobApplications.appliedAt,
      jobSeekerId: jobApplications.jobSeekerId,
      employerId: jobApplications.employerId,
      firstName: jobSeekerProfiles.firstName,
      lastName: jobSeekerProfiles.lastName,
      profileImage: jobSeekerProfiles.profileImage,
      contact: jobSeekerProfiles.contact,
      description: jobSeekerProfiles.description,
      educationLevel: jobSeekerProfiles.educationLevel,
      schoolUniversity: jobSeekerProfiles.schoolUniversity,
      year: jobSeekerProfiles.year,
      address: jobSeekerProfiles.address,
      email: users.email,
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .leftJoin(
      jobSeekerProfiles,
      eq(jobSeekerProfiles.userId, jobApplications.jobSeekerId)
    )
    .leftJoin(users, eq(users.id, jobApplications.jobSeekerId))
    .where(eq(jobApplications.id, id))
    .limit(1);

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.employerId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(app);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireEmployer();
  if (auth.error) return auth.error;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.id, id))
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.employerId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [updated] = await db
    .update(jobApplications)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(jobApplications.id, id))
    .returning();

  // Notify the job seeker of the status change
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, existing.jobId))
    .limit(1);

  await db.insert(notifications).values({
    recipientId: existing.jobSeekerId,
    actorId: auth.user.id,
    type: "application",
    title: `Application ${parsed.data.status}`,
    description: `Your application for "${job?.title ?? "a position"}" was marked as ${parsed.data.status}.`,
    link: `/applications/${id}`,
  });

  return NextResponse.json(updated);
}