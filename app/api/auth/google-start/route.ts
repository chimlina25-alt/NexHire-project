import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/google-auth";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { createOtp } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email?.toLowerCase();

    if (!email) {
      return NextResponse.redirect(
        new URL("/login?error=NoGoogleEmail", req.url)
      );
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") === "signup" ? "signup" : "login";

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (mode === "signup") {
      const code = await createOtp({
        email,
        purpose: "google_signup",
        data: {},
      });

      await sendOtpEmail(email, code, "Verify your NexHire Google signup");

      return NextResponse.redirect(
        new URL(
          `/verify?type=google_signup&email=${encodeURIComponent(email)}`,
          req.url
        )
      );
    }

    if (!existingUser) {
      return NextResponse.redirect(
        new URL("/login?error=GoogleAccountNotFound", req.url)
      );
    }

    const code = await createOtp({
      email,
      purpose: "google_login",
      data: {
        userId: existingUser.id,
      },
    });

    await sendOtpEmail(email, code, "Verify your NexHire Google login");

    return NextResponse.redirect(
      new URL(
        `/verify?type=google_login&email=${encodeURIComponent(email)}`,
        req.url
      )
    );
  } catch (error) {
    console.error("GOOGLE START ERROR:", error);

    const message =
      error instanceof Error
        ? encodeURIComponent(error.message)
        : "GoogleStartFailed";

    return NextResponse.redirect(
      new URL(`/login?error=${message}`, req.url)
    );
  }
}
