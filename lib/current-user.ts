import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/app/db";
import { sessions, users } from "@/app/db/schema";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  const [session] = await db
    .select({
      sessionId: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      id: users.id,
      email: users.email,
      role: users.role,
      isEmailVerified: users.isEmailVerified,
      onboardingCompleted: users.onboardingCompleted,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return session ?? null;
}

export async function requireUser(requiredRole?: "employer" | "job_seeker") {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  if (requiredRole && user.role !== requiredRole) {
    return {
      error: new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { user };
}
