import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { adminAccounts, adminConversations } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admins = await db.select().from(adminAccounts);
  if (!admins.length) return NextResponse.json([]);

  // There is only ever one admin conversation per user
  const [existing] = await db
    .select()
    .from(adminConversations)
    .where(eq(adminConversations.userId, user.id))
    .limit(1);

  const admin = admins[0];

  // If a real conversation exists, return it with the real ID
  if (existing) {
    return NextResponse.json([
      {
        id: existing.id,           // real UUID — frontend knows it's real
        adminId: existing.adminId,
        userId: user.id,
        isAdminConv: true,
        displayName: admin.name || "Support",
        profileImage: null,
        lastMessageAt: existing.lastMessageAt || new Date().toISOString(),
        isNew: false,
        archived: existing.archived || false,
      },
    ]);
  }

  // No conversation yet — return a placeholder with a clearly fake ID
  return NextResponse.json([
    {
      id: `admin_${admin.id}`,     // fake ID — frontend detects via startsWith("admin_")
      adminId: admin.id,
      userId: user.id,
      isAdminConv: true,
      displayName: admin.name || "Support",
      profileImage: null,
      lastMessageAt: new Date().toISOString(),
      isNew: true,
      archived: false,
    },
  ]);
}