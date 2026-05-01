// app/api/auth/job-seeker-profile/route.ts
// FULL REPLACEMENT

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { jobSeekerProfiles } from "@/app/db/schema";
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
  const lastName  = String(formData.get("lastName")  || "").trim();

  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "First and last name are required" },
      { status: 400 }
    );
  }

  const description      = String(formData.get("description")      || "").trim() || null;
  const contact          = String(formData.get("contact")          || "").trim() || null;
  const address          = String(formData.get("address")          || "").trim() || null;
  const educationLevel   = String(formData.get("educationLevel")   || "").trim() || null;
  const schoolUniversity = String(formData.get("schoolUniversity") || "").trim() || null;
  const year             = String(formData.get("year")             || "").trim() || null;

  // Handle profile image upload
  let profileImage: string | null = null;
  const profileImageFile = formData.get("profileImage");
  if (profileImageFile instanceof File) {
    profileImage = await saveUpload(profileImageFile, "profiles");
  }

  // Handle CV upload
  let cvUrl: string | null = null;
  let cvFileName: string | null = null;
  const cvFile = formData.get("cvFile");
  if (cvFile instanceof File) {
    cvUrl      = await saveUpload(cvFile, "cvs");
    cvFileName = cvFile.name;
  }

  // Check if profile already exists
  const [existing] = await db
    .select()
    .from(jobSeekerProfiles)
    .where(eq(jobSeekerProfiles.userId, user.id))
    .limit(1);

  let profile;

  if (existing) {
    // Build update object — only overwrite image/cv if a new file was uploaded
    const updateData: Record<string, any> = {
      firstName,
      lastName,
      description,
      contact,
      address,
      educationLevel,
      schoolUniversity,
      year,
      updatedAt: new Date(),
    };
    if (profileImage !== null) updateData.profileImage = profileImage;
    if (cvUrl        !== null) updateData.cvUrl        = cvUrl;
    if (cvFileName   !== null) updateData.cvFileName   = cvFileName;

    [profile] = await db
      .update(jobSeekerProfiles)
      .set(updateData)
      .where(eq(jobSeekerProfiles.userId, user.id))
      .returning();
  } else {
    // Insert — provide every notNull field explicitly (no spread of Record)
    [profile] = await db
      .insert(jobSeekerProfiles)
      .values({
        userId:          user.id,
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
  }

  return NextResponse.json({
    id:               profile.id,
    firstName:        profile.firstName,
    lastName:         profile.lastName,
    description:      profile.description,
    contact:          profile.contact,
    address:          profile.address,
    educationLevel:   profile.educationLevel,
    schoolUniversity: profile.schoolUniversity,
    year:             profile.year,
    profileImage:     profile.profileImage,
    profileImageUrl:  profile.profileImage, // alias the profile page reads
    cvUrl:            profile.cvUrl,
    cvFileName:       profile.cvFileName,
  });
}