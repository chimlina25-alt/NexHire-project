import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { adminAccounts } from "@/app/db/schema";

// POST - for production use
export async function POST() {
  return seed();
}

// GET - for easy browser testing, remove after seeding
export async function GET() {
  return seed();
}

async function seed() {
  try {
    const email = "admin@gmail.com";
    const password = "NexHireKML";

    const [existing] = await db
      .select()
      .from(adminAccounts)
      .where(eq(adminAccounts.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json({
        message: "Admin already exists",
        id: existing.id,
        email: existing.email,
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [admin] = await db
      .insert(adminAccounts)
      .values({ email, passwordHash, name: "Admin" })
      .returning();

    return NextResponse.json({
      message: "Admin created successfully",
      id: admin.id,
      email: admin.email,
    });
  } catch (error) {
    console.error("SEED ERROR:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}