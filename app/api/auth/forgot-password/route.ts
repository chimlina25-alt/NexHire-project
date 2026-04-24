import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { createOtp } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user) {
    const code = await createOtp({
      email,
      purpose: "forgot_password",
      data: { userId: user.id },
    });

    await sendOtpEmail(email, code, "Reset your NexHire password");
  }

  return NextResponse.json({
  success: true,
  next: `/verify?type=forgot_password&email=${encodeURIComponent(email)}`,
});

}
