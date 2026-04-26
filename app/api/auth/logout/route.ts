// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { sessions } from "@/app/db/schema";
import { hashText } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashText(token)));
  }

  cookieStore.delete("session_token");
  cookieStore.delete("reset_token");

  return NextResponse.json({ success: true, next: "/login" });
}