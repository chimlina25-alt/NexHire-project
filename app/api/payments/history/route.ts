import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/app/db";
import { paymentRequests } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser("auth");
    if (!user || user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.employerId, user.id))
      .orderBy(desc(paymentRequests.createdAt));

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}