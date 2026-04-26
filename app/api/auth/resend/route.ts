import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { createOtp } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  type: z.enum([
    "signup",
    "login",
    "forgot_password",
    "google_signup",
    "google_login",
  ]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const type = parsed.data.type;

    if (type === "signup") {
      const code = await createOtp({
        email,
        purpose: "signup",
        data: {},
      });

      await sendOtpEmail(email, code, "Verify your NexHire signup");
      return NextResponse.json({ success: true });
    }

    if (type === "google_signup") {
      const code = await createOtp({
        email,
        purpose: "google_signup",
        data: {},
      });

      await sendOtpEmail(email, code, "Verify your NexHire Google signup");
      return NextResponse.json({ success: true });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (type === "login") {
      const code = await createOtp({
        email,
        purpose: "login",
        data: { userId: user.id },
      });

      await sendOtpEmail(email, code, "Verify your NexHire login");
      return NextResponse.json({ success: true });
    }

    if (type === "google_login") {
      const code = await createOtp({
        email,
        purpose: "google_login",
        data: { userId: user.id },
      });

      await sendOtpEmail(email, code, "Verify your NexHire Google login");
      return NextResponse.json({ success: true });
    }

    const code = await createOtp({
      email,
      purpose: "forgot_password",
      data: { userId: user.id },
    });

    await sendOtpEmail(email, code, "Reset your NexHire password");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RESEND ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}