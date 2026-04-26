import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/app/db";
import { otpCodes, sessions, users } from "@/app/db/schema";

export function hashText(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}



export async function createSession(
  userId: string,
  type: "auth" | "reset" = "auth"
) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashText(rawToken);
  const expiresAt =
    type === "auth"
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 15 * 60 * 1000);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    type,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set(type === "auth" ? "session_token" : "reset_token", rawToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearResetSession() {
  const cookieStore = await cookies();
  cookieStore.delete("reset_token");
}


export async function getCurrentUser(type: "auth" | "reset" = "auth") {
  const cookieStore = await cookies();

  const rawToken = cookieStore.get(
    type === "auth" ? "session_token" : "reset_token"
  )?.value;

  if (!rawToken) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.tokenHash, hashText(rawToken)),
        eq(sessions.type, type),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!session) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}

export function getRedirectByUser(user: {
  role: "employer" | "job_seeker" | null;
  onboardingCompleted: boolean;
}) {
  if (!user.role) return "/role_choosing";

  if (!user.onboardingCompleted) {
    return user.role === "employer" ? "/employer" : "/job_seeker";
  }

  return user.role === "employer"
    ? "/dashboard"
    : "/home_page";
}
export async function createOtp(params: {
  email: string;
  purpose: "signup" | "login" | "forgot_password" | "google_signup" | "google_login";
  data?: Record<string, any>;
}) {
  const code = generateOtp();

  await db.insert(otpCodes).values({
    email: params.email.toLowerCase(),
    codeHash: hashText(code),
    purpose: params.purpose,
    data: params.data ?? null,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  return code;
}

export async function verifyOtp(params: {
  email: string;
  code: string;
  purpose: "signup" | "login" | "forgot_password" | "google_signup" | "google_login";
}) {
  const [record] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, params.email.toLowerCase()),
        eq(otpCodes.codeHash, hashText(params.code)),
        eq(otpCodes.purpose, params.purpose),
        isNull(otpCodes.usedAt),
        gt(otpCodes.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!record) return null;

  await db
    .update(otpCodes)
    .set({ usedAt: new Date() })
    .where(eq(otpCodes.id, record.id));

  return record;
}