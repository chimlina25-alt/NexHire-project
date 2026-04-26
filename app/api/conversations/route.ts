// app/api/conversations/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, or, and, desc } from "drizzle-orm";
import { db } from "@/app/db";
import {
  conversations,
  employerProfiles,
  jobSeekerProfiles,
  messages,
} from "@/app/db/schema";
import { requireUser } from "@/lib/require-employer";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const list = await db
    .select()
    .from(conversations)
    .where(
      or(
        eq(conversations.employerId, auth.user.id),
        eq(conversations.jobSeekerId, auth.user.id)
      )
    )
    .orderBy(desc(conversations.lastMessageAt));

  const enriched = await Promise.all(
    list.map(async (c) => {
      const peerIsEmployer = c.employerId !== auth.user.id;
      const peerId = peerIsEmployer ? c.employerId : c.jobSeekerId;

      let peerName = "User";
      let peerImage: string | null = null;
      let peerRole = peerIsEmployer ? "Employer" : "Job Seeker";

      if (peerIsEmployer) {
        const [ep] = await db
          .select()
          .from(employerProfiles)
          .where(eq(employerProfiles.userId, peerId))
          .limit(1);
        peerName = ep?.companyName || "Employer";
        peerImage = ep?.profileImage || null;
        peerRole = ep?.industry || "Employer";
      } else {
        const [jsp] = await db
          .select()
          .from(jobSeekerProfiles)
          .where(eq(jobSeekerProfiles.userId, peerId))
          .limit(1);
        peerName = jsp ? `${jsp.firstName} ${jsp.lastName}` : "Job Seeker";
        peerImage = jsp?.profileImage || null;
      }

      const [lastMsg] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, c.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      return {
        id: c.id,
        jobId: c.jobId,
        lastMessageAt: c.lastMessageAt,
        peerId,
        peerName,
        peerImage,
        peerRole,
        lastMessage: lastMsg?.text || null,
        lastMessageAtFormatted: lastMsg?.createdAt || c.lastMessageAt,
      };
    })
  );

  return NextResponse.json(enriched);
}

const createSchema = z.object({
  peerId: z.string().uuid(),
  jobId: z.string().uuid().nullable().optional(),
  initialMessage: z.string().optional(),
});

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Determine which side is the employer based on the current user's role
  const employerId =
    auth.user.role === "employer" ? auth.user.id : parsed.data.peerId;
  const jobSeekerId =
    auth.user.role === "employer" ? parsed.data.peerId : auth.user.id;

  const [existing] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.employerId, employerId),
        eq(conversations.jobSeekerId, jobSeekerId)
      )
    )
    .limit(1);

  let conversationId: string;
  if (existing) {
    conversationId = existing.id;
  } else {
    const [created] = await db
      .insert(conversations)
      .values({
        employerId,
        jobSeekerId,
        jobId: parsed.data.jobId ?? null,
      })
      .returning();
    conversationId = created.id;
  }

  if (parsed.data.initialMessage) {
    await db.insert(messages).values({
      conversationId,
      senderId: auth.user.id,
      text: parsed.data.initialMessage,
    });
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));
  }

  return NextResponse.json({ id: conversationId });
}