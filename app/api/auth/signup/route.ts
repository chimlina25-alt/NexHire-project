import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { createOtp, hashPassword } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const code = await createOtp({
      email,
      purpose: "signup",
      data: { passwordHash },
    });

    await sendOtpEmail(email, code, "Verify your NexHire signup");

    return NextResponse.json({
  success: true,
  next: `/verify?type=signup&email=${encodeURIComponent(email)}`,
});

  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

