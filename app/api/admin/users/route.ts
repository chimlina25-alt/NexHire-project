import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { jobSeekerProfiles, users } from "@/app/db/schema";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        onboardingCompleted: users.onboardingCompleted,
        firstName: jobSeekerProfiles.firstName,
        lastName: jobSeekerProfiles.lastName,
        profileImage: jobSeekerProfiles.profileImage,
      })
      .from(users)
      .leftJoin(jobSeekerProfiles, eq(jobSeekerProfiles.userId, users.id))
      .where(eq(users.role, "job_seeker"))
      .orderBy(desc(users.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("ADMIN USERS GET ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await db.delete(users).where(eq(users.id, userId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ADMIN USERS DELETE ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}