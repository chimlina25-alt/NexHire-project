// app/jobs/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Briefcase, MapPin, Clock } from "lucide-react";

const ARRANGEMENTS = ["on_site", "remote", "hybrid"] as const;
const EMP_TYPES = ["full_time", "part_time", "contract", "freelance", "internship"] as const;
const EXP_LEVELS = ["entry", "mid", "senior", "lead", "executive"] as const;
const STATUSES = ["draft", "active", "closed"] as const;

const labelClass = "block text-sm font-extrabold text-[#071a15] mb-2";
const inputClass =
  "w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594] transition-all";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
      if (res.ok) setJob(await res.json());
      setLoading(false);
    })();
  }, [id]);

  const update = (k: string, v: any) => setJob((j: any) => ({ ...j, [k]: v }));

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: job.title,
        category: job.category,
        location: job.location,
        arrangement: job.arrangement,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
        salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
        description: job.description,
        requirements: job.requirements,
        contactEmail: job.contactEmail,
        externalApplyLink: job.externalApplyLink,
        status: job.status,
      }),
    });
    setSaving(false);
    if (res.ok) router.push("/dashboard");
    else alert("Failed to save");
  };

  const remove = async () => {
    if (!confirm("Delete this job permanently?")) return;
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f3] flex items-center justify-center">
        <p className="text-[#6b7f79] font-bold">Loading…</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f0f4f3] flex items-center justify-center">
        <p className="text-[#6b7f79] font-bold">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: "#f0f4f3" }}>
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>
        <Link href="/dashboard">
          <button className="text-sm font-semibold text-gray-300 hover:text-white">
            Back to Dashboard
          </button>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-[#4a5a55] font-bold mb-6 hover:text-[#071a15] transition-all">
            <ArrowLeft size={18} /> Back
          </button>
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">
              Job Listing
            </p>
            <h1 className="text-4xl font-extrabold text-[#071a15]">
              {job.title || "Untitled Job"}
            </h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-[#4a5a55] font-semibold">
              <span className="flex items-center gap-1.5"><Briefcase size={14} />{job.category}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} />{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              job.status === "active"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : job.status === "draft"
                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                : "bg-red-50 text-red-700 ring-1 ring-red-200"
            }`}
          >
            {job.status}
          </span>
        </div>

        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className={labelClass}>Job Title</label>
            <input value={job.title} onChange={(e) => update("title", e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Category</label>
              <input value={job.category} onChange={(e) => update("category", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input value={job.location} onChange={(e) => update("location", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Arrangement</label>
              <select value={job.arrangement} onChange={(e) => update("arrangement", e.target.value)} className={inputClass}>
                {ARRANGEMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Employment</label>
              <select value={job.employmentType} onChange={(e) => update("employmentType", e.target.value)} className={inputClass}>
                {EMP_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Experience</label>
              <select value={job.experienceLevel} onChange={(e) => update("experienceLevel", e.target.value)} className={inputClass}>
                {EXP_LEVELS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Salary Min</label>
              <input type="number" value={job.salaryMin ?? ""} onChange={(e) => update("salaryMin", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Salary Max</label>
              <input type="number" value={job.salaryMax ?? ""} onChange={(e) => update("salaryMax", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={8} value={job.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>Requirements</label>
            <textarea rows={6} value={job.requirements ?? ""} onChange={(e) => update("requirements", e.target.value)} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select value={job.status} onChange={(e) => update("status", e.target.value)} className={inputClass}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-[#051612] text-white px-6 py-3 rounded-xl font-extrabold text-sm hover:bg-[#0d2a23] transition-all disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={remove}
              className="flex items-center gap-2 border border-red-200 text-red-600 bg-white px-6 py-3 rounded-xl font-extrabold text-sm hover:bg-red-50 transition-all"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}