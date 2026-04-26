import { NextResponse } from "next/server";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { employerProfiles, jobs, users } from "@/app/db/schema";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        companyName: employerProfiles.companyName,
        industry: employerProfiles.industry,
        profileImage: employerProfiles.profileImage,
        contact: employerProfiles.contact,
      })
      .from(users)
      .leftJoin(employerProfiles, eq(employerProfiles.userId, users.id))
      .where(eq(users.role, "employer"))
      .orderBy(desc(users.createdAt));

    const withJobCounts = await Promise.all(
      rows.map(async (row) => {
        const [jobCount] = await db
          .select({ count: count() })
          .from(jobs)
          .where(eq(jobs.employerId, row.id));
        return {
          ...row,
          jobPosts: jobCount?.count ?? 0,
        };
      })
    );

    return NextResponse.json(withJobCounts);
  } catch (error) {
    console.error("ADMIN EMPLOYERS GET ERROR:", error);
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
    console.error("ADMIN EMPLOYERS DELETE ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}