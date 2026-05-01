import { getCurrentUser } from "@/lib/auth";
import { db } from "@/app/db";
import { employerProfiles, jobSeekerProfiles } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentEmployerWithProfile() {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") return null;

  const [profile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, user.id))
    .limit(1);

  return { user, profile: profile ?? null };
}

export async function getCurrentJobSeekerWithProfile() {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "job_seeker") return null;

  const [profile] = await db
    .select()
    .from(jobSeekerProfiles)
    .where(eq(jobSeekerProfiles.userId, user.id))
    .limit(1);

  return { user, profile: profile ?? null };
}