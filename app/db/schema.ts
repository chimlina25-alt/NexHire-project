import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["employer", "job_seeker"]);
export const otpPurposeEnum = pgEnum("otp_purpose", [
  "signup",
  "login",
  "forgot_password",
  "google_signup",
  "google_login",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  provider: text("provider").notNull().default("credentials"),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  role: userRoleEnum("role"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  purpose: otpPurposeEnum("purpose").notNull(),
  data: jsonb("data").$type<Record<string, any> | null>().default(null),
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
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
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
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
