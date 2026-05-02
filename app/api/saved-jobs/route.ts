import { NextResponse } from "next/server";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/app/db";
import { savedJobs, jobs, employerProfiles, sessions, users } from "@/app/db/schema";
import { cookies } from "next/headers";
import { createHash } from "crypto";

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("session_token")?.value;
    if (!rawToken) return null;
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
      .limit(1);
    if (!session) return null;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    return user ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await db
      .select({
        savedId: savedJobs.id,
        savedAt: savedJobs.createdAt,
        id: jobs.id,
        title: jobs.title,
        category: jobs.category,
        location: jobs.location,
        arrangement: jobs.arrangement,
        employmentType: jobs.employmentType,
        experienceLevel: jobs.experienceLevel,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        status: jobs.status,
        postedAt: jobs.postedAt,
        applicationDeadline: jobs.applicationDeadline,
        employerId: jobs.employerId,
        companyName: employerProfiles.companyName,
        profileImage: employerProfiles.profileImage,
        industry: employerProfiles.industry,
        currentAddress: employerProfiles.currentAddress,
      })
      .from(savedJobs)
      .innerJoin(jobs, eq(jobs.id, savedJobs.jobId))
      .leftJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
      .where(
        and(
          eq(savedJobs.jobSeekerId, user.id),
          // Only return saved jobs that are still active
          eq(jobs.status, "active")
        )
      );

    return NextResponse.json(saved);
  } catch (error) {
    console.error("SAVED JOBS GET ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    const [job] = await db
      .select({ id: jobs.id, status: jobs.status })
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "active") {
      return NextResponse.json(
        { error: "Cannot save a closed job" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(savedJobs)
      .where(and(eq(savedJobs.jobId, jobId), eq(savedJobs.jobSeekerId, user.id)))
      .limit(1);

    if (existing) {
      return NextResponse.json({ message: "Already saved" });
    }

    const [saved] = await db
      .insert(savedJobs)
      .values({ jobId, jobSeekerId: user.id })
      .returning();

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("SAVE JOB ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    await db
      .delete(savedJobs)
      .where(and(eq(savedJobs.jobId, jobId), eq(savedJobs.jobSeekerId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UNSAVE JOB ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}