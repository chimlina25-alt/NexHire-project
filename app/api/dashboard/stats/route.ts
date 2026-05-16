import { NextResponse } from "next/server";
import { eq, and, count, desc, sql, ne } from "drizzle-orm";
import { db } from "@/app/db";
import {
  jobs,
  jobApplications,
  jobSeekerProfiles,
  users,
} from "@/app/db/schema";
import { requireEmployer } from "@/lib/require-employer";

export async function GET() {
  const auth = await requireEmployer();
  if (auth.error) return auth.error;

  const [{ totalJobs }] = await db
    .select({ totalJobs: count() })
    .from(jobs)
    .where(and(eq(jobs.employerId, auth.user.id), ne(jobs.status, "draft")));

  const [{ activeJobs }] = await db
    .select({ activeJobs: count() })
    .from(jobs)
    .where(and(eq(jobs.employerId, auth.user.id), eq(jobs.status, "active")));

  const [{ totalApplicants }] = await db
    .select({ totalApplicants: count() })
    .from(jobApplications)
    .where(eq(jobApplications.employerId, auth.user.id));

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [{ recentApplicants }] = await db
    .select({ recentApplicants: count() })
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.employerId, auth.user.id),
        sql`${jobApplications.appliedAt} >= ${thirtyDaysAgo}`
      )
    );

  const recentJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      category: jobs.category,
      location: jobs.location,
      status: jobs.status,
      description: jobs.description,
      arrangement: jobs.arrangement,
      employmentType: jobs.employmentType,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      count: sql<number>`(
        SELECT COUNT(*)::int FROM ${jobApplications}
        WHERE ${jobApplications.jobId} = ${jobs.id}
      )`,
    })
    .from(jobs)
    .where(and(eq(jobs.employerId, auth.user.id), ne(jobs.status, "draft")))
    .orderBy(desc(jobs.createdAt))
    .limit(5);

  const draftJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      category: jobs.category,
      location: jobs.location,
      status: jobs.status,
      description: jobs.description,
      arrangement: jobs.arrangement,
      employmentType: jobs.employmentType,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
    })
    .from(jobs)
    .where(and(eq(jobs.employerId, auth.user.id), eq(jobs.status, "draft")))
    .orderBy(desc(jobs.updatedAt));

  const recentApplicantsList = await db
    .select({
      id: jobApplications.id,
      jobId: jobApplications.jobId,
      jobTitle: jobs.title,
      status: jobApplications.status,
      appliedAt: jobApplications.appliedAt,
      jobSeekerId: jobApplications.jobSeekerId,
      firstName: jobSeekerProfiles.firstName,
      lastName: jobSeekerProfiles.lastName,
      email: users.email,
      profileImage: jobSeekerProfiles.profileImage,
      coverLetter: jobApplications.coverLetter,
      cvUrl: jobApplications.cvUrl,
      cvFileName: jobApplications.cvFileName,
      contact: jobSeekerProfiles.contact,
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .leftJoin(jobSeekerProfiles, eq(jobSeekerProfiles.userId, jobApplications.jobSeekerId))
    .leftJoin(users, eq(users.id, jobApplications.jobSeekerId))
    .where(eq(jobApplications.employerId, auth.user.id))
    .orderBy(desc(jobApplications.appliedAt))
    .limit(10);

  return NextResponse.json({
    totalJobs: Number(totalJobs),
    activeJobs: Number(activeJobs),
    totalApplicants: Number(totalApplicants),
    recentApplicants: Number(recentApplicants),
    recentJobs,
    draftJobs,
    recentApplicantsList,
  });
}