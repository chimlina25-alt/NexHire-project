import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { jobs, employerProfiles, subscriptions } from "@/app/db/schema";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { and, gt } from "drizzle-orm";
import { sessions, users } from "@/app/db/schema";

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

const planLimits: Record<string, number> = { free: 1, standard: 3, premium: 7 };

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const [job] = await db
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
        postedAt: jobs.postedAt,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        employerId: jobs.employerId,
        companyName: employerProfiles.companyName,
        industry: employerProfiles.industry,
        companySize: employerProfiles.companySize,
        currentAddress: employerProfiles.currentAddress,
        profileImage: employerProfiles.profileImage,
        websiteLink: employerProfiles.websiteLink,
        companyDescription: employerProfiles.companyDescription,
        foundedYear: employerProfiles.foundedYear,
        contact: employerProfiles.contact,
      })
      .from(jobs)
      .leftJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const user = await getCurrentUser();
    const isOwner = user && user.id === job.employerId;

    if (job.status !== "active" && !isOwner) {
      return NextResponse.json(
        { error: "This job posting is no longer available" },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("JOB GET ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const body = await req.json();

    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.employerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ++ LIMIT CHECK — only when publishing draft → active
    const isPublishing = job.status !== "active" && body.status === "active";

    if (isPublishing) {
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.employerId, user.id))
        .limit(1);

      const plan = sub?.plan ?? "free";
      const isExpired = sub?.billingCycleEnd
        ? new Date(sub.billingCycleEnd) < new Date()
        : false;
      const effectivePlan = isExpired ? "free" : plan;
      const effectiveLimit = planLimits[effectivePlan] ?? 1;
      const effectiveUsed = sub?.jobsPostedThisMonth ?? 0;

      if (effectiveUsed >= effectiveLimit) {
        return NextResponse.json(
          {
            error: `You've reached your monthly job post limit (${effectiveLimit} post${effectiveLimit !== 1 ? "s" : ""} for the ${effectivePlan} plan). ${effectivePlan === "free" ? "Upgrade your plan to post more jobs." : "Wait for next billing cycle or upgrade your plan."}`,
            limitReached: true,
            plan: effectivePlan,
            limit: effectiveLimit,
            used: effectiveUsed,
          },
          { status: 403 }
        );
      }

      // Increment jobsPostedThisMonth
      if (sub) {
        await db
          .update(subscriptions)
          .set({ jobsPostedThisMonth: effectiveUsed + 1, updatedAt: new Date() })
          .where(eq(subscriptions.employerId, user.id));
      } else {
        await db.insert(subscriptions).values({
          employerId: user.id,
          plan: "free",
          jobsPostedThisMonth: 1,
          billingCycleStart: new Date(),
        });
      }
    }

    // Apply the update
    const [updated] = await db
      .update(jobs)
      .set({
        ...body,
        postedAt: isPublishing ? new Date() : job.postedAt,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("JOB PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;

    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.employerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .update(jobs)
      .set({ status: "draft", updatedAt: new Date() })
      .where(eq(jobs.id, jobId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("JOB DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}