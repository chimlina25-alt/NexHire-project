import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/app/db";
import { adminSessions } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("admin_session_token")?.value;

    if (rawToken) {
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      await db
        .delete(adminSessions)
        .where(eq(adminSessions.tokenHash, tokenHash))
        .catch(() => {});
    }

    // Delete the cookie
    cookieStore.delete("admin_session_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    // Even if DB fails, return success so frontend can redirect
    try {
      const cookieStore = await cookies();
      cookieStore.delete("admin_session_token");
    } catch {}
    return NextResponse.json({ success: true });
  }
}