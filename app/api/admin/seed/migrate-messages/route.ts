import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS message_reads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL,
        user_id UUID NOT NULL,
        read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT message_reads_msg_user_idx UNIQUE (message_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS message_replies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL,
        reply_to_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_presence (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        is_online BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS admin_message_reads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL,
        user_id UUID NOT NULL,
        read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT admin_message_reads_msg_user_idx UNIQUE (message_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS admin_message_replies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL,
        reply_to_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS conversation_deletes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL,
        user_id UUID NOT NULL,
        deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT conv_delete_user_idx UNIQUE (conversation_id, user_id)
      );

      ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID;
      ALTER TABLE admin_messages ADD COLUMN IF NOT EXISTS reply_to_id UUID;
    `);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}