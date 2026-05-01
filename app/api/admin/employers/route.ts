import { NextResponse } from "next/server";
import { eq, count, desc } from "drizzle-orm";
import { db } from "@/app/db";
import { users, employerProfiles, jobs, subscriptions } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const employers = await db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        isEmailVerified: users.isEmailVerified,
        companyName: employerProfiles.companyName,
        industry: employerProfiles.industry,
        currentAddress: employerProfiles.currentAddress,
        profileImage: employerProfiles.profileImage,
        companySize: employerProfiles.companySize,
      })
      .from(users)
      .leftJoin(employerProfiles, eq(employerProfiles.userId, users.id))
      .where(eq(users.role, "employer"))
      .orderBy(desc(users.createdAt));

    // Search filter
    let filtered = employers;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          (e.companyName || "").toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }

    // Add job counts and subscription plan
    const withData = await Promise.all(
      filtered.map(async (e) => {
        const [jobCount] = await db
          .select({ count: count() })
          .from(jobs)
          .where(eq(jobs.employerId, e.id));

        const [sub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.employerId, e.id))
          .limit(1);

        let planLabel = "Free";
        if (sub?.plan === "premium") planLabel = "Premium";
        else if (sub?.plan === "standard") planLabel = "Standard";

        return {
          ...e,
          jobs: Number(jobCount.count),
          plan: planLabel,
          status: e.isEmailVerified ? "Active" : "Inactive",
        };
      })
    );

    return NextResponse.json(withData);
  } catch (error) {
    console.error("ADMIN EMPLOYERS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}