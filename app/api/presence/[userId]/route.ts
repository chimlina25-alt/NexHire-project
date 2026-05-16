import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { userPresence } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;

  const [presence] = await db
    .select()
    .from(userPresence)
    .where(eq(userPresence.userId, userId))
    .limit(1);

  if (!presence) {
    return NextResponse.json({ isOnline: false, lastSeenAt: null });
  }

  // Consider online if heartbeat within last 35 seconds
  const isOnline =
    presence.isOnline &&
    Date.now() - new Date(presence.lastSeenAt).getTime() < 35000;

  return NextResponse.json({
    isOnline,
    lastSeenAt: presence.lastSeenAt,
  });
}