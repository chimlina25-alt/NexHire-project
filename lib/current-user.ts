import { getCurrentUser } from "@/lib/auth";

export async function requireUser() {
  const user = await getCurrentUser("auth");
  if (!user) return null;
  return user;
}

export async function requireEmployer() {
  const user = await getCurrentUser("auth");
  if (!user) return null;
  if (user.role !== "employer") return null;
  return user;
}