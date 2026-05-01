import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function saveUpload(file: File | Blob, folder = "uploads"): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", folder);
  await mkdir(uploadDir, { recursive: true });

  // Derive extension from file name, MIME type, or fall back to bin
  let ext = "bin";
  if (file instanceof File && file.name && file.name !== "blob") {
    ext = file.name.split(".").pop() || "bin";
  } else if (file.type) {
    const mimePart = file.type.split("/")[1];
    ext = mimePart?.replace("jpeg", "jpg") || "bin";
  }

  const filename = `${randomUUID()}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/${folder}/${filename}`;
}