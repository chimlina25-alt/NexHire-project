import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/app/db";
import { adminAccounts, adminSessions } from "@/app/db/schema";

export function hashAdminText(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function createAdminSession(adminId: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashAdminText(rawToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.insert(adminSessions).values({ adminId, tokenHash, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set("admin_session_token", rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return rawToken;
}

export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("admin_session_token")?.value;
    if (!rawToken) return null;

    const tokenHash = hashAdminText(rawToken);

    const [session] = await db
      .select()
      .from(adminSessions)
      .where(
        and(
          eq(adminSessions.tokenHash, tokenHash),
          gt(adminSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) return null;

    const [admin] = await db
      .select()
      .from(adminAccounts)
      .where(eq(adminAccounts.id, session.adminId))
      .limit(1);

    return admin ?? null;
  } catch (error) {
    console.error("getCurrentAdmin error:", error);
    return null;
  }
}

export async function clearAdminSession() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("admin_session_token")?.value;
    if (rawToken) {
      const tokenHash = hashAdminText(rawToken);
      await db
        .delete(adminSessions)
        .where(eq(adminSessions.tokenHash, tokenHash));
    }
    cookieStore.delete("admin_session_token");
  } catch (error) {
    console.error("clearAdminSession error:", error);
  }
}