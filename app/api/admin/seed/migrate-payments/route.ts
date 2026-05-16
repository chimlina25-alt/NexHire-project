import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Drop old table if exists (has wrong columns)
    await db.execute(sql`DROP TABLE IF EXISTS payment_requests CASCADE`);

    // Create new table
    await db.execute(sql`
      CREATE TABLE payment_requests (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        employer_id uuid NOT NULL,
        transaction_number text NOT NULL UNIQUE,
        plan text NOT NULL,
        amount text NOT NULL,
        bank text NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        note text,
        approved_at timestamp with time zone,
        cancelled_at timestamp with time zone,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      )
    `);

    return NextResponse.json({ success: true, message: "payment_requests table recreated" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}