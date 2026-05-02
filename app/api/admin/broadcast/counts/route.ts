import { NextResponse } from "next/server";
import { eq, count } from "drizzle-orm";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [allCount] = await db
      .select({ count: count() })
      .from(users);

    const [employerCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "employer"));

    const [jobSeekerCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "job_seeker"));

    return NextResponse.json({
      all: Number(allCount.count),
      employers: Number(employerCount.count),
      jobSeekers: Number(jobSeekerCount.count),
    });
  } catch (error) {
    console.error("BROADCAST COUNTS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}