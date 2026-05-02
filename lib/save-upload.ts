import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function saveUpload(
  file: File | Blob,
  folder = "uploads"
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let originalName = "file";
  if (file instanceof File && file.name && file.name !== "blob") {
    originalName = file.name.split(".")[0].replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  const publicId = `nexhire/${folder}/${originalName}_${Date.now()}`;

  const isDocument =
    file.type === "application/pdf" ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: publicId,
          resource_type: isDocument ? "raw" : "image",
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload FAILED:", error);
            return reject(error);
          }
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}