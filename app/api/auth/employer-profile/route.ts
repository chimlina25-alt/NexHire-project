import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { employerProfiles, users } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { saveProfileImage } from "@/lib/save-profile-image";
import { saveUpload } from "@/lib/save-upload";

const schema = z.object({
  companyDescription: z.string().optional(),
  companyName: z.string().min(1),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  currentAddress: z.string().optional(),
  foundedYear: z.string().optional(),
  country: z.string().optional(),
  contact: z.string().optional(),
  websiteLink: z.string().optional(),
});

export async function GET() {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, me.id))
      .limit(1);

    return NextResponse.json(profile ?? null);
  } catch (error) {
    console.error("EMPLOYER PROFILE GET ERROR:", error);

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
    const companyFile = formData.get("companyFile");

    const parsed = schema.safeParse({
      companyDescription: String(formData.get("companyDescription") || ""),
      companyName: String(formData.get("companyName") || ""),
      industry: String(formData.get("industry") || ""),
      companySize: String(formData.get("companySize") || ""),
      currentAddress: String(formData.get("currentAddress") || ""),
      foundedYear: String(formData.get("foundedYear") || ""),
      country: String(formData.get("country") || ""),
      contact: String(formData.get("contact") || ""),
      websiteLink: String(formData.get("websiteLink") || ""),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
    }

    const profileImage =
      image instanceof File && image.size > 0
        ? await saveProfileImage(image)
        : null;

    const companyUpload =
      companyFile instanceof File && companyFile.size > 0
        ? await saveUpload(
            companyFile,
            "company-files",
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
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, me.id))
      .limit(1);

    const payload = {
      ...parsed.data,
      ...(profileImage ? { profileImage } : {}),
      ...(companyUpload
        ? {
            companyFileName: companyUpload.fileName,
            companyFileUrl: companyUpload.url,
          }
        : {}),
    };

    if (existing) {
      await db
        .update(employerProfiles)
        .set(payload)
        .where(eq(employerProfiles.userId, me.id));
    } else {
      await db.insert(employerProfiles).values({
        userId: me.id,
        profileImage,
        companyFileName: companyUpload?.fileName ?? null,
        companyFileUrl: companyUpload?.url ?? null,
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
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, me.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      next: "/dashboard",
      profile,
      profileImageUrl: profile?.profileImage ?? null,
      companyFileName: profile?.companyFileName ?? null,
      companyFileUrl: profile?.companyFileUrl ?? null,
    });
  } catch (error) {
    console.error("EMPLOYER PROFILE ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
