import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { createSession, verifyOtp } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum([
    "signup",
    "login",
    "forgot_password",
    "google_signup",
    "google_login",
  ]),
});

function getRedirectByUser(user: {
  role: "employer" | "job_seeker" | null;
  onboardingCompleted: boolean;
}) {
  if (!user.role) return "/role_choosing";

  if (!user.onboardingCompleted) {
    return user.role === "employer" ? "/employer" : "/job_seeker";
  }

  return user.role === "employer" ? "/dashboard" : "/home_page";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid verify data" }, { status: 400 });
    }

    const record = await verifyOtp({
      email: parsed.data.email,
      code: parsed.data.code,
      purpose: parsed.data.type,
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    if (parsed.data.type === "signup") {
      const [user] = await db
        .insert(users)
        .values({
          email: parsed.data.email.toLowerCase(),
          passwordHash: String(record.data?.passwordHash || ""),
          provider: "credentials",
          isEmailVerified: true,
        })
        .returning();

      await createSession(user.id, "auth");

      return NextResponse.json({ success: true, next: "/role_choosing" });
    }

    if (parsed.data.type === "google_signup") {
      const email = parsed.data.email.toLowerCase();

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      let user = existingUser;

      if (!user) {
        [user] = await db
          .insert(users)
          .values({
            email,
            passwordHash: null,
            provider: "google",
            isEmailVerified: true,
          })
          .returning();
      }

      await createSession(user.id, "auth");

      return NextResponse.json({ success: true, next: "/role_choosing" });
    }

    if (parsed.data.type === "login") {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, String(record.data?.userId || "")))
        .limit(1);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await createSession(user.id, "auth");

      return NextResponse.json({
        success: true,
        next: getRedirectByUser(user),
      });
    }

    if (parsed.data.type === "google_login") {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, String(record.data?.userId || "")))
        .limit(1);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await createSession(user.id, "auth");

      return NextResponse.json({
        success: true,
        next: getRedirectByUser(user),
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, String(record.data?.userId || "")))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await createSession(user.id, "reset");

    return NextResponse.json({
      success: true,
      next: "/reset_password",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}