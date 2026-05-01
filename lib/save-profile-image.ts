import { saveUpload } from "./save-upload";

export async function saveProfileImage(file: File): Promise<string> {
  return saveUpload(file, "profiles");
}