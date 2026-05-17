import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { subscriptions } from "@/app/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ subId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subId } = await params;
    const { posts } = await req.json();

    await db
      .update(subscriptions)
      .set({ jobsPostedThisMonth: posts, updatedAt: new Date() })
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
    await db
      .update(subscriptions)
      .set({ plan: "free", billingCycleEnd: null, updatedAt: new Date() })
      .where(eq(subscriptions.id, subId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}