import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { comparePassword, createOtp } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid login data" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account uses Google login. Please sign in with Google." },
        { status: 400 }
      );
    }

    const isValid = await comparePassword(
      parsed.data.password,
      user.passwordHash
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const code = await createOtp({
      email,
      purpose: "login",
      data: {
        userId: user.id,
      },
    });

    await sendOtpEmail(email, code, "Verify your NexHire login");

    return NextResponse.json({
      success: true,
      next: `/verify?type=login&email=${encodeURIComponent(email)}`,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}