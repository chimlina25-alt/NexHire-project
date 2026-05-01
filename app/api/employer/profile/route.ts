import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { employerProfiles } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

const emptyProfile = {
  companyName: "",
  profileImage: "",
  companyDescription: "",
  industry: "",
  companySize: "",
  currentAddress: "",
  foundedYear: "",
  country: "",
  contact: "",
  websiteLink: "",
  companyFileName: "",
  companyFileUrl: "",
};

export async function GET() {
  const user = await getCurrentUser("auth");
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, user.id))
    .limit(1);

  if (!profile) {
    return NextResponse.json(emptyProfile);
  }

  return NextResponse.json(profile);
}