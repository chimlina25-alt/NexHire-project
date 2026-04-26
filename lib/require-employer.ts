// lib/require-employer.ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { employerProfiles } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function requireEmployer() {
  const user = await getCurrentUser("auth");

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (user.role !== "employer") {
    return {
      error: NextResponse.json(
        { error: "Forbidden: employer access only" },
        { status: 403 }
      ),
    };
  }

  const [profile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, user.id))
    .limit(1);

  return { user, profile: profile ?? null };
}

export async function requireUser() {
  const user = await getCurrentUser("auth");
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user };
}