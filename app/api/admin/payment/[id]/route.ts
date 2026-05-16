import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { paymentRequests, subscriptions, notifications, users, adminAccounts, employerProfiles } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";
import nodemailer from "nodemailer";

async function sendEmail(to: string, subject: string, html: string) {
  const t = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER!, pass: process.env.GMAIL_APP_PASSWORD! } });
  await t.sendMail({ from: process.env.GMAIL_FROM || process.env.GMAIL_USER!, to, subject, html });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { action, note } = await req.json();

    const [request] = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id)).limit(1);
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (request.status === "approved") return NextResponse.json({ error: "Already approved" }, { status: 400 });
    const [u] = await db.select().from(users).where(eq(users.id, request.employerId)).limit(1);
    const [profile] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, request.employerId)).limit(1);

    if (action === "approve") {
      const now = new Date();
      const billingEnd = new Date(now);
      billingEnd.setMonth(billingEnd.getMonth() + 1);
      const plan = request.plan as "standard" | "premium";

      // Upsert subscription
      const [existing] = await db.select().from(subscriptions).where(eq(subscriptions.employerId, request.employerId)).limit(1);
      if (existing) {
        await db.update(subscriptions).set({ plan, jobsPostedThisMonth: 0, billingCycleStart: now, billingCycleEnd: billingEnd, updatedAt: now }).where(eq(subscriptions.employerId, request.employerId));
      } else {
        await db.insert(subscriptions).values({ employerId: request.employerId, plan, jobsPostedThisMonth: 0, billingCycleStart: now, billingCycleEnd: billingEnd });
      }

      await db.update(paymentRequests).set({ status: "approved", approvedAt: now, note: note || null, updatedAt: now }).where(eq(paymentRequests.id, id));

      // Notify employer
      await db.insert(notifications).values({
        recipientId: request.employerId,
        type: "system",
        title: "🎉 Subscription Activated!",
        description: `Your ${plan} plan is now active until ${billingEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. Transaction: ${request.transactionNumber}.`,
        link: "/subscription",
        meta: { action: "subscription_approved", transactionNumber: request.transactionNumber } as Record<string, unknown>,
      });

      if (u) {
        try {
          await sendEmail(u.email, "🎉 NexHire Subscription Activated", `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
              <h2 style="color:#00a37b;">Subscription Activated!</h2>
              <p>Your <strong>${plan}</strong> plan is now active.</p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:20px 0;">
                <p style="margin:0 0 8px;color:#166534;"><strong>Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
                <p style="margin:0 0 8px;color:#166534;"><strong>Active until:</strong> ${billingEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                <p style="margin:0;color:#166534;"><strong>Transaction:</strong> ${request.transactionNumber}</p>
              </div>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nexhire.com"}/dashboard" style="display:inline-block;background:#00a37b;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a>
            </div>
          `);
        } catch (e) { console.error("Email failed:", e); }
      }

    } else if (action === "reject") {
      await db.update(paymentRequests).set({ status: "rejected", note: note || null, updatedAt: new Date() }).where(eq(paymentRequests.id, id));

      await db.insert(notifications).values({
        recipientId: request.employerId,
        type: "system",
        title: "Payment Not Confirmed",
        description: `Your payment for the ${request.plan} plan (Transaction: ${request.transactionNumber}) could not be confirmed.${note ? ` Reason: ${note}` : ""} Please try again.`,
        link: "/subscription",
        meta: { action: "payment_rejected", transactionNumber: request.transactionNumber } as Record<string, unknown>,
      });

      if (u) {
        try {
          await sendEmail(u.email, "Payment Not Confirmed — NexHire", `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
              <h2 style="color:#dc2626;">Payment Not Confirmed</h2>
              <p>Your payment for the <strong>${request.plan}</strong> plan could not be confirmed.</p>
              <p><strong>Transaction:</strong> ${request.transactionNumber}</p>
              ${note ? `<div style="background:#fff5f5;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0;"><p style="margin:0;color:#dc2626;"><strong>Reason:</strong> ${note}</p></div>` : ""}
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nexhire.com"}/subscription" style="display:inline-block;background:#00a37b;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Try Again</a>
            </div>
          `);
        } catch (e) { console.error("Email failed:", e); }
      }
    }

    // Notify admin that they just actioned it (for audit trail)
    await db.insert(notifications).values({
      recipientId: admin.id,
      type: "system",
      title: action === "approve" ? "✓ Payment Approved" : "✗ Payment Rejected",
      description: `You ${action === "approve" ? "approved" : "rejected"} the payment from ${profile?.companyName || "an employer"} for ${request.plan} plan. Transaction: ${request.transactionNumber}.`,
      link: "/admin_subscription",
      meta: { action: `admin_${action}`, transactionNumber: request.transactionNumber } as Record<string, unknown>,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PAYMENT PATCH ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Admin can also cancel a subscription directly
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params; // this is the subscription employerId
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.employerId, id)).limit(1);
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const oldPlan = sub.plan;
    await db.update(subscriptions).set({ plan: "free", billingCycleEnd: null, updatedAt: new Date() }).where(eq(subscriptions.employerId, id));

    const [profile] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, id)).limit(1);

    await db.insert(notifications).values({
      recipientId: id,
      type: "system",
      title: "Subscription Cancelled by Admin",
      description: `Your ${oldPlan} plan has been cancelled by an administrator. You've been moved to the Free plan.`,
      link: "/subscription",
      meta: { action: "admin_cancelled" } as Record<string, unknown>,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}