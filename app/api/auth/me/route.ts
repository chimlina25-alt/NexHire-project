// app/api/auth/me/route.ts
// FULL REPLACEMENT
// Messages page reads: data.userId, data.role, data.email

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    userId: user.id,       // messages page expects "userId" not "id"
    id: user.id,
    email: user.email,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
    isAdmin: user.isAdmin,
  });
}