import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { subscriptions, notifications } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ subId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subId } = await params;
    const body = await req.json();

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subId))
      .limit(1);

    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db
      .update(subscriptions)
      .set({
        jobsPostedThisMonth: body.posts ?? sub.jobsPostedThisMonth,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ subId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subId } = await params;

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subId))
      .limit(1);

    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Downgrade to free instead of deleting
    await db
      .update(subscriptions)
      .set({
        plan: "free",
        jobsPostedThisMonth: 0,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subId));

    // Notify employer
    await db.insert(notifications).values({
      recipientId: sub.employerId,
      type: "system",
      title: "Subscription cancelled by admin",
      description:
        "Your subscription has been cancelled by an administrator. You have been moved to the Free plan.",
      link: "/subscription",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}