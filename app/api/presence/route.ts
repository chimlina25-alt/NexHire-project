import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { userPresence } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .insert(userPresence)
    .values({ userId: user.id, isOnline: true, lastSeenAt: new Date() })
    .onConflictDoUpdate({
      target: userPresence.userId,
      set: { isOnline: true, lastSeenAt: new Date() },
    });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .insert(userPresence)
    .values({ userId: user.id, isOnline: false, lastSeenAt: new Date() })
    .onConflictDoUpdate({
      target: userPresence.userId,
      set: { isOnline: false, lastSeenAt: new Date() },
    });

  return NextResponse.json({ success: true });
}