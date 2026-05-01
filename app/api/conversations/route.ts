import { NextResponse } from "next/server";
import { eq, or, desc, and } from "drizzle-orm";
import { db } from "@/app/db";
import { conversations, messages, users, employerProfiles, jobSeekerProfiles } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let convs;
  if (user.role === "employer") {
    convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.employerId, user.id))
      .orderBy(desc(conversations.lastMessageAt));
  } else {
    convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.jobSeekerId, user.id))
      .orderBy(desc(conversations.lastMessageAt));
  }

  const enriched = await Promise.all(
    convs.map(async (conv) => {
      const otherId = user.role === "employer" ? conv.jobSeekerId : conv.employerId;

      const [otherUser] = await db.select().from(users).where(eq(users.id, otherId)).limit(1);

      let otherName = otherUser?.email || "Unknown";
      let otherImage: string | null = null;

      if (user.role === "employer") {
        const [seekerProfile] = await db
          .select()
          .from(jobSeekerProfiles)
          .where(eq(jobSeekerProfiles.userId, otherId))
          .limit(1);
        if (seekerProfile) {
          otherName = `${seekerProfile.firstName} ${seekerProfile.lastName}`;
          otherImage = seekerProfile.profileImage;
        }
      } else {
        const [empProfile] = await db
          .select()
          .from(employerProfiles)
          .where(eq(employerProfiles.userId, otherId))
          .limit(1);
        if (empProfile) {
          otherName = empProfile.companyName;
          otherImage = empProfile.profileImage;
        }
      }

      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      return { ...conv, otherName, otherImage, otherUserId: otherId, lastMessage };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { otherUserId, jobId } = body;

  if (!otherUserId) return NextResponse.json({ error: "otherUserId required" }, { status: 400 });

  const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId)).limit(1);
  if (!otherUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let employerId: string;
  let jobSeekerId: string;

  if (user.role === "employer") {
    employerId = user.id;
    jobSeekerId = otherUserId;
  } else {
    employerId = otherUserId;
    jobSeekerId = user.id;
  }

  // Check existing
  const existing = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.employerId, employerId),
        eq(conversations.jobSeekerId, jobSeekerId)
      )
    )
    .limit(1);

  if (existing[0]) return NextResponse.json(existing[0]);

  const [conv] = await db
    .insert(conversations)
    .values({ employerId, jobSeekerId, jobId: jobId || null })
    .returning();

  return NextResponse.json(conv, { status: 201 });
}