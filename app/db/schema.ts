import {
 pgTable, uuid, text, boolean, timestamp,
 pgEnum, jsonb, integer, uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["employer", "job_seeker"]);
export const otpPurposeEnum = pgEnum("otp_purpose", ["signup","login","forgot_password","google_signup","google_login"]);
export const jobArrangementEnum = pgEnum("job_arrangement", ["on_site","remote","hybrid"]);
export const employmentTypeEnum = pgEnum("employment_type", ["full_time","part_time","contract","freelance","internship"]);
export const experienceLevelEnum = pgEnum("experience_level", ["entry","mid","senior","lead","executive"]);
export const jobStatusEnum = pgEnum("job_status", ["draft","active","closed"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending","accepted","rejected","interview","withdrawn","archived"]);
export const notificationTypeEnum = pgEnum("notification_type", ["system","application","interview","message"]);
export const interviewModeEnum = pgEnum("interview_mode", ["remote","onsite"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["free","standard","premium"]);
export const interviewStatusEnum = pgEnum("interview_status", ["scheduled","completed","cancelled","rescheduled"]);

export const users = pgTable("users", {
 id: uuid("id").defaultRandom().primaryKey(),
 email: text("email").notNull().unique(),
 passwordHash: text("password_hash"),
 googleId: text("google_id").unique(),
 provider: text("provider").notNull().default("credentials"),
 isEmailVerified: boolean("is_email_verified").notNull().default(false),
 role: userRoleEnum("role"),
 onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
 isAdmin: boolean("is_admin").notNull().default(false),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
 updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const adminAccounts = pgTable("admin_accounts", {
 id: uuid("id").defaultRandom().primaryKey(),
 email: text("email").notNull().unique(),
 passwordHash: text("password_hash").notNull(),
 name: text("name").notNull().default("Admin"),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
 updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
 id: uuid("id").defaultRandom().primaryKey(),
 adminId: uuid("admin_id").notNull(),
 tokenHash: text("token_hash").notNull().unique(),
 expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const otpCodes = pgTable("otp_codes", {
 id: uuid("id").defaultRandom().primaryKey(),
 email: text("email").notNull(),
 codeHash: text("code_hash").notNull(),
 purpose: otpPurposeEnum("purpose").notNull(),
 data: jsonb("data").$type<Record<string, unknown> | null>().default(null),
 expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
 usedAt: timestamp("used_at", { withTimezone: true }),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
 id: uuid("id").defaultRandom().primaryKey(),
 userId: uuid("user_id").notNull(),
 tokenHash: text("token_hash").notNull().unique(),
 type: text("type").notNull().default("auth"),
 expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const employerProfiles = pgTable("employer_profiles", {
 id: uuid("id").defaultRandom().primaryKey(),
 userId: uuid("user_id").notNull().unique(),
 profileImage: text("profile_image"),
 companyDescription: text("company_description"),
 companyName: text("company_name").notNull(),
 industry: text("industry"),
 companySize: text("company_size"),
 currentAddress: text("current_address"),
 foundedYear: text("founded_year"),
 country: text("country"),
 contact: text("contact"),
 websiteLink: text("website_link"),
 companyFileName: text("company_file_name"),
 companyFileUrl: text("company_file_url"),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
 updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const jobSeekerProfiles = pgTable("job_seeker_profiles", {
 id: uuid("id").defaultRandom().primaryKey(),
 userId: uuid("user_id").notNull().unique(),
 profileImage: text("profile_image"),
 description: text("description"),
 firstName: text("first_name").notNull(),
 lastName: text("last_name").notNull(),
 contact: text("contact"),
 address: text("address"),
 educationLevel: text("education_level"),
 schoolUniversity: text("school_university"),
 year: text("year"),
 cvUrl: text("cv_url"),
 cvFileName: text("cv_file_name"),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
 updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
 id: uuid("id").defaultRandom().primaryKey(),
 employerId: uuid("employer_id").notNull(),
 title: text("title").notNull(),
 category: text("category").notNull(),
 location: text("location").notNull(),
 arrangement: jobArrangementEnum("arrangement").notNull().default("on_site"),
 employmentType: employmentTypeEnum("employment_type").notNull().default("full_time"),
 experienceLevel: experienceLevelEnum("experience_level").notNull().default("entry"),
 salaryMin: integer("salary_min"),
 salaryMax: integer("salary_max"),
 description: text("description").notNull(),
 requirements: text("requirements"),
 applicationDeadline: timestamp("application_deadline", { withTimezone: true }),
 applicationPlatform: text("application_platform").notNull().default("internal"),
 externalApplyLink: text("external_apply_link"),
 contactEmail: text("contact_email"),
 status: jobStatusEnum("status").notNull().default("draft"),
 postedAt: timestamp("posted_at", { withTimezone: true }),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
 updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const savedJobs = pgTable("saved_jobs", {
 id: uuid("id").defaultRandom().primaryKey(),
 jobId: uuid("job_id").notNull(),
 jobSeekerId: uuid("job_seeker_id").notNull(),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
 savedJobsUnique: uniqueIndex("saved_jobs_job_seeker_job_idx").on(table.jobId, table.jobSeekerId),
}));

export const jobApplications = pgTable("job_applications", {
 id: uuid("id").defaultRandom().primaryKey(),
 jobId: uuid("job_id").notNull(),
 employerId: uuid("employer_id").notNull(),
 jobSeekerId: uuid("job_seeker_id").notNull(),
 status: applicationStatusEnum("status").notNull().default("pending"),
 coverLetter: text("cover_letter"),
 cvUrl: text("cv_url"),
 cvFileName: text("cv_file_name"),
 appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow().notNull(),
 updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
 jobApplicationsUnique: uniqueIndex("job_applications_job_user_idx").on(table.jobId, table.jobSeekerId),
}));

export const interviews = pgTable("interviews", {
 id: uuid("id").defaultRandom().primaryKey(),
 applicationId: uuid("application_id").notNull(),
 status: interviewStatusEnum("status").notNull().default("scheduled"),
 employerId: uuid("employer_id").notNull(),
 jobSeekerId: uuid("job_seeker_id").notNull(),
 mode: interviewModeEnum("mode").notNull().default("remote"),
 scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
 duration: integer("duration").default(60),
 location: text("location"),
 link: text("link"),
 notes: text("notes"),
 updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
 id: uuid("id").defaultRandom().primaryKey(),
 recipientId: uuid("recipient_id").notNull(),
 actorId: uuid("actor_id"),
 type: notificationTypeEnum("type").notNull().default("system"),
 title: text("title").notNull(),
 description: text("description").notNull(),
 link: text("link"),
 meta: jsonb("meta").$type<Record<string, unknown> | null>().default(null),
 readAt: timestamp("read_at", { withTimezone: true }),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
 id: uuid("id").defaultRandom().primaryKey(),
 employerId: uuid("employer_id").notNull(),
 jobSeekerId: uuid("job_seeker_id").notNull(),
 jobId: uuid("job_id"),
 adminId: uuid("admin_id"),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
 lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
 id: uuid("id").defaultRandom().primaryKey(),
 conversationId: uuid("conversation_id").notNull(),
 senderId: uuid("sender_id").notNull(),
 senderType: text("sender_type").notNull().default("user"),
 text: text("text"),
 attachmentUrl: text("attachment_url"),
 attachmentName: text("attachment_name"),
 attachmentType: text("attachment_type"),
 deletedBySender: boolean("deleted_by_sender").notNull().default(false),
 editedAt: timestamp("edited_at", { withTimezone: true }),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messageDeletes = pgTable("message_deletes", {
 id: uuid("id").defaultRandom().primaryKey(),
 messageId: uuid("message_id").notNull(),
 userId: uuid("user_id").notNull(),
 deletedAt: timestamp("deleted_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
 messageDeletesUnique: uniqueIndex("message_deletes_message_user_idx").on(table.messageId, table.userId),
}));

export const subscriptions = pgTable("subscriptions", {
 id: uuid("id").defaultRandom().primaryKey(),
 employerId: uuid("employer_id").notNull().unique(),
 plan: subscriptionPlanEnum("plan").notNull().default("free"),
 jobsPostedThisMonth: integer("jobs_posted_this_month").notNull().default(0),
 billingCycleStart: timestamp("billing_cycle_start", { withTimezone: true }).defaultNow().notNull(),
 billingCycleEnd: timestamp("billing_cycle_end", { withTimezone: true }),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
 updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const adminConversations = pgTable("admin_conversations", {
 id: uuid("id").defaultRandom().primaryKey(),
 adminId: uuid("admin_id").notNull(),
 userId: uuid("user_id").notNull(),
 userRole: text("user_role").notNull(),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
 lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
});

export const adminMessages = pgTable("admin_messages", {
 id: uuid("id").defaultRandom().primaryKey(),
 conversationId: uuid("conversation_id").notNull(),
 senderId: uuid("sender_id").notNull(),
 senderType: text("sender_type").notNull(),
 text: text("text").notNull(),
 editedAt: timestamp("edited_at", { withTimezone: true }),
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});