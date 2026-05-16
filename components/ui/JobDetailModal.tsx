"use client";

import React, { useEffect } from "react";
import {
  X,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Calendar,
  Monitor,
  CheckCircle2,
} from "lucide-react";

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return "Negotiable";
  if (min && max) return `$${(min / 1000).toFixed(0)}k – $${(max / 1000).toFixed(0)}k`;
  if (min) return `From $${(min / 1000).toFixed(0)}k`;
  return `Up to $${(max! / 1000).toFixed(0)}k`;
}

function formatLabel(val: string) {
  const map: Record<string, string> = {
    full_time: "Full-time", part_time: "Part-time", contract: "Contract",
    freelance: "Freelance", internship: "Internship",
    on_site: "On-site", remote: "Remote", hybrid: "Hybrid",
    entry: "Entry Level", mid: "Mid Level", senior: "Senior",
    lead: "Lead / Manager", executive: "Executive",
  };
  return map[val] ?? val;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

const tagColors: Record<string, string> = {
  full_time:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  part_time:  "bg-blue-50 text-blue-700 border-blue-200",
  contract:   "bg-orange-50 text-orange-700 border-orange-200",
  freelance:  "bg-pink-50 text-pink-700 border-pink-200",
  internship: "bg-yellow-50 text-yellow-700 border-yellow-200",
  remote:     "bg-violet-50 text-violet-700 border-violet-200",
  on_site:    "bg-gray-50 text-gray-600 border-gray-200",
  hybrid:     "bg-teal-50 text-teal-700 border-teal-200",
  senior:     "bg-amber-50 text-amber-700 border-amber-200",
  mid:        "bg-sky-50 text-sky-700 border-sky-200",
  entry:      "bg-rose-50 text-rose-700 border-rose-200",
  executive:  "bg-indigo-50 text-indigo-700 border-indigo-200",
  lead:       "bg-purple-50 text-purple-700 border-purple-200",
};

type Job = {
  id: string;
  title: string;
  category: string;
  location: string;
  arrangement: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  requirements: string | null;
  applicationDeadline: string | null;
  applicationPlatform: string;
  externalApplyLink: string | null;
  status: string;
  createdAt: string;
  employerId: string;
  companyName: string | null;
  companyImage: string | null;
  companyIndustry: string | null;
  companyDescription: string | null;
};

// Match your sticky navbar height in px
const NAVBAR_HEIGHT = 64;

export function JobDetailModal({
  job,
  onClose,
  onSave,
  onApply,
  saved,
  applied,
}: {
  job: Job;
  onClose: () => void;
  onSave: () => void;
  onApply: () => void;
  saved: boolean;
  applied: boolean;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  const tags = [job.employmentType, job.arrangement, job.experienceLevel].filter(Boolean);
  const toLines = (text: string) =>
    text.split(/\n+/).map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  const descLines = toLines(job.description ?? "");
  const reqLines  = toLines(job.requirements ?? "");

  return (
    <>
      {/* Full-screen dim — navbar (z-50) renders on top naturally */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(5,22,18,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Positioner — starts below navbar, centers modal in remaining space */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center px-4"
        style={{ top: NAVBAR_HEIGHT }}
        onClick={onClose}
      >
        {/* White card — same style as ApplyModal */}
        <div
          className="bg-white rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden"
          style={{
            maxHeight: `calc(100vh - ${NAVBAR_HEIGHT}px - 2.5rem)`,
            boxShadow: "0 20px 60px rgba(5,22,18,0.18)",
          }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── HEADER ─────────────────────────────────────────────────────── */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#f0f9f6] border border-[#d1e8e3] flex items-center justify-center overflow-hidden shrink-0">
                {job.companyImage
                  ? <img src={job.companyImage} alt={job.companyName ?? ""} className="w-full h-full object-cover" />
                  : <Building2 size={20} className="text-[#40b594]" />}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#071a15]">{job.title}</h2>
                {job.companyName && (
                  <p className="text-sm font-semibold text-[#40b594] mt-0.5">{job.companyName}</p>
                )}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <MapPin size={11} /> {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <Clock size={11} /> {timeAgo(job.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── SCROLLABLE BODY ───────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

            {/* Job summary pill — mirrors the job info card in ApplyModal */}
            <div className="bg-[#f0f9f6] border border-[#d1e8e3] rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-extrabold text-[#071a15]">{job.title}</p>
                <p className="text-xs text-[#6b7f79] mt-0.5 font-medium">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                  {job.arrangement && <> &middot; {formatLabel(job.arrangement)}</>}
                  {job.location && <> &middot; {job.location}</>}
                  {job.applicationDeadline && (
                    <> &middot; <span className="text-amber-600 font-semibold">
                      Due {new Date(job.applicationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span></>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={"text-xs font-bold px-3 py-1 rounded-lg border " + (tagColors[tag] ?? "bg-gray-50 text-gray-600 border-gray-200")}
                  >
                    {formatLabel(tag)}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#f8faf9] rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7f79] mb-1 flex items-center gap-1">
                  <DollarSign size={10} className="text-[#40b594]" /> Salary
                </p>
                <p className="text-sm font-extrabold text-[#071a15]">{formatSalary(job.salaryMin, job.salaryMax)}</p>
              </div>
              <div className="bg-[#f8faf9] rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7f79] mb-1 flex items-center gap-1">
                  <Monitor size={10} className="text-[#40b594]" /> Mode
                </p>
                <p className="text-sm font-extrabold text-[#071a15]">{formatLabel(job.arrangement)}</p>
              </div>
              <div className="bg-[#f8faf9] rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7f79] mb-1 flex items-center gap-1">
                  <Briefcase size={10} className="text-[#40b594]" /> Field
                </p>
                <p className="text-sm font-extrabold text-[#071a15] truncate">{job.category || "—"}</p>
              </div>
              {job.applicationDeadline ? (
                <div className="bg-[#f8faf9] rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7f79] mb-1 flex items-center gap-1">
                    <Calendar size={10} className="text-[#40b594]" /> Deadline
                  </p>
                  <p className="text-sm font-extrabold text-[#071a15]">
                    {new Date(job.applicationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              ) : (
                <div className="bg-[#f8faf9] rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7f79] mb-1 flex items-center gap-1">
                    <MapPin size={10} className="text-[#40b594]" /> Location
                  </p>
                  <p className="text-sm font-extrabold text-[#071a15] truncate">{job.location}</p>
                </div>
              )}
            </div>

            {/* Job Description */}
            {job.description && (
              <div>
                <label className="block text-sm font-extrabold text-[#071a15] mb-2">
                  Job Description
                </label>
                <div className="bg-[#f8faf9] border border-gray-100 rounded-xl px-5 py-4">
                  {descLines.length > 1 ? (
                    <ul className="space-y-2">
                      {descLines.map((line, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-[#40b594] shrink-0 mt-0.5" />
                          <p className="text-sm text-[#4a5a55] leading-relaxed font-medium">{line}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[#4a5a55] leading-relaxed font-medium whitespace-pre-wrap">
                      {job.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div>
                <label className="block text-sm font-extrabold text-[#071a15] mb-2">
                  Requirements
                </label>
                <div className="bg-[#f8faf9] border border-gray-100 rounded-xl px-5 py-4">
                  {reqLines.length > 1 ? (
                    <ul className="space-y-2">
                      {reqLines.map((line, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#40b594] shrink-0" />
                          <p className="text-sm text-[#4a5a55] leading-relaxed font-medium">{line}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[#4a5a55] leading-relaxed font-medium whitespace-pre-wrap">
                      {job.requirements}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* About the Company */}
            {job.companyName && (
              <div>
                <label className="block text-sm font-extrabold text-[#071a15] mb-2">
                  About the Company
                </label>
                <div className="flex items-start gap-4 bg-[#f8faf9] rounded-xl p-5 border border-gray-100">
                  <div className="w-11 h-11 rounded-xl bg-[#f0f9f6] border border-[#d1e8e3] flex items-center justify-center shrink-0 overflow-hidden">
                    {job.companyImage
                      ? <img src={job.companyImage} alt={job.companyName} className="w-full h-full object-cover" />
                      : <Building2 size={18} className="text-[#40b594]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[#071a15]">{job.companyName}</p>
                    {job.companyIndustry && (
                      <p className="text-xs font-semibold text-[#40b594] mt-0.5">{job.companyIndustry}</p>
                    )}
                    {job.companyDescription && (
                      <p className="text-xs text-[#6b7f79] mt-2 leading-relaxed">{job.companyDescription}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* External link */}
            {job.applicationPlatform === "external" && job.externalApplyLink && (
              <a
                href={job.externalApplyLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0a7e61] hover:underline"
              >
                <ExternalLink size={13} /> Apply on external site
              </a>
            )}
          </div>

          {/* ── FOOTER — matches ApplyModal footer exactly ──────────────────── */}
          <div className="px-8 py-5 border-t border-gray-100 bg-[#f8faf9] flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onSave}
              title={saved ? "Unsave" : "Save job"}
              className={"w-11 h-11 rounded-xl border flex items-center justify-center transition-all shrink-0 " +
                (saved
                  ? "bg-[#f0f9f6] border-[#c8e6dd] text-[#40b594]"
                  : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600")}
            >
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>

            <button
              onClick={onApply}
              disabled={applied}
              className={"flex-1 h-11 rounded-xl font-extrabold text-sm transition-all " +
                (applied
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#051612] text-white hover:bg-[#0d2a23]")}
            >
              {applied ? "Already Applied" : "Apply Now"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}