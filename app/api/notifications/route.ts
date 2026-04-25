import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { jobApplications, notifications } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, me.id))
      .orderBy(desc(notifications.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role !== "employer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (!body.applicationId || !body.title || !body.description) {
      return NextResponse.json(
        { error: "Missing applicationId, title, or description" },
        { status: 400 }
      );
    }

    const [application] = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.id, body.applicationId))
      .limit(1);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.employerId !== me.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [notif] = await db
      .insert(notifications)
      .values({
        recipientId: application.jobSeekerId,
        actorId: me.id,
        type: body.type ?? "system",
        title: body.title,
        description: body.description,
        link: body.link ?? "/notification",
        meta: {
          applicationId: application.id,
          jobId: application.jobId,
        },
      })
      .returning();

    return NextResponse.json(notif, { status: 201 });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
