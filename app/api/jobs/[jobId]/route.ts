// app/api/jobs/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { jobs } from "@/app/db/schema";
import { requireEmployer } from "@/lib/require-employer";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  arrangement: z.enum(["on_site", "remote", "hybrid"]).optional(),
  employmentType: z
    .enum(["full_time", "part_time", "contract", "freelance", "internship"])
    .optional(),
  experienceLevel: z
    .enum(["entry", "mid", "senior", "lead", "executive"])
    .optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  description: z.string().optional(),
  requirements: z.string().nullable().optional(),
  applicationDeadline: z.string().nullable().optional(),
  applicationPlatform: z.string().optional(),
  externalApplyLink: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  status: z.enum(["draft", "active", "closed"]).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireEmployer();
  if (auth.error) return auth.error;

  const [existing] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.employerId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.applicationDeadline) {
    data.applicationDeadline = new Date(parsed.data.applicationDeadline);
  }

  const [updated] = await db
    .update(jobs)
    .set(data)
    .where(eq(jobs.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireEmployer();
  if (auth.error) return auth.error;

  const [existing] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.employerId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(jobs).where(eq(jobs.id, id));
  return NextResponse.json({ success: true });
}