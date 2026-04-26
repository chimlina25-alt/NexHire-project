// app/api/notifications/[id]/read/route.ts
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { notifications } from "@/app/db/schema";
import { requireUser } from "@/lib/require-employer";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireUser();
  if (auth.error) return auth.error;

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, id),
        eq(notifications.recipientId, auth.user.id)
      )
    );

  return NextResponse.json({ success: true });
}