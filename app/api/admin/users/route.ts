import { NextResponse } from "next/server";
import { eq, count, desc } from "drizzle-orm";
import { db } from "@/app/db";
import { users, jobSeekerProfiles, jobApplications } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "All";

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        onboardingCompleted: users.onboardingCompleted,
        createdAt: users.createdAt,
        firstName: jobSeekerProfiles.firstName,
        lastName: jobSeekerProfiles.lastName,
        profileImage: jobSeekerProfiles.profileImage,
      })
      .from(users)
      .leftJoin(jobSeekerProfiles, eq(jobSeekerProfiles.userId, users.id))
      .where(eq(users.role, "job_seeker"))
      .orderBy(desc(users.createdAt));

    // Filter by search
    let filtered = allUsers;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase().includes(q)
      );
    }

    // ++ FIXED — helper to resolve status correctly
    // Suspended = both flags false + role is set (was previously onboarded)
    // Active    = both flags true
    // Inactive  = not yet verified/onboarded (new signup in progress)
    const resolveStatus = (u: typeof allUsers[number]) => {
      if (!u.isEmailVerified && !u.onboardingCompleted && u.role !== null) {
        return "Suspended";
      }
      if (u.isEmailVerified && u.onboardingCompleted) {
        return "Active";
      }
      return "Inactive";
    };

    // Filter by status
    if (filter === "Active") {
      filtered = filtered.filter((u) => resolveStatus(u) === "Active");
    } else if (filter === "Inactive") {
      filtered = filtered.filter((u) => resolveStatus(u) === "Inactive");
    } else if (filter === "Suspended") {
      filtered = filtered.filter((u) => resolveStatus(u) === "Suspended");
    }

    // Add application counts
    const withApps = await Promise.all(
      filtered.map(async (u) => {
        const [appCount] = await db
          .select({ count: count() })
          .from(jobApplications)
          .where(eq(jobApplications.jobSeekerId, u.id));

        return {
          ...u,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
          status: resolveStatus(u), // ++ FIXED — use resolveStatus
          applications: Number(appCount.count),
        };
      })
    );

    return NextResponse.json(withApps);
  } catch (error) {
    console.error("ADMIN USERS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}