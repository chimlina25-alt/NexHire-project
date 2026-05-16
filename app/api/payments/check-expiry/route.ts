import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { subscriptions, notifications, adminAccounts, employerProfiles } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser("auth");
    if (!user || user.role !== "employer") return NextResponse.json({ ok: true });

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.employerId, user.id))
      .limit(1);

    if (!sub || sub.plan === "free" || !sub.billingCycleEnd) return NextResponse.json({ ok: true });

    const now = new Date();
    const expiry = new Date(sub.billingCycleEnd);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Auto-downgrade if expired
    if (now > expiry) {
      await db
        .update(subscriptions)
        .set({ plan: "free", updatedAt: now })
        .where(eq(subscriptions.employerId, user.id));

      // Check not already notified for expiry
      const [alreadyExpired] = await db
        .select()
        .from(notifications)
        .where(and(eq(notifications.recipientId, user.id), eq(notifications.title, "Subscription Expired")))
        .limit(1);

      if (!alreadyExpired) {
        await db.insert(notifications).values({
          recipientId: user.id,
          type: "system",
          title: "Subscription Expired",
          description: "Your subscription has expired. You've been moved to the Free plan. Renew anytime to post more jobs.",
          link: "/subscription",
          meta: { action: "subscription_expired" } as Record<string, unknown>,
        });

        // Notify admins about expiry
        const [profile] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, user.id)).limit(1);
        const admins = await db.select().from(adminAccounts);
        for (const admin of admins) {
          await db.insert(notifications).values({
            recipientId: admin.id,
            type: "system",
            title: "Employer Subscription Expired",
            description: `${profile?.companyName || "An employer"}'s ${sub.plan} plan has expired and they've been moved to Free.`,
            link: "/admin_subscription",
            meta: { action: "subscription_expired", employerId: user.id } as Record<string, unknown>,
          });
        }
      }

      return NextResponse.json({ ok: true, expired: true });
    }

    // 3-day warning
    if (daysLeft <= 3) {
      const [alreadyWarned] = await db
        .select()
        .from(notifications)
        .where(and(eq(notifications.recipientId, user.id), eq(notifications.title, "⚠️ Subscription Expiring Soon")))
        .limit(1);

      if (!alreadyWarned) {
        await db.insert(notifications).values({
          recipientId: user.id,
          type: "system",
          title: "⚠️ Subscription Expiring Soon",
          description: `Your ${sub.plan} plan expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Renew now to keep your job slots active.`,
          link: "/subscription",
          meta: { action: "expiry_warning", daysLeft } as Record<string, unknown>,
        });
      }
    }

    return NextResponse.json({ ok: true, daysLeft });
  } catch (error) {
    return NextResponse.json({ ok: true });
  }
}