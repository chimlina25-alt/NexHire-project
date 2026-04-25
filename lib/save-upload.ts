import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

export async function saveUpload(
  file: File | null,
  folder: string,
  allowedTypes?: string[],
  maxSize = 10 * 1024 * 1024
) {
  if (!file || file.size === 0) return null;

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new Error("Unsupported file type");
  }

  if (file.size > maxSize) {
    throw new Error("File too large");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const fileName = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return {
    url: `/uploads/${folder}/${fileName}`,
    fileName: file.name,
    mimeType: file.type,
  };
}
