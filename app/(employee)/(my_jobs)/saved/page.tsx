"use client";
import React, { useEffect, useState } from "react";
import { Bookmark, X, Send, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserNavProfile from "@/components/ui/UserNavProfile";

type SavedJob = {
  savedId: string;
  jobId: string;
  title: string;
  company: string;
  description: string;
  salary: string;
  tags: string[];
  salaryMin: number | null;
  salaryMax: number | null;
};

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return "Negotiable";
  if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  if (min) return `From $${(min / 1000).toFixed(0)}k`;
  return `Up to $${(max! / 1000).toFixed(0)}k`;
}

function formatTag(value: string | null) {
  if (!value) return null;
  const map: Record<string, string> = {
    full_time: "Full-time", part_time: "Part-time", contract: "Contract",
    freelance: "Freelance", internship: "Internship", on_site: "On-site",
    remote: "Remote", hybrid: "Hybrid", entry: "Entry Level", mid: "Mid Level",
    senior: "Senior", lead: "Lead / Manager", executive: "Executive",
  };
  return map[value] ?? value;
}

const MyApplications = () => {
  const pathname = usePathname();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [applyModalJob, setApplyModalJob] = useState<SavedJob | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);

  const tabs = [
    { name: "Saved", path: "/saved" },
    { name: "Applied", path: "/applied" },
    { name: "Interviews", path: "/interviews" },
    { name: "Archived", path: "/archived" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [savedRes, appliedRes] = await Promise.all([
          fetch("/api/saved-jobs", { cache: "no-store" }),
          fetch("/api/applications", { cache: "no-store" }),
        ]);

        const savedData = await savedRes.json();
        const appliedData = await appliedRes.json();

        // /api/applications returns { jobId, status, ... }
        // already excludes archived/withdrawn server-side
        if (appliedRes.ok && Array.isArray(appliedData)) {
          const ids = new Set<string>(
            appliedData.map((item: any) => item.jobId as string)
          );
          setAppliedJobIds(ids);
        }

        if (!savedRes.ok) return;

        // /api/saved-jobs returns:
        // savedId, id (jobId), title, companyName, arrangement,
        // employmentType, experienceLevel, salaryMin, salaryMax
        // NOTE: description is NOT returned — jobs table has it but
        // the select doesn't include it, so we default to ""
        const mapped = (savedData || []).map((item: any) => ({
          savedId: item.savedId,       // savedJobs.id
          jobId: item.id,              // jobs.id
          title: item.title,
          company: item.companyName ?? "",
          description: "",             // not in select — add jobs.description to backend if needed
          salary: formatSalary(item.salaryMin, item.salaryMax),
          salaryMin: item.salaryMin,
          salaryMax: item.salaryMax,
          tags: [
            formatTag(item.employmentType),
            formatTag(item.arrangement),
            formatTag(item.experienceLevel),
          ].filter(Boolean) as string[],
        }));

        setSavedJobs(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // DELETE /api/saved-jobs?jobId=xxx  ✅ matches backend
  const handleUnsave = async (jobId: string, savedId: string) => {
    try {
      await fetch(`/api/saved-jobs?jobId=${jobId}`, { method: "DELETE" });
      setSavedJobs((prev) => prev.filter((j) => j.savedId !== savedId));
    } catch (error) {
      console.error(error);
    }
  };

  // POST /api/applications with FormData { jobId, coverLetter, cvFile }  ✅ matches backend
  const handleApply = async () => {
    if (!applyModalJob) return;
    try {
      setApplying(true);
      const form = new FormData();
      form.append("jobId", applyModalJob.jobId);
      form.append("coverLetter", coverLetter);
      if (cvFile) form.append("cvFile", cvFile); // backend reads formData.get("cvFile")
      const res = await fetch("/api/applications", { method: "POST", body: form });
      if (res.ok) {
        setAppliedJobIds((prev) => new Set(prev).add(applyModalJob.jobId));
        alert("Application submitted successfully!");
        setApplyModalJob(null);
        setCoverLetter("");
        setCvFile(null);
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to apply");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">NexHire</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/home_page"><button className="hover:text-gray-300 transition-colors">Home</button></Link>
          <Link href="/saved"><button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">My Jobs</button></Link>
          <Link href="/message"><button className="hover:text-gray-300 transition-colors">Messages</button></Link>
          <Link href="/notification"><button className="hover:text-gray-300 transition-colors">Notification</button></Link>
          <Link href="/setting"><button className="hover:text-gray-300 transition-colors">Settings</button></Link>
        </nav>
        <UserNavProfile />
      </header>

      <main className="max-w-5xl mx-auto p-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-2">My Applications</h1>
          <p className="text-gray-400 font-medium">Track and manage your job applications</p>
        </div>

        <div className="flex gap-10 border-b border-gray-400 mb-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link key={tab.name} href={tab.path}>
                <button className={`pb-4 px-1 flex flex-col items-start relative transition-all ${isActive ? "text-[#153a30]" : "text-gray-400 hover:text-gray-600"}`}>
                  <span className="text-xs font-bold mb-1">
                    {tab.name === "Saved" ? savedJobs.length : 0}
                  </span>
                  <span className="text-lg font-bold">{tab.name}</span>
                  {isActive && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#153a30] rounded-full" />}
                </button>
              </Link>
            );
          })}
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading saved jobs...</div>
        ) : savedJobs.length === 0 ? (
          <div className="text-sm text-gray-500">No saved jobs yet.</div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => {
              const isApplied = appliedJobIds.has(job.jobId);
              return (
                <div key={job.savedId} className="py-6 border-b border-gray-400">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-xl font-extrabold text-[#1a1a1a] mb-1">{job.title}</h2>
                      <p className="text-gray-400 text-sm font-bold mb-4">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isApplied ? (
                        <button
                          disabled
                          className="bg-[#e5e7eb] text-[#9ca3af] px-6 py-1.5 rounded-lg font-bold text-sm cursor-not-allowed"
                        >
                          Applied
                        </button>
                      ) : (
                        <button
                          onClick={() => setApplyModalJob(job)}
                          className="bg-[#153a30] text-white px-6 py-1.5 rounded-lg font-bold text-sm hover:bg-[#0d2a23] transition-colors"
                        >
                          Apply
                        </button>
                      )}
                      <button
                        onClick={() => handleUnsave(job.jobId, job.savedId)}
                        title="Click to unsave"
                        className="text-black hover:text-gray-400 transition-colors"
                      >
                        <Bookmark size={22} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-extrabold text-[#1a1a1a]">{job.salary}</span>
                    <div className="flex gap-2 flex-wrap">
                      {job.tags.map((tag) => (
                        <span key={tag} className="bg-[#153a30] text-white text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Apply Modal */}
      {applyModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#071a15]">Apply: {applyModalJob.title}</h2>
                <p className="text-sm text-[#6b7f79]">{applyModalJob.company}</p>
              </div>
              <button
                onClick={() => { setApplyModalJob(null); setCoverLetter(""); setCvFile(null); }}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-extrabold text-[#071a15] mb-2">
                  Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
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
                  Upload CV <span className="text-gray-400 font-normal">(optional)</span>
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
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 bg-[#051612] text-white py-3 rounded-xl font-extrabold text-sm hover:bg-[#0d2a23] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Send size={15} />
                {applying ? "Submitting..." : "Submit Application"}
              </button>
              <button
                onClick={() => { setApplyModalJob(null); setCoverLetter(""); setCvFile(null); }}
                className="px-6 py-3 rounded-xl font-bold text-sm border border-gray-200 text-[#6b7f79] hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;