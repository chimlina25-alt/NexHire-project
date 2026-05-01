import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { subscriptions, notifications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.employerId, user.id))
    .limit(1);

  if (!sub) {
    [sub] = await db
      .insert(subscriptions)
      .values({ employerId: user.id, plan: "free", jobsPostedThisMonth: 0, billingCycleStart: new Date() })
      .returning();
  }

  return NextResponse.json(sub);
}

export async function POST(req: Request) {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();
  if (!["free", "standard", "premium"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  let [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.employerId, user.id))
    .limit(1);

  if (sub) {
    await db.update(subscriptions)
      .set({ plan, jobsPostedThisMonth: 0, billingCycleStart: new Date(), updatedAt: new Date() })
      .where(eq(subscriptions.employerId, user.id));
  } else {
    await db.insert(subscriptions)
      .values({ employerId: user.id, plan, jobsPostedThisMonth: 0, billingCycleStart: new Date() });
  }

  const planNames: Record<string, string> = { free: "Free", standard: "Standard", premium: "Premium" };

  await db.insert(notifications).values({
    recipientId: user.id,
    type: "system",
    title: `Your ${planNames[plan]} Plan has been activated!`,
    description: `You now have access to ${plan === "premium" ? "7" : plan === "standard" ? "3" : "1"} active job slot(s) per month.`,
    link: "/subscription",
  });

  return NextResponse.json({ success: true, plan });
}