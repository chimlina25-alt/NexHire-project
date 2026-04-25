import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { getCurrentUser } from "@/lib/auth";
import { jobSeekerProfiles, users } from "@/app/db/schema";
import { saveProfileImage } from "@/lib/save-profile-image";
import { saveUpload } from "@/lib/save-upload";

const schema = z.object({
  description: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  contact: z.string().optional(),
  address: z.string().optional(),
  educationLevel: z.string().optional(),
  schoolUniversity: z.string().optional(),
  year: z.string().optional(),
});

export async function GET() {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await db
      .select()
      .from(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.userId, me.id))
      .limit(1);

    return NextResponse.json(profile ?? null);
  } catch (error) {
    console.error("JOB SEEKER PROFILE GET ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("profileImage");
    const cvFile = formData.get("cvFile");

    const parsed = schema.safeParse({
      description: String(formData.get("description") || ""),
      firstName: String(formData.get("firstName") || ""),
      lastName: String(formData.get("lastName") || ""),
      contact: String(formData.get("contact") || ""),
      address: String(formData.get("address") || ""),
      educationLevel: String(formData.get("educationLevel") || ""),
      schoolUniversity: String(formData.get("schoolUniversity") || ""),
      year: String(formData.get("year") || ""),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
    }

    const profileImage =
      image instanceof File && image.size > 0
        ? await saveProfileImage(image)
        : null;

    const cvUpload =
      cvFile instanceof File && cvFile.size > 0
        ? await saveUpload(
            cvFile,
            "cvs",
            [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ],
            10 * 1024 * 1024
          )
        : null;

    const [existing] = await db
      .select()
      .from(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.userId, me.id))
      .limit(1);

    const payload = {
      ...parsed.data,
      ...(profileImage ? { profileImage } : {}),
      ...(cvUpload
        ? {
            cvFileName: cvUpload.fileName,
            cvUrl: cvUpload.url,
          }
        : {}),
    };

    if (existing) {
      await db
        .update(jobSeekerProfiles)
        .set(payload)
        .where(eq(jobSeekerProfiles.userId, me.id));
    } else {
      await db.insert(jobSeekerProfiles).values({
        userId: me.id,
        profileImage,
        cvFileName: cvUpload?.fileName ?? null,
        cvUrl: cvUpload?.url ?? null,
        ...parsed.data,
      });
    }

    await db
      .update(users)
      .set({
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, me.id));

    const [profile] = await db
      .select()
      .from(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.userId, me.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      next: "/home_page",
      profile,
      profileImageUrl: profile?.profileImage ?? null,
      cvFileName: profile?.cvFileName ?? null,
      cvUrl: profile?.cvUrl ?? null,
    });
  } catch (error) {
    console.error("JOB SEEKER PROFILE ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
