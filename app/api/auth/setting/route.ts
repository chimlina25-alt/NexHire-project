// app/api/auth/setting/route.ts
// FULL REPLACEMENT — handles password change, email update, account deletion

import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { users, sessions, jobApplications, savedJobs, notifications, conversations, messages } from "@/app/db/schema";
import { getCurrentUser, hashPassword, comparePassword } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  // Return current user's email for settings page
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    email: user.email,
    role: user.role,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser("auth");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // ── Change password ──────────────────────────────────────────────────────
  if (action === "change_password") {
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both passwords are required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: "Account uses Google sign-in — password change not available" }, { status: 400 });
    }

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, user.id));

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  }

  // ── Update email ─────────────────────────────────────────────────────────
  if (action === "update_email") {
    const { newEmail } = body;

    if (!newEmail || !newEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalised = newEmail.toLowerCase().trim();

    // Check not already taken
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalised))
      .limit(1);

    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    await db
      .update(users)
      .set({ email: normalised, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, message: "Email updated successfully" });
  }

  // ── Delete account ────────────────────────────────────────────────────────
  if (action === "delete_account") {
    // Delete in safe order to avoid FK violations
    await db.delete(notifications).where(eq(notifications.recipientId, user.id));
    await db.delete(savedJobs).where(eq(savedJobs.jobSeekerId, user.id));
    await db.delete(jobApplications).where(eq(jobApplications.jobSeekerId, user.id));
    await db.delete(sessions).where(eq(sessions.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));

    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.delete("session_token");

    return NextResponse.json({ success: true, message: "Account deleted" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}