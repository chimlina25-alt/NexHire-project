import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import {
  employerProfiles,
  jobSeekerProfiles,
} from "@/app/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const me = await getCurrentUser("auth");

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "job_seeker") {
      const [profile] = await db
        .select()
        .from(jobSeekerProfiles)
        .where(eq(jobSeekerProfiles.userId, me.id))
        .limit(1);

      return NextResponse.json({
        userId: me.id,
        email: me.email,
        role: me.role,
        displayName:
          profile
            ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
            : me.email,
        avatar: profile?.profileImage ?? null,
        profilePath: "/profile",
      });
    }

    if (me.role === "employer") {
      const [profile] = await db
        .select()
        .from(employerProfiles)
        .where(eq(employerProfiles.userId, me.id))
        .limit(1);

      return NextResponse.json({
        userId: me.id,
        email: me.email,
        role: me.role,
        displayName: profile?.companyName || me.email,
        avatar: profile?.profileImage ?? null,
        profilePath: "/employer_profile",
      });
    }

    return NextResponse.json({
      userId: me.id,
      email: me.email,
      role: me.role,
      displayName: me.email,
      avatar: null,
      profilePath: "/",
    });
  } catch (error) {
    console.error("AUTH ME ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
