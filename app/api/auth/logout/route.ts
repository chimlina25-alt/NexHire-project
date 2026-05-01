import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/app/db";
import { sessions } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { hashText } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("session_token")?.value;

    if (rawToken) {
      await db
        .delete(sessions)
        .where(eq(sessions.tokenHash, hashText(rawToken)));
      cookieStore.delete("session_token");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}