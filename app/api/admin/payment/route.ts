import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { paymentRequests, employerProfiles, users, subscriptions } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const requests = await db
      .select()
      .from(paymentRequests)
      .orderBy(desc(paymentRequests.createdAt));

    const withProfiles = await Promise.all(
      requests.map(async (r) => {
        const [profile] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, r.employerId)).limit(1);
        const [u] = await db.select().from(users).where(eq(users.id, r.employerId)).limit(1);
        const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.employerId, r.employerId)).limit(1);
        return {
          ...r,
          companyName: profile?.companyName || "Unknown",
          email: u?.email || "",
          currentPlan: sub?.plan || "free",
          billingCycleStart: sub?.billingCycleStart || null,
          billingCycleEnd: sub?.billingCycleEnd || null,
        };
      })
    );

    return NextResponse.json(withProfiles);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}