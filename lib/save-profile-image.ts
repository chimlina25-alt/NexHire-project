// lib/save-profile-image.ts
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function saveProfileImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Invalid image type. Use JPG, PNG, or WEBP.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const filename = `${randomBytes(16).toString("hex")}.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/profiles/${filename}`;
}

export async function saveCompanyFile(
  file: File
): Promise<{ url: string; name: string }> {
  if (!ALLOWED_DOC_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Use PDF, DOC, or DOCX.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File must be 10MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
  const filename = `${randomBytes(16).toString("hex")}.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "company-files");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return { url: `/uploads/company-files/${filename}`, name: file.name };
}

export async function saveCv(file: File): Promise<{ url: string; name: string }> {
  if (file.type !== "application/pdf" && !ALLOWED_DOC_TYPES.includes(file.type)) {
    throw new Error("CV must be PDF, DOC, or DOCX.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("CV must be 10MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
  const filename = `${randomBytes(16).toString("hex")}.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "cvs");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return { url: `/uploads/cvs/${filename}`, name: file.name };
}