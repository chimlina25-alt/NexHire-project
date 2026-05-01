import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}