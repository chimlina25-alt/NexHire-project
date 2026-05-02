import { cookies } from "next/headers";
import { createHash } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/app/db";
import { sessions, users } from "@/app/db/schema";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("session_token")?.value;
    if (!rawToken) return null;

    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
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
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}