CREATE TYPE "public"."application_status" AS ENUM('pending', 'accepted', 'rejected', 'interview', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'freelance', 'internship');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('entry', 'mid', 'senior', 'lead', 'executive');--> statement-breakpoint
CREATE TYPE "public"."interview_mode" AS ENUM('remote', 'onsite');--> statement-breakpoint
CREATE TYPE "public"."job_arrangement" AS ENUM('on_site', 'remote', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('system', 'application', 'interview', 'message');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_id" uuid NOT NULL,
	"job_seeker_id" uuid NOT NULL,
	"job_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"employer_id" uuid NOT NULL,
	"job_seeker_id" uuid NOT NULL,
	"mode" "interview_mode" DEFAULT 'remote' NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"location" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"employer_id" uuid NOT NULL,
	"job_seeker_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"cover_letter" text,
	"cv_url" text,
	"cv_file_name" text,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_id" uuid NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"location" text NOT NULL,
	"arrangement" "job_arrangement" DEFAULT 'on_site' NOT NULL,
	"employment_type" "employment_type" DEFAULT 'full_time' NOT NULL,
	"experience_level" "experience_level" DEFAULT 'entry' NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"description" text NOT NULL,
	"requirements" text,
	"application_deadline" timestamp with time zone,
	"application_platform" text DEFAULT 'internal' NOT NULL,
	"external_apply_link" text,
	"contact_email" text,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_deletes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"deleted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"text" text,
	"attachment_url" text,
	"attachment_name" text,
	"attachment_type" text,
	"edited_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"actor_id" uuid,
	"type" "notification_type" DEFAULT 'system' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"link" text,
	"meta" jsonb DEFAULT 'null'::jsonb,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "employer_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "job_seeker_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "otp_codes" CASCADE;--> statement-breakpoint
DROP TABLE "sessions" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_employer_jobseeker_job_idx" ON "conversations" USING btree ("employer_id","job_seeker_id","job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_applications_job_user_idx" ON "job_applications" USING btree ("job_id","job_seeker_id");--> statement-breakpoint
CREATE UNIQUE INDEX "message_deletes_message_user_idx" ON "message_deletes" USING btree ("message_id","user_id");--> statement-breakpoint
DROP TYPE "public"."otp_purpose";--> statement-breakpoint
DROP TYPE "public"."user_role";