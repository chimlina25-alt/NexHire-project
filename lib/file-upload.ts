const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadFile(file: File): Promise<{ url: string; name: string; type: string } | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_SIZE) throw new Error("File too large (max 5MB)");

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  return {
    url: dataUrl,
    name: file.name,
    type: file.type,
  };
}