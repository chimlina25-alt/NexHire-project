"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";
import EmployerNavProfile from "@/components/ui/EmployerNavProfile";

type ApplicationInfo = {
  id: string;
  jobTitle: string;
  seekerFirstName: string;
  seekerLastName: string;
  seekerImage: string | null;
};

type InterviewMode = "remote" | "onsite";

type FormState = {
  mode: InterviewMode;
  scheduledAt: string;
  scheduledTime: string;
  location: string;
  notes: string;
};

const inputClass =
  "w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium placeholder-[#9ab0aa] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594] transition-all";

const labelClass = "block text-sm font-extrabold text-[#071a15] mb-2";

function ScheduleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId") ?? "";

  const [applicationInfo, setApplicationInfo] =
    useState<ApplicationInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>({
    mode:          "remote",
    scheduledAt:   "",
    scheduledTime: "",
    location:      "",
    notes:         "",
  });

  useEffect(() => {
    if (!applicationId) {
      setInfoLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(
          `/api/applications/${applicationId}/info`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data: ApplicationInfo = await res.json();
          setApplicationInfo(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInfoLoading(false);
      }
    };

    load();
  }, [applicationId]);

  const handleModeChange = (mode: InterviewMode) => {
    setForm((prev) => ({ ...prev, mode, location: "" }));
  };

  const handleFieldChange = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!applicationId) {
      setError("No application selected.");
      return;
    }
    if (!form.scheduledAt) {
      setError("Please select a date.");
      return;
    }
    if (!form.scheduledTime) {
      setError("Please select a time.");
      return;
    }

    try {
      setSubmitting(true);

      const scheduledAt = new Date(
        `${form.scheduledAt}T${form.scheduledTime}:00`
      ).toISOString();

      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          mode:        form.mode,
          scheduledAt,
          location:    form.location.trim() || null,
          notes:       form.notes.trim()    || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to schedule interview.");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const previewDate =
    form.scheduledAt && form.scheduledTime
      ? new Date(`${form.scheduledAt}T${form.scheduledTime}:00`)
      : null;

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-10 py-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#6b7f79] hover:text-[#071a15] font-semibold text-sm transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Page title */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">
          Hiring
        </p>
        <h1 className="text-3xl font-extrabold text-[#071a15]">
          Schedule Interview
        </h1>
        <p className="text-[#4a5a55] font-medium mt-1">
          Set the date, time, and details for the interview.
        </p>
      </div>

      {/* Candidate card */}
      {!infoLoading && applicationInfo && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6b7f79] mb-3">
            Candidate
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#051612] flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
              {applicationInfo.seekerImage ? (
                <img
                  src={applicationInfo.seekerImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                `${applicationInfo.seekerFirstName.charAt(0)}${applicationInfo.seekerLastName.charAt(0)}`
              )}
            </div>
            <div>
              <p className="font-extrabold text-[#071a15]">
                {applicationInfo.seekerFirstName}{" "}
                {applicationInfo.seekerLastName}
              </p>
              <p className="text-sm text-[#6b7f79]">
                Applying for: {applicationInfo.jobTitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {!applicationId && !infoLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-bold text-yellow-700">
            No application ID provided. Please go back and click Schedule
            Interview from an accepted applicant.
          </p>
        </div>
      )}

      {/* Main form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

        {/* Mode toggle */}
        <div>
          <label className={labelClass}>Interview Mode</label>
          <div className="grid grid-cols-2 gap-3">
            {(["remote", "onsite"] as InterviewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeChange(mode)}
                className={`py-3.5 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                  form.mode === mode
                    ? "bg-[#051612] text-white border-[#051612]"
                    : "border-[#d1e8e3] text-[#071a15] hover:border-[#40b594] hover:bg-[#f0f9f6]"
                }`}
              >
                {mode === "remote" ? (
                  <>
                    <Clock size={15} />
                    Remote / Online
                  </>
                ) : (
                  <>
                    <MapPin size={15} />
                    On-site
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.scheduledAt}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                handleFieldChange("scheduledAt", e.target.value)
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={form.scheduledTime}
              onChange={(e) =>
                handleFieldChange("scheduledTime", e.target.value)
              }
              className={inputClass}
            />
          </div>
        </div>

        {/* Location / Meeting link */}
        <div>
          <label className={labelClass}>
            {form.mode === "remote" ? "Meeting Link" : "Location / Address"}
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => handleFieldChange("location", e.target.value)}
            placeholder={
              form.mode === "remote"
                ? "e.g. https://meet.google.com/abc-xyz"
                : "e.g. 123 Main Street, Phnom Penh"
            }
            className={inputClass}
          />
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Notes for Candidate</label>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            placeholder="e.g. Please bring a portfolio. The interview will last about 45 minutes."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Live preview */}
        {previewDate && (
          <div className="bg-[#f0f9f6] rounded-xl p-4 border border-[#d1e8e3]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#40b594] mb-3">
              Interview Summary
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-[#40b594] flex-shrink-0" />
                <p className="text-sm font-bold text-[#071a15]">
                  {previewDate.toLocaleString("en-US", {
                    weekday: "long",
                    month:   "long",
                    day:     "numeric",
                    year:    "numeric",
                    hour:    "numeric",
                    minute:  "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {form.mode === "remote" ? (
                  <Clock size={15} className="text-[#40b594] flex-shrink-0" />
                ) : (
                  <MapPin size={15} className="text-[#40b594] flex-shrink-0" />
                )}
                <p className="text-sm text-[#6b7f79] font-medium">
                  {form.mode === "remote"
                    ? "Remote / Online interview"
                    : "On-site interview"}
                  {form.location ? ` · ${form.location}` : ""}
                </p>
              </div>
              {applicationInfo && (
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-[#40b594] flex-shrink-0" />
                  <p className="text-sm text-[#6b7f79] font-medium">
                    {applicationInfo.seekerFirstName}{" "}
                    {applicationInfo.seekerLastName}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || !applicationId}
            className="flex-1 bg-[#051612] text-white py-3.5 rounded-xl font-extrabold text-sm hover:bg-[#0d2a23] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Scheduling..." : "Schedule Interview"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3.5 rounded-xl font-extrabold text-sm border-2 border-[#d1e8e3] text-[#071a15] hover:bg-[#f0f9f6] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleInterviewPage() {
  return (
    <div className="min-h-screen bg-[#f0f4f3] font-sans pb-16">
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="/dashboard">
            <button className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </button>
          </Link>
          <Link href="/post_job">
            <button className="text-gray-300 hover:text-white transition-colors">
              Post Job
            </button>
          </Link>
          <Link href="/employer_message">
            <button className="text-gray-300 hover:text-white transition-colors">
              Messages
            </button>
          </Link>
          <Link href="/employer_notification">
            <button className="text-gray-300 hover:text-white transition-colors">
              Notification
            </button>
          </Link>
          <Link href="/subscription">
            <button className="text-gray-300 hover:text-white transition-colors">
              Subscription
            </button>
          </Link>
          <Link href="/employer_setting">
            <button className="text-gray-300 hover:text-white transition-colors">
              Settings
            </button>
          </Link>
        </nav>
        <EmployerNavProfile />
      </header>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <p className="text-[#6b7f79] font-medium">Loading...</p>
          </div>
        }
      >
        <ScheduleForm />
      </Suspense>
    </div>
  );
}