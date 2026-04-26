import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/app/db";
import { employerProfiles, users } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { saveProfileImage } from "@/lib/save-profile-image";

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

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("profileImage");

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
      image instanceof File ? await saveProfileImage(image) : null;

    await db.insert(employerProfiles).values({
  userId: me.id,
  profileImage,
  companyDescription: parsed.data.companyDescription,
  companyName: parsed.data.companyName,
  industry: parsed.data.industry,
  companySize: parsed.data.companySize,
  currentAddress: parsed.data.currentAddress,
  foundedYear: parsed.data.foundedYear,
  country: parsed.data.country,
  contact: parsed.data.contact,
  websiteLink: parsed.data.websiteLink,
});

    await db
      .update(users)
      .set({
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, me.id));

    return NextResponse.json({
      success: true,
      next: "/dashboard",
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