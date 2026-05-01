"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  X,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  Building2,
  ExternalLink,
  FileText,
  Send,
  Briefcase,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import UserNavProfile from "@/components/ui/UserNavProfile";

const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const experienceOptions = ["Entry Level", "Mid Level", "Senior", "Lead / Manager", "Executive"];
const salaryOptions = ["$50k – $100k", "$100k – $150k", "$150k – $200k", "$200k+"];

const tagColors: Record<string, string> = {
  full_time: "bg-emerald-50 text-emerald-700 border-emerald-100",
  part_time: "bg-blue-50 text-blue-700 border-blue-100",
  contract: "bg-orange-50 text-orange-700 border-orange-100",
  freelance: "bg-pink-50 text-pink-700 border-pink-100",
  internship: "bg-yellow-50 text-yellow-700 border-yellow-100",
  remote: "bg-violet-50 text-violet-700 border-violet-100",
  on_site: "bg-gray-50 text-gray-600 border-gray-200",
  hybrid: "bg-teal-50 text-teal-700 border-teal-100",
  senior: "bg-amber-50 text-amber-700 border-amber-100",
  mid: "bg-sky-50 text-sky-700 border-sky-100",
  entry: "bg-rose-50 text-rose-700 border-rose-100",
  executive: "bg-indigo-50 text-indigo-700 border-indigo-100",
  lead: "bg-purple-50 text-purple-700 border-purple-100",
};

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return "Negotiable";
  if (min && max) return `$${(min / 1000).toFixed(0)}k – $${(max / 1000).toFixed(0)}k`;
  if (min) return `From $${(min / 1000).toFixed(0)}k`;
  return `Up to $${(max! / 1000).toFixed(0)}k`;
}

function formatLabel(val: string) {
  const map: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    freelance: "Freelance",
    internship: "Internship",
    on_site: "On-site",
    remote: "Remote",
    hybrid: "Hybrid",
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior",
    lead: "Lead / Manager",
    executive: "Executive",
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

// ── JOB DETAIL MODAL ──────────────────────────────────────────────────────────
function JobDetailModal({
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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,22,18,0.55)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f0f9f6] border border-[#d1e8e3] flex items-center justify-center overflow-hidden shrink-0">
              {job.companyImage ? (
                <img src={job.companyImage} alt={job.companyName ?? ""} className="w-full h-full object-cover" />
              ) : (
                <Building2 size={24} className="text-[#40b594]" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#071a15]">{job.title}</h2>
              {job.companyName && (
                <p className="text-sm font-semibold text-[#40b594]">{job.companyName}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <MapPin size={11} /> {job.location}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <Clock size={11} /> {timeAgo(job.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#6b7f79] hover:bg-gray-100 shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            {([job.employmentType, job.arrangement, job.experienceLevel] as string[])
              .filter(Boolean)
              .map((tag) => (
                <span
                  key={tag}
                  className={"text-xs font-bold px-3 py-1.5 rounded-lg border " + (tagColors[tag] ?? "bg-gray-50 text-gray-600 border-gray-200")}
                >
                  {formatLabel(tag)}
                </span>
              ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-3 bg-[#f8faf9] rounded-xl p-4">
              <DollarSign size={16} className="text-[#40b594] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7f79]">Salary</p>
                <p className="text-sm font-bold text-[#071a15]">{formatSalary(job.salaryMin, job.salaryMax)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-[#f8faf9] rounded-xl p-4">
              <MapPin size={16} className="text-[#40b594] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7f79]">Location</p>
                <p className="text-sm font-bold text-[#071a15]">{job.location}</p>
              </div>
            </div>
            {job.category && (
              <div className="flex items-start gap-3 bg-[#f8faf9] rounded-xl p-4">
                <Briefcase size={16} className="text-[#40b594] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7f79]">Category</p>
                  <p className="text-sm font-bold text-[#071a15]">{job.category}</p>
                </div>
              </div>
            )}
            {job.applicationDeadline && (
              <div className="flex items-start gap-3 bg-[#f8faf9] rounded-xl p-4">
                <Calendar size={16} className="text-[#40b594] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7f79]">Deadline</p>
                  <p className="text-sm font-bold text-[#071a15]">
                    {new Date(job.applicationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {job.description && (
            <div>
              <h3 className="text-sm font-extrabold text-[#071a15] mb-3">Job Description</h3>
              <div className="bg-[#f8faf9] border border-gray-100 rounded-xl px-5 py-4">
                <p className="text-sm text-[#4a5a55] leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>
          )}

          {job.requirements && (
            <div>
              <h3 className="text-sm font-extrabold text-[#071a15] mb-3">Requirements</h3>
              <div className="bg-[#f8faf9] border border-gray-100 rounded-xl px-5 py-4">
                <p className="text-sm text-[#4a5a55] leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </div>
          )}

          {job.companyName && (
            <div>
              <h3 className="text-sm font-extrabold text-[#071a15] mb-3">About the Company</h3>
              <div className="flex items-start gap-4 bg-[#f8faf9] rounded-xl p-5 border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-[#f0f9f6] border border-[#d1e8e3] flex items-center justify-center shrink-0 overflow-hidden">
                  {job.companyImage ? (
                    <img src={job.companyImage} alt={job.companyName} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={20} className="text-[#40b594]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#071a15]">{job.companyName}</p>
                  {job.companyIndustry && (
                    <p className="text-xs font-semibold text-[#40b594] mt-0.5">{job.companyIndustry}</p>
                  )}
                  {job.companyDescription && (
                    <p className="text-xs text-[#6b7f79] mt-2 leading-relaxed line-clamp-3">{job.companyDescription}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {job.applicationPlatform === "external" && job.externalApplyLink && (
            <a href={job.externalApplyLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-[#0a7e61] hover:underline">
              <ExternalLink size={14} />
              Apply on external site
            </a>
          )}
        </div>

        <div className="px-8 py-5 border-t border-gray-100 bg-[#f8faf9] flex items-center gap-3">
          <button
            onClick={onSave}
            className={"p-3 rounded-xl border transition-all " + (saved ? "bg-[#f0f9f6] border-[#c8e6dd] text-[#40b594]" : "bg-white border-gray-200 text-gray-400 hover:border-gray-300")}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          <button
            onClick={onApply}
            disabled={applied}
            className={"flex-1 py-3 rounded-xl font-extrabold text-sm transition-all " + (applied ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#051612] text-white hover:bg-[#0d2a23]")}
          >
            {applied ? "Already Applied" : "Apply Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── APPLY MODAL ───────────────────────────────────────────────────────────────
function ApplyModal({
  job,
  onClose,
  onSubmitted,
}: {
  job: Job;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    try {
      setApplying(true);
      const form = new FormData();
      form.append("jobId", job.id);
      form.append("coverLetter", coverLetter);
      if (cvFile) form.append("cvFile", cvFile);

      const res = await fetch("/api/applications", {
        method: "POST",
        body: form,
      });

      if (res.ok) {
        onSubmitted();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to apply");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(5,22,18,0.6)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#071a15]">
              Apply: {job.title}
            </h2>
            {job.companyName && (
              <p className="text-sm text-[#6b7f79] font-medium mt-0.5">
                {job.companyName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6b7f79] hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5">
          <div className="bg-[#f0f9f6] border border-[#d1e8e3] rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold text-[#071a15]">{job.title}</p>
              <p className="text-xs text-[#6b7f79] mt-0.5">
                {formatSalary(job.salaryMin, job.salaryMax)} &middot;{" "}
                {formatLabel(job.arrangement)} &middot; {job.location}
              </p>
            </div>
            <span className="text-xs font-bold text-[#40b594] bg-white px-3 py-1 rounded-lg border border-[#d1e8e3]">
              {formatLabel(job.employmentType)}
            </span>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-[#071a15] mb-2">
              Cover Letter{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the employer why you're a great fit..."
              className="w-full rounded-xl border border-gray-200 bg-[#f8faf9] px-4 py-3 text-sm font-medium text-[#071a15] resize-none focus:outline-none focus:ring-2 focus:ring-[#40b594]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-[#071a15] mb-2">
              Upload CV{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-[#d1e8e3] rounded-xl px-4 py-3 hover:border-[#40b594] transition-all">
              <FileText size={18} className="text-[#40b594]" />
              <span className="text-sm font-medium text-[#6b7f79]">
                {cvFile ? cvFile.name : "Click to upload PDF, DOC, DOCX"}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-[#f8faf9] flex gap-3">
          <button
            onClick={handleApply}
            disabled={applying}
            className="flex-1 bg-[#051612] text-white py-3 rounded-xl font-extrabold text-sm hover:bg-[#0d2a23] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Send size={15} />
            {applying ? "Submitting..." : "Submit Application"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-sm border border-gray-200 text-[#6b7f79] hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const JobSeekerHome = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("Most Relevant");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [jobListings, setJobListings] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  const [filters, setFilters] = useState({
    jobType: "",
    experience: "",
    salary: "",
    arrangement: "",
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (filters.jobType) params.set("type", filters.jobType);
      if (filters.arrangement) params.set("arrangement", filters.arrangement);
      if (filters.experience) params.set("experience", filters.experience);

      const res = await fetch(`/api/jobs?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setJobListings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [savedRes, appliedRes] = await Promise.all([
          fetch("/api/saved-jobs", { cache: "no-store" }),
          fetch("/api/applications", { cache: "no-store" }),
        ]);
        if (savedRes.ok) {
          const saved = await savedRes.json();
          setSavedJobIds(new Set((saved as any[]).map((s) => s.jobId)));
        }
        if (appliedRes.ok) {
          const applied = await appliedRes.json();
          setAppliedJobIds(new Set((applied as any[]).map((a) => a.jobId)));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = () => setSearchQuery(searchInput);

  const toggleSave = async (job: Job) => {
    const isSaved = savedJobIds.has(job.id);
    if (isSaved) {
      await fetch(`/api/jobs/${job.id}/save`, { method: "DELETE" });
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
    } else {
      await fetch(`/api/jobs/${job.id}/save`, { method: "POST" });
      setSavedJobIds((prev) => new Set([...prev, job.id]));
    }
  };

  const clearFilters = () =>
    setFilters({ jobType: "", experience: "", salary: "", arrangement: "" });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const sortedJobs = [...jobListings].sort((a, b) => {
    if (sortBy === "Newest First")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "Highest Salary")
      return (b.salaryMax ?? 0) - (a.salaryMax ?? 0);
    return 0;
  });

  const pillFilters: { key: keyof typeof filters; label: string; options: string[] }[] = [
    { key: "jobType", label: "Job Type", options: jobTypeOptions },
    { key: "arrangement", label: "Work Mode", options: ["On-site", "Remote", "Hybrid"] },
    { key: "experience", label: "Experience", options: experienceOptions },
    { key: "salary", label: "Salary", options: salaryOptions },
  ];

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: "#f0f4f3" }}>
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSave={() => toggleSave(selectedJob)}
          onApply={() => {
            setSelectedJob(null);
            setApplyJob(selectedJob);
          }}
          saved={savedJobIds.has(selectedJob.id)}
          applied={appliedJobIds.has(selectedJob.id)}
        />
      )}

      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSubmitted={() =>
            setAppliedJobIds((prev) => new Set([...prev, applyJob.id]))
          }
        />
      )}

      {/* HEADER */}
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Home</button>
          <Link href="/saved">
            <button className="text-gray-300 hover:text-white transition-colors">My Jobs</button>
          </Link>
          <Link href="/message">
            <button className="text-gray-300 hover:text-white transition-colors">Messages</button>
          </Link>
          <Link href="/notification">
            <button className="text-gray-300 hover:text-white transition-colors">Notifications</button>
          </Link>
          <Link href="/setting">
            <button className="text-gray-300 hover:text-white transition-colors">Settings</button>
          </Link>
        </nav>
        <UserNavProfile />
      </header>

      {/* HERO */}
      <section className="bg-[#051612] text-white pt-16 pb-28 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={13} className="text-[#40b594]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#40b594]">
              {jobListings.length} active roles
            </span>
          </div>
          <h1 className="text-5xl font-extrabold mb-3 leading-tight tracking-tight">
            Your Next Great Role
          </h1>
          <p className="text-gray-400 text-base mb-10 max-w-md leading-relaxed font-medium">
            Discover opportunities matched to your skills, experience, and career goals.
          </p>

          <div className="flex gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Job title, company, or skill..."
                className="w-full bg-white text-[#071a15] py-3.5 pl-11 pr-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#40b594]/40 placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#40b594] text-[#051612] px-8 py-3.5 rounded-xl font-extrabold text-sm hover:bg-[#34a382] transition-all"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5" ref={dropdownRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all " +
                (showFilters
                  ? "bg-[#40b594] border-[#40b594] text-[#051612]"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10")
              }
            >
              <SlidersHorizontal size={12} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#051612] text-[#40b594] rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-extrabold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilters &&
              pillFilters.map(({ key, label, options }) => (
                <div key={key} className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
                    className={
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all " +
                      (filters[key]
                        ? "bg-[#40b594] border-[#40b594] text-[#051612]"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10")
                    }
                  >
                    {filters[key] || label}
                    {filters[key] ? (
                      <X
                        size={11}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilters((p) => ({ ...p, [key]: "" }));
                        }}
                      />
                    ) : (
                      <ChevronDown
                        size={11}
                        className={"transition-transform " + (activeDropdown === key ? "rotate-180" : "")}
                      />
                    )}
                  </button>

                  {activeDropdown === key && (
                    <div className="absolute left-0 top-full mt-2 w-52 bg-[#0d2219] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="py-1.5">
                        {options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setFilters((p) => ({ ...p, [key]: opt }));
                              setActiveDropdown(null);
                            }}
                            className={
                              "w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors " +
                              (filters[key] === opt
                                ? "bg-[#40b594]/20 text-[#40b594]"
                                : "text-gray-300 hover:bg-white/5 hover:text-white")
                            }
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors px-1"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </section>

      {/* JOB LISTINGS */}
      <main className="max-w-4xl mx-auto px-8 -mt-14">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-bold text-[#4a5a55]">
            {loading
              ? "Loading..."
              : `${sortedJobs.length} position${sortedJobs.length !== 1 ? "s" : ""} found`}
            {activeFilterCount > 0 && !loading && (
              <span className="text-[#40b594] ml-1">
                &middot; {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
              </span>
            )}
          </p>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-[#4a5a55] bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 appearance-none cursor-pointer"
            >
              <option>Most Relevant</option>
              <option>Newest First</option>
              <option>Highest Salary</option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7f79] pointer-events-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 mt-14">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 animate-pulse">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center mt-14">
            <div className="w-12 h-12 bg-[#f0f9f6] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#d1e8e3]">
              <Search size={20} className="text-[#40b594]" />
            </div>
            <h3 className="text-base font-extrabold text-[#071a15] mb-1">No jobs found</h3>
            <p className="text-sm text-[#6b7f79] font-medium">
              Try adjusting your search or clearing some filters.
            </p>
            <button
              onClick={() => { clearFilters(); setSearchQuery(""); setSearchInput(""); }}
              className="mt-5 px-6 py-2.5 bg-[#051612] text-white rounded-xl text-sm font-bold hover:bg-[#0d2a23] transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-14">
            {sortedJobs.map((job) => {
              const isSaved = savedJobIds.has(job.id);
              const isApplied = appliedJobIds.has(job.id);

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#c8e6dd] transition-all duration-200"
                >
                  <div className="p-7">
                    <div className="flex items-start gap-5">
                      {/* Company logo */}
                      <div className="w-12 h-12 rounded-xl bg-[#f0f9f6] border border-[#d1e8e3] flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                        {job.companyImage ? (
                          <img src={job.companyImage} alt={job.companyName ?? ""} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 size={20} className="text-[#40b594]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title + save button */}
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div>
                            <h2 className="text-lg font-extrabold text-[#071a15] leading-snug">
                              {job.title}
                            </h2>
                            {job.companyName && (
                              <p className="text-sm font-semibold text-[#4a7063] mt-0.5">
                                {job.companyName}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => toggleSave(job)}
                            className={
                              "p-2 rounded-xl border transition-all shrink-0 " +
                              (isSaved
                                ? "bg-[#f0f9f6] border-[#c8e6dd] text-[#40b594]"
                                : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600")
                            }
                          >
                            {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                          </button>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center flex-wrap gap-4 mb-3 mt-2">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                            <MapPin size={12} /> {job.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                            <Clock size={12} /> {timeAgo(job.createdAt)}
                          </span>
                          {job.applicationDeadline && (
                            <span className="text-xs font-semibold text-[#6b7f79]">
                              Deadline:{" "}
                              {new Date(job.applicationDeadline).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 leading-relaxed mb-5 font-medium line-clamp-2">
                          {job.description}
                        </p>

                        {/* Bottom row */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1 text-base font-extrabold text-[#071a15]">
                              <DollarSign size={14} className="text-[#40b594]" />
                              {formatSalary(job.salaryMin, job.salaryMax)}
                            </span>
                            <div className="flex gap-1.5 flex-wrap">
                              {([job.employmentType, job.arrangement, job.experienceLevel] as string[])
                                .filter(Boolean)
                                .map((tag) => (
                                  <span
                                    key={tag}
                                    className={
                                      "text-[11px] font-bold px-2.5 py-1 rounded-md border " +
                                      (tagColors[tag] ?? "bg-gray-50 text-gray-600 border-gray-200")
                                    }
                                  >
                                    {formatLabel(tag)}
                                  </span>
                                ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => setSelectedJob(job)}
                              className="px-5 py-2.5 rounded-xl border border-[#d1e8e3] text-[#071a15] font-bold text-xs hover:bg-[#f0f9f6] transition-all"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => setApplyJob(job)}
                              disabled={isApplied}
                              className={
                                "px-5 py-2.5 rounded-xl font-bold text-xs transition-all " +
                                (isApplied
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-[#051612] text-white hover:bg-[#0d2a23]")
                              }
                            >
                              {isApplied ? "Applied" : "Apply Now"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {sortedJobs.length > 0 && !loading && (
          <div className="text-center mt-10">
            <button
              onClick={fetchJobs}
              className="px-8 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#4a5a55] bg-white hover:border-[#40b594] hover:text-[#40b594] transition-all"
            >
              Refresh jobs
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobSeekerHome;