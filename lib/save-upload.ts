import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveUpload(
  file: File,
  subfolder: string = ""
): Promise<{ url: string; fileName: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "bin";
  const uniqueName = `${randomUUID()}.${ext}`;
  const targetDir = subfolder
    ? path.join(UPLOAD_DIR, subfolder)
    : UPLOAD_DIR;

  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, uniqueName), buffer);

  const url = subfolder
    ? `/uploads/${subfolder}/${uniqueName}`
    : `/uploads/${uniqueName}`;

  return { url, fileName: file.name };
}