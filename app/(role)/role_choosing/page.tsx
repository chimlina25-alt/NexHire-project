"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState<"employer" | "job_seeker" | null>(null);

  const handleChooseRole = async (role: "employer" | "job_seeker") => {
    try {
      setLoading(role);

      const res = await fetch("/api/auth/select-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("ROLE ERROR:", result);
        alert(result.error || "Failed to save role");
        setLoading(null);
        return;
      }

      router.push(result.next);
    } catch (error) {
      console.error("ROLE FETCH ERROR:", error);
      alert("Something went wrong");
      setLoading(null);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#0d2a23] p-4 font-sans md:p-12">
      <div className="absolute left-8 top-8 z-20">
        <Link
          href="/login"
          className="flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-bold text-[#0d2a23] shadow-md transition-all hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      <div className="relative flex h-[600px] w-full max-w-5xl flex-col overflow-hidden rounded-[40px] bg-white shadow-2xl md:flex-row">
        <button
          type="button"
          onClick={() => handleChooseRole("employer")}
          disabled={loading !== null}
          className="group flex flex-col items-center justify-center bg-white p-12 transition-all md:w-1/2"
        >
          <h2 className="mb-12 text-2xl font-bold text-[#0d2a23]">
            I&apos;m here for Hiring
          </h2>

          <div className="mb-12 transition-transform duration-300 group-hover:scale-110">
            <img
              src="/emr.png"
              alt="Hiring"
              className="h-100 w-100 items-center object-contain grayscale-[0.2]"
            />
          </div>

          <span className="rounded-full bg-[#1e4d40] px-10 py-3 text-sm font-bold tracking-wide text-white">
            {loading === "employer" ? "LOADING..." : "JOIN AS EMPLOYER"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleChooseRole("job_seeker")}
          disabled={loading !== null}
          className="group flex flex-col items-center justify-center bg-[#051612] p-12 transition-all md:w-1/2"
        >
          <h2 className="mb-12 text-2xl font-bold text-white">
            I&apos;m here Seeking Job
          </h2>

          <div className="mb-12 transition-transform duration-300 group-hover:scale-110">
            <img
              src="/er.png"
              alt="Job Seeker"
              className="h-100 w-100 object-contain invert"
            />
          </div>

          <span className="rounded-full bg-white px-10 py-3 text-sm font-bold tracking-wide text-[#051612]">
            {loading === "job_seeker" ? "LOADING..." : "JOIN AS JOB SEEKER"}
          </span>
        </button>

        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center md:flex">
          <div className="flex h-32 w-32 items-center justify-center rounded-[30px] border-4 border-[#0d2a23]/5 bg-white shadow-xl">
            <div className="flex flex-col items-center">
              <img src="/logo.png" alt="NexHire" className="mb-1 h-10 w-10" />
              <span className="text-lg font-bold text-[#0d2a23]">NexHire</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}