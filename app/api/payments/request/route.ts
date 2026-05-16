import { NextResponse } from "next/server";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/app/db";
import { paymentRequests, notifications, adminAccounts } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateTransactionNumber } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser("auth");
    if (!user || user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, bank } = await req.json();
    if (!plan || !bank) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const amounts: Record<string, string> = { standard: "4.99", premium: "10.99" };
    if (!amounts[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // ++ FIXED — no cancelledAt column in new schema
    await db
      .update(paymentRequests)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        and(
          eq(paymentRequests.employerId, user.id),
          eq(paymentRequests.status, "pending")
        )
      );

    const txn = generateTransactionNumber();

    const [request] = await db
      .insert(paymentRequests)
      .values({
        employerId: user.id,
        transactionNumber: txn,
        plan,
        amount: amounts[plan],
        bank,
        status: "pending",
      })
      .returning();

    // Notify employer
    await db.insert(notifications).values({
      recipientId: user.id,
      type: "system",
      title: "Payment Submitted",
      description: `Your payment for the ${plan} plan via ${bank.toUpperCase()} has been submitted. Transaction: ${txn}. Awaiting admin confirmation.`,
      link: "/subscription",
      meta: { transactionNumber: txn, action: "payment_submitted" } as Record<string, unknown>,
    });

    // ++ Notify all admins using adminAccounts.id
    const admins = await db.select().from(adminAccounts);
    for (const admin of admins) {
      await db.insert(notifications).values({
        recipientId: admin.id,
        type: "system",
        title: "💳 New Payment Request",
        description: `An employer submitted a payment for the ${plan} plan via ${bank.toUpperCase()}. Transaction: ${txn}. Go to Subscriptions to approve.`,
        link: "/admin_subscription",
        meta: { transactionNumber: txn, action: "new_payment_request", employerId: user.id } as Record<string, unknown>,
      });
    }

    return NextResponse.json({ success: true, transactionNumber: txn, requestId: request.id });
  } catch (error) {
    console.error("PAYMENT REQUEST ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser("auth");
    if (!user || user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [pending] = await db
      .select()
      .from(paymentRequests)
      .where(and(eq(paymentRequests.employerId, user.id), eq(paymentRequests.status, "pending")))
      .orderBy(desc(paymentRequests.createdAt))
      .limit(1);

    return NextResponse.json(pending ?? null);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}