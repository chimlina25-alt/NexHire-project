import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/app/db";
import {
  conversations,
  employerProfiles,
  jobSeekerProfiles,
} from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select({
        id: conversations.id,
        employerId: conversations.employerId,
        jobSeekerId: conversations.jobSeekerId,
        jobId: conversations.jobId,
        lastMessageAt: conversations.lastMessageAt,
        employerName: employerProfiles.companyName,
        employerImage: employerProfiles.profileImage,
        seekerFirstName: jobSeekerProfiles.firstName,
        seekerLastName: jobSeekerProfiles.lastName,
        seekerImage: jobSeekerProfiles.profileImage,
      })
      .from(conversations)
      .innerJoin(
        employerProfiles,
        eq(employerProfiles.userId, conversations.employerId)
      )
      .innerJoin(
        jobSeekerProfiles,
        eq(jobSeekerProfiles.userId, conversations.jobSeekerId)
      )
      .where(
        me.role === "employer"
          ? eq(conversations.employerId, me.id)
          : eq(conversations.jobSeekerId, me.id)
      )
      .orderBy(desc(conversations.lastMessageAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const employerId = me.role === "employer" ? me.id : body.employerId;
    const jobSeekerId = me.role === "job_seeker" ? me.id : body.jobSeekerId;
    const jobId = body.jobId ?? null;

    if (!employerId || !jobSeekerId) {
      return NextResponse.json(
        { error: "Missing employer or job seeker" },
        { status: 400 }
      );
    }

    const existingRows = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.employerId, employerId),
          eq(conversations.jobSeekerId, jobSeekerId),
          jobId ? eq(conversations.jobId, jobId) : isNull(conversations.jobId)
        )
      )
      .limit(1);

    const existing = existingRows[0];
    if (existing) {
      return NextResponse.json(existing);
    }

    const [conversation] = await db
      .insert(conversations)
      .values({
        employerId,
        jobSeekerId,
        jobId,
        lastMessageAt: new Date(),
      })
      .returning();

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("CREATE CONVERSATION ERROR:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
