import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { jobSeekerProfiles, users } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { saveUpload } from "@/lib/save-upload";

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "job_seeker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(jobSeekerProfiles)
    .where(eq(jobSeekerProfiles.userId, user.id))
    .limit(1);

  if (!profile) return NextResponse.json(null);

  return NextResponse.json({
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    description: profile.description,
    contact: profile.contact,
    address: profile.address,
    educationLevel: profile.educationLevel,
    schoolUniversity: profile.schoolUniversity,
    year: profile.year,
    profileImage: profile.profileImage,
    cvUrl: profile.cvUrl,
    cvFileName: profile.cvFileName,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "job_seeker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();

  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "First and last name are required" },
      { status: 400 }
    );
  }

  const description = String(formData.get("description") || "").trim() || null;
  const contact = String(formData.get("contact") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const educationLevel = String(formData.get("educationLevel") || "").trim() || null;
  const schoolUniversity = String(formData.get("schoolUniversity") || "").trim() || null;
  const year = String(formData.get("year") || "").trim() || null;

  const removeCv = formData.get("removeCv") === "1";
  const removeProfileImage = formData.get("removeProfileImage") === "1";

  // Load existing profile so we can preserve unchanged fields
  const [existing] = await db
    .select()
    .from(jobSeekerProfiles)
    .where(eq(jobSeekerProfiles.userId, user.id))
    .limit(1);

  // --- Profile image ---
  let profileImage: string | null = existing?.profileImage ?? null;
  const profileImageFile = formData.get("profileImage");
  if (profileImageFile instanceof File && profileImageFile.size > 0) {
    profileImage = await saveUpload(profileImageFile, "profiles");
  } else if (removeProfileImage) {
    profileImage = null;
  }

  // --- CV ---
  // Always stored as raw via saveUpload, always served via /api/cv proxy
  let cvUrl: string | null = existing?.cvUrl ?? null;
  let cvFileName: string | null = existing?.cvFileName ?? null;
  const cvFile = formData.get("cvFile");
  if (cvFile instanceof File && cvFile.size > 0) {
    cvUrl = await saveUpload(cvFile, "cvs");
    cvFileName = cvFile.name;
  } else if (removeCv) {
    cvUrl = null;
    cvFileName = null;
  }

  let profile;

  if (existing) {
    [profile] = await db
      .update(jobSeekerProfiles)
      .set({
        firstName,
        lastName,
        description,
        contact,
        address,
        educationLevel,
        schoolUniversity,
        year,
        profileImage,
        cvUrl,
        cvFileName,
        updatedAt: new Date(),
      })
      .where(eq(jobSeekerProfiles.userId, user.id))
      .returning();
  } else {
    [profile] = await db
      .insert(jobSeekerProfiles)
      .values({
        userId: user.id,
        firstName,
        lastName,
        description,
        contact,
        address,
        educationLevel,
        schoolUniversity,
        year,
        profileImage,
        cvUrl,
        cvFileName,
      })
      .returning();

    await db
      .update(users)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  return NextResponse.json({
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    description: profile.description,
    contact: profile.contact,
    address: profile.address,
    educationLevel: profile.educationLevel,
    schoolUniversity: profile.schoolUniversity,
    year: profile.year,
    profileImage: profile.profileImage,
    profileImageUrl: profile.profileImage,
    cvUrl: profile.cvUrl,
    cvFileName: profile.cvFileName,
    next: "/home_page",
  });
}