import { NextResponse } from "next/server";
import { eq, count, desc, ne, sql, and, gte } from "drizzle-orm";
import { db } from "@/app/db";
import {
  users,
  jobs,
  employerProfiles,
  subscriptions,
} from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Total users (all roles)
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users);

    // Active jobs
    const [activeJobsResult] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.status, "active"));

    // Total employers
    const [employersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "employer"));

    // Total job seekers
    const [jobSeekersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "job_seeker"));

    // Revenue from subscriptions
    const [premiumCount] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.plan, "premium"));

    const [standardCount] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.plan, "standard"));

    const revenue =
      Number(premiumCount.count) * 10.99 +
      Number(standardCount.count) * 4.99;

    // Top job categories with real counts
    const categoryRows = await db
      .select({
        category: jobs.category,
        cnt: count(),
      })
      .from(jobs)
      .groupBy(jobs.category)
      .orderBy(desc(count()))
      .limit(6);

    const totalCatJobs = categoryRows.reduce((s, r) => s + Number(r.cnt), 0);
    const categoryBreakdown = categoryRows.map((r) => ({
      name: r.category,
      count: Number(r.cnt),
      pct: totalCatJobs > 0 ? Math.round((Number(r.cnt) / totalCatJobs) * 100) : 0,
    }));

    // Recent paid subscriptions with company name
    const recentSubs = await db
      .select({
        id: subscriptions.id,
        plan: subscriptions.plan,
        updatedAt: subscriptions.updatedAt,
        companyName: employerProfiles.companyName,
      })
      .from(subscriptions)
      .leftJoin(
        employerProfiles,
        eq(employerProfiles.userId, subscriptions.employerId)
      )
      .where(ne(subscriptions.plan, "free"))
      .orderBy(desc(subscriptions.updatedAt))
      .limit(5);

    const recentSubscriptions = recentSubs.map((s) => ({
      id: s.id,
      name: s.companyName || "Unknown Company",
      plan: s.plan === "premium" ? "Premium" : "Standard",
      amount: s.plan === "premium" ? "+$10.99" : "+$4.99",
    }));

    // Weekly job posts — real data grouped by day of week
    // Get jobs posted in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Current week jobs (last 7 days)
    const currentWeekJobs = await db
      .select({
        dayOfWeek: sql<number>`EXTRACT(DOW FROM ${jobs.createdAt})`,
        cnt: count(),
      })
      .from(jobs)
      .where(gte(jobs.createdAt, sevenDaysAgo))
      .groupBy(sql`EXTRACT(DOW FROM ${jobs.createdAt})`);

    // Previous week jobs (7-14 days ago)
    const previousWeekJobs = await db
      .select({
        dayOfWeek: sql<number>`EXTRACT(DOW FROM ${jobs.createdAt})`,
        cnt: count(),
      })
      .from(jobs)
      .where(
        and(
          gte(jobs.createdAt, fourteenDaysAgo),
          sql`${jobs.createdAt} < ${sevenDaysAgo}`
        )
      )
      .groupBy(sql`EXTRACT(DOW FROM ${jobs.createdAt})`);

    // DOW: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
    // We display Mon-Sun
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dowOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon first

    const currentMap = new Map(
      currentWeekJobs.map((r) => [Number(r.dayOfWeek), Number(r.cnt)])
    );
    const previousMap = new Map(
      previousWeekJobs.map((r) => [Number(r.dayOfWeek), Number(r.cnt)])
    );

    const weeklyJobPosts = dayLabels.map((day, i) => ({
      day,
      current: currentMap.get(dowOrder[i]) ?? 0,
      previous: previousMap.get(dowOrder[i]) ?? 0,
    }));

    // Revenue trend — last 9 weeks for area chart
    const nineWeeksAgo = new Date();
    nineWeeksAgo.setDate(nineWeeksAgo.getDate() - 63);

    const weeklyRevenueSubs = await db
      .select({
        plan: subscriptions.plan,
        updatedAt: subscriptions.updatedAt,
      })
      .from(subscriptions)
      .where(
        and(
          ne(subscriptions.plan, "free"),
          gte(subscriptions.updatedAt, nineWeeksAgo)
        )
      );

    // Build 9-week revenue buckets
    const weekBuckets: number[] = Array(9).fill(0);
    const now = Date.now();

    weeklyRevenueSubs.forEach((sub) => {
      const msAgo = now - new Date(sub.updatedAt).getTime();
      const weeksAgo = Math.floor(msAgo / (7 * 24 * 60 * 60 * 1000));
      const bucketIndex = 8 - weeksAgo; // most recent = index 8
      if (bucketIndex >= 0 && bucketIndex < 9) {
        weekBuckets[bucketIndex] +=
          sub.plan === "premium" ? 10.99 : 4.99;
      }
    });

    const revenueTrend = weekBuckets.map((value, i) => ({
      name: `W${i + 1}`,
      value: Math.round(value * 100) / 100,
    }));

    // Total jobs posted (all time)
    const [totalJobsResult] = await db
      .select({ count: count() })
      .from(jobs);

    // Total applications
    // (import jobApplications if you want this stat)

    return NextResponse.json({
      totalUsers: Number(totalUsersResult.count),
      activeJobs: Number(activeJobsResult.count),
      employers: Number(employersResult.count),
      jobSeekers: Number(jobSeekersResult.count),
      totalJobs: Number(totalJobsResult.count),
      revenue: Number(revenue.toFixed(2)),
      categoryBreakdown,
      recentSubscriptions,
      weeklyJobPosts,
      revenueTrend,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}