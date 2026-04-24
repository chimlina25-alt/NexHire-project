import { redirect } from "next/navigation";

export default async function GoogleCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "login";

  redirect(`/api/auth/google-start?mode=${mode}`);
}
