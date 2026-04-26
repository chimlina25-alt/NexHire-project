"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyIdentityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = (searchParams.get("type") || "signup") as
    | "signup"
  | "login"
  | "forgot_password"
  | "google_signup"
  | "google_login";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
const [submitting, setSubmitting] = useState(false);
const [resendMessage, setResendMessage] = useState("");
const inputRefs = useRef<Array<HTMLInputElement | null>>([]);


  const backHref =
  type === "signup" || type === "google_signup"
    ? "/signup"
    : type === "login" || type === "google_login"
    ? "/login"
    : "/forgot_password";


  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const code = digits.join("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          type,
        }),
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : {};

      if (!res.ok) {
        alert(result.error || "Verification failed");
        setSubmitting(false);
        return;
      }

      router.push(result.next);
    } catch (error) {
      alert("Something went wrong");
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
  try {
    setResendMessage("");

    const res = await fetch("/api/auth/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        type,
      }),
    });

    const text = await res.text();
    const result = text ? JSON.parse(text) : {};

    if (!res.ok) {
      setResendMessage(result.error || "Failed to resend code");
      return;
    }

    setResendMessage("Verification code resent");
  } catch {
    setResendMessage("Something went wrong");
  }
};



  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1a1a] px-4 py-4 font-sans md:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] h-1/2 w-1/2 rounded-full bg-[#00a37b]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-1/2 w-1/2 rounded-full bg-black/40 blur-[120px]" />
        <img
          src="/au.jpg"
          alt=""
          className="h-full w-full object-cover opacity-30"
        />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-5xl items-center justify-center">
        <div className="flex h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-[34px] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] md:h-[calc(100vh-4rem)] md:flex-row">
          <div className="p-4 md:w-1/2 md:p-5">
            <div className="relative h-full w-full overflow-hidden rounded-[28px]">
              <img
                src="/au.jpg"
                alt="NexHire Workspace"
                className="h-full w-full object-cover"
              />

              <div className="absolute top-7 left-7 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
                  <img src="/logo.png" alt="NexHire" className="h-5 w-5" />
                </div>
                <span className="text-[21px] font-semibold tracking-tight text-white drop-shadow-md">
                  NexHire
                </span>
              </div>

              <div className="absolute bottom-7 left-7">
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white hover:text-black"
                >
                  <ArrowLeft size={15} />
                  Back
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center overflow-y-auto px-6 py-8 md:w-1/2 md:px-10 md:py-8">
            <div className="mx-auto w-full max-w-sm text-center">
              <div className="mb-5 flex justify-center">
                <div className="rounded-xl bg-[#f0fdf9] p-3">
                  <Mail
                    className="h-9 w-9 text-[#00a37b]"
                    strokeWidth={1.7}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h1 className="mb-2 text-[22px] font-semibold leading-snug text-[#00a37b] md:text-[25px]">
                  Verify your identity
                </h1>
                <p className="mx-auto max-w-[290px] text-[13px] leading-5 text-gray-500 md:text-sm">
                  We&apos;ve sent a 6-digit code to{" "}
                  <span className="font-semibold text-gray-700">{email}</span>
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Verification code
                  </label>

                  <div className="mx-auto flex max-w-sm justify-between gap-2">
                    {digits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputRefs.current[i] = el;
                        }}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        type="text"
                        maxLength={1}
                        className="h-12 w-11 rounded-lg border border-gray-200 bg-[#f8fafc] text-center text-lg font-semibold text-gray-700 outline-none transition-all caret-[#00a37b] focus:border-[#00a37b] focus:bg-white focus:ring-2 focus:ring-[#00a37b]/15"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-[#00a37b] py-3 text-sm font-semibold text-white shadow-md shadow-[#00a37b]/20 transition-all hover:bg-[#008f6c] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00a37b]/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Verifying..." : "Verify"}
                </button>
              </form>

              <p className="mt-5 text-sm text-gray-500">
  Don&apos;t receive the code?{" "}
  <button
    type="button"
    onClick={handleResend}
    className="font-semibold text-[#00a37b] hover:underline"
  >
    Resend
  </button>
</p>

{resendMessage && (
  <p className="mt-3 text-sm text-[#00a37b]">{resendMessage}</p>
)}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}