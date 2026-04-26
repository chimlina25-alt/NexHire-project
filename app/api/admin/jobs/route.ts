import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { employerProfiles, jobs } from "@/app/db/schema";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        category: jobs.category,
        status: jobs.status,
        createdAt: jobs.createdAt,
        company: employerProfiles.companyName,
        employerId: jobs.employerId,
        location: jobs.location,
        employmentType: jobs.employmentType,
      })
      .from(jobs)
      .innerJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
      .orderBy(desc(jobs.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("ADMIN JOBS GET ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    await db.delete(jobs).where(eq(jobs.id, jobId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ADMIN JOBS DELETE ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}