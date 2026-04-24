import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { clearResetSession, getCurrentUser, hashPassword } from "@/lib/auth";

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function POST(req: Request) {
  const me = await getCurrentUser("reset");
  if (!me) {
    return NextResponse.json({ error: "Reset session expired" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid password data" }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, me.id));

  await clearResetSession();

  return NextResponse.json({
    success: true,
    next: "/reset_password_success",
  });
}
