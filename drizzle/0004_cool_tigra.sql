CREATE TYPE "public"."otp_purpose" AS ENUM('signup', 'login', 'forgot_password', 'google_signup', 'google_login');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('employer', 'job_seeker');--> statement-breakpoint
CREATE TABLE "employer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_image" text,
	"company_description" text,
	"company_name" text NOT NULL,
	"industry" text,
	"company_size" text,
	"current_address" text,
	"founded_year" text,
	"country" text,
	"contact" text,
	"website_link" text,
	"company_file_name" text,
	"company_file_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "job_seeker_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_image" text,
	"description" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"contact" text,
	"address" text,
	"education_level" text,
	"school_university" text,
	"year" text,
	"cv_file_name" text,
	"cv_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_seeker_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"purpose" "otp_purpose" NOT NULL,
	"data" jsonb DEFAULT 'null'::jsonb,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"job_seeker_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"type" text DEFAULT 'auth' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"google_id" text,
	"provider" text DEFAULT 'credentials' NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"role" "user_role",
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "saved_jobs_job_seeker_job_idx" ON "saved_jobs" USING btree ("job_id","job_seeker_id");