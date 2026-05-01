import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { users, sessions } from "@/app/db/schema";
import { getCurrentUser, hashPassword, clearResetSession, hashText } from "@/lib/auth";
import { cookies } from "next/headers";

const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((v) => v.password === v.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
  return NextResponse.json(
    { error: parsed.error.issues[0]?.message || "Invalid data" },
    { status: 400 }
  );
}

  const user = await getCurrentUser("reset");
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  const newHash = await hashPassword(parsed.data.password);

  await db.update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  // Delete reset session
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("reset_token")?.value;
  if (rawToken) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashText(rawToken)));
    cookieStore.delete("reset_token");
  }

  return NextResponse.json({ success: true, next: "/password_successful" });
}