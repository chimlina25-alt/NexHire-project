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

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser("auth");
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const imageFile = formData.get("profileImage");
    const companyFile = formData.get("companyFile");
    const removeCompanyFile = formData.get("removeCompanyFile") === "true";

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

    // Robust file check — handles both File and Blob instances
    let profileImageUrl: string | null = null;
    if (
      imageFile !== null &&
      imageFile !== "" &&
      typeof imageFile !== "string" &&
      "arrayBuffer" in imageFile &&
      (imageFile as Blob).size > 0
    ) {
      try {
        // Normalize to a File with a proper name if it came in as a plain Blob
        const blob = imageFile as Blob;
        const mimeType = blob.type || "image/jpeg";
        const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
        const normalizedFile =
          imageFile instanceof File && imageFile.name && imageFile.name !== "blob"
            ? imageFile
            : new File([blob], `profile.${ext}`, { type: mimeType });

        profileImageUrl = await saveProfileImage(normalizedFile);
      } catch (e) {
        console.error("Profile image save error:", e);
      }
    }

    let companyFileUrl: string | null = null;
    let companyFileName: string | null = null;
    if (
      companyFile !== null &&
      companyFile !== "" &&
      typeof companyFile !== "string" &&
      "arrayBuffer" in companyFile &&
      (companyFile as Blob).size > 0
    ) {
      try {
        const blob = companyFile as Blob;
        const name = companyFile instanceof File ? companyFile.name : "document.pdf";
        const normalizedFile = companyFile instanceof File ? companyFile : new File([blob], name, { type: blob.type });
        companyFileUrl = await saveUpload(normalizedFile, "company-files");
        companyFileName = normalizedFile.name;
      } catch (e) {
        console.error("Company file save error:", e);
      }
    }

    const [existing] = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, me.id))
      .limit(1);

    if (existing) {
      const updateData: any = {
        ...parsed.data,
        updatedAt: new Date(),
      };

      if (profileImageUrl) updateData.profileImage = profileImageUrl;

      if (companyFileUrl) {
        updateData.companyFileUrl = companyFileUrl;
        updateData.companyFileName = companyFileName;
      }
      if (removeCompanyFile) {
        updateData.companyFileUrl = null;
        updateData.companyFileName = null;
      }

      await db.update(employerProfiles).set(updateData).where(eq(employerProfiles.userId, me.id));

      const [updated] = await db
        .select()
        .from(employerProfiles)
        .where(eq(employerProfiles.userId, me.id))
        .limit(1);

      return NextResponse.json({
        success: true,
        profileImageUrl: updated.profileImage,
        companyFileUrl: updated.companyFileUrl,
        companyFileName: updated.companyFileName,
      });
    }

    const insertData: any = {
      userId: me.id,
      ...parsed.data,
    };
    if (profileImageUrl) insertData.profileImage = profileImageUrl;
    if (companyFileUrl) {
      insertData.companyFileUrl = companyFileUrl;
      insertData.companyFileName = companyFileName;
    }

    await db.insert(employerProfiles).values(insertData);

    await db.update(users)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(users.id, me.id));

    return NextResponse.json({ success: true, next: "/dashboard" });
  } catch (error) {
    console.error("EMPLOYER PROFILE ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}