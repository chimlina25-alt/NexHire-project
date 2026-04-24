import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  role: z.enum(["employer", "job_seeker"]),
});

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json(
        { error: "User session not found. Please verify again." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await db
      .update(users)
      .set({
        role: parsed.data.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, me.id));

    return NextResponse.json({
      success: true,
      next: parsed.data.role === "employer" ? "/employer" : "/job_seeker",
    });
  } catch (error) {
    console.error("SELECT ROLE ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
