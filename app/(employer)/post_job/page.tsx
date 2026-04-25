"use client";

import React, { useState } from "react";
import {
  Clock,
  FileEdit,
  Trash2,
  Briefcase,
  PlusCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

const categoryOptions = [
  "IT & Software",
  "Design",
  "Marketing",
  "Sales",
  "Finance",
  "Human Resources",
  "Engineering",
  "Customer Support",
  "Operations",
  "Legal",
];

const locationOptions = [
  "Phnom Penh",
  "Siem Reap",
  "Battambang",
  "Sihanoukville",
  "Kampot",
  "Kandal",
  "Takeo",
  "Remote",
  "Other",
];

function Combobox({
  placeholder,
  options,
  inputClass,
  value,
  onChange,
}: {
  placeholder: string;
  options: string[];
  inputClass: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className={`${inputClass} pr-10`}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      <ChevronDown
        size={16}
        className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] pointer-events-none transition-transform duration-200 ${
          open ? "rotate-180" : ""
        }`}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((option) => (
            <li
              key={option}
              onMouseDown={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`px-4 py-2.5 text-sm font-medium text-[#071a15] cursor-pointer transition-colors hover:bg-[#f0f9f6] hover:text-[#40b594] ${
                value === option ? "bg-[#f0f9f6] text-[#40b594] font-bold" : ""
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type DraftJob = {
  id: string;
  title: string;
  category: string;
  lastSaved: string;
};

const PostJob = () => {
  const [activeTab, setActiveTab] = useState<"post" | "drafts">("post");
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftData, setDraftData] = useState<DraftJob[]>([]);
  const [form, setForm] = useState({
    title: "",
    category: "",
    location: "",
    arrangement: "",
    employmentType: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    applicationDeadline: "",
    description: "",
    requirements: "",
    applicationPlatform: "",
    externalApplyLink: "",
    contactEmail: "",
    status: "active",
  });

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium placeholder-[#9ab0aa] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594] transition-all";

  const selectClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594] transition-all appearance-none";

  const labelClass = "block text-sm font-extrabold text-[#071a15] mb-2";

  const arrangementValue =
    form.arrangement === "On-site"
      ? "on_site"
      : form.arrangement === "Remote"
        ? "remote"
        : form.arrangement === "Hybrid"
          ? "hybrid"
          : "on_site";

  const employmentValue =
    form.employmentType === "Full-time"
      ? "full_time"
      : form.employmentType === "Part-time"
        ? "part_time"
        : form.employmentType === "Contract"
          ? "contract"
          : form.employmentType === "Freelance"
            ? "freelance"
            : form.employmentType === "Internship"
              ? "internship"
              : "full_time";

  const experienceValue =
    form.experienceLevel === "Entry Level"
      ? "entry"
      : form.experienceLevel === "Mid Level"
        ? "mid"
        : form.experienceLevel === "Senior"
          ? "senior"
          : form.experienceLevel === "Lead / Manager"
            ? "lead"
            : form.experienceLevel === "Executive"
              ? "executive"
              : "entry";

  const handleSubmit = async (status: "active" | "draft") => {
    try {
      setLoading(true);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          location: form.location,
          arrangement: arrangementValue,
          employmentType: employmentValue,
          experienceLevel: experienceValue,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
          applicationDeadline: form.applicationDeadline || null,
          description: form.description,
          requirements: form.requirements,
          applicationPlatform: form.applicationPlatform || "internal",
          externalApplyLink: form.externalApplyLink || null,
          contactEmail: form.contactEmail || null,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save job");
        return;
      }

      alert(status === "active" ? "Job published successfully" : "Draft saved");

      setForm({
        title: "",
        category: "",
        location: "",
        arrangement: "",
        employmentType: "",
        experienceLevel: "",
        salaryMin: "",
        salaryMax: "",
        applicationDeadline: "",
        description: "",
        requirements: "",
        applicationPlatform: "",
        externalApplyLink: "",
        contactEmail: "",
        status: "active",
      });

      if (status === "draft") {
        await loadDrafts();
        setActiveTab("drafts");
      }
    } catch (error) {
      console.error("POST JOB ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDrafts = async () => {
    try {
      setDraftLoading(true);
      const res = await fetch("/api/jobs?mine=1", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) return;

      const drafts = (data || [])
        .filter((job: any) => job.status === "draft")
        .map((job: any) => ({
          id: job.id,
          title: job.title,
          category: job.category,
          lastSaved: new Date(job.postedAt).toLocaleString(),
        }));

      setDraftData(drafts);
    } catch (error) {
      console.error(error);
    } finally {
      setDraftLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "drafts") loadDrafts();
  }, [activeTab]);

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: "#f0f4f3" }}>
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="/dashboard"><button className="text-gray-300 hover:text-white transition-colors">Dashboard</button></Link>
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Post Job</button>
          <Link href="/employer_message"><button className="text-gray-300 hover:text-white transition-colors">Messages</button></Link>
          <Link href="/employer_notification"><button className="text-gray-300 hover:text-white transition-colors">Notification</button></Link>
          <Link href="/subscription"><button className="text-gray-300 hover:text-white transition-colors">Subscription</button></Link>
          <Link href="/employer_setting"><button className="text-gray-300 hover:text-white transition-colors">Settings</button></Link>
        </nav>

        <Link href="/employer_profile">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Company</p>
              <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors">Profile</p>
            </div>
            <div className="w-10 h-10 bg-[#40b594] rounded-full flex items-center justify-center font-extrabold text-[#051612] text-sm">
              C
            </div>
          </div>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Hiring</p>
          <h1 className="text-4xl font-extrabold text-[#071a15]">Post a Job</h1>
          <p className="text-[#4a5a55] font-medium mt-1">
            Fill in the details below to publish a new role
          </p>
        </div>

        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 mb-8 shadow-sm w-fit">
          {(["post", "drafts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
                activeTab === tab
                  ? "bg-[#051612] text-white shadow-sm"
                  : "text-[#4a5a55] hover:text-[#071a15]"
              }`}
            >
              {tab === "post" ? "Post Job" : `Drafts (${draftData.length})`}
            </button>
          ))}
        </div>

        {activeTab === "post" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3 space-y-6">
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-8 h-8 bg-[#f0f9f6] rounded-xl flex items-center justify-center border border-[#d1e8e3]">
                    <Briefcase size={16} className="text-[#40b594]" />
                  </div>
                  <h2 className="text-lg font-extrabold text-[#071a15]">Job Details</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Job Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Senior Frontend Developer"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Job Category <span className="text-red-500">*</span></label>
                    <Combobox
                      placeholder="e.g. Design, Marketing, IT & Software"
                      options={categoryOptions}
                      inputClass={inputClass}
                      value={form.category}
                      onChange={(value) => setForm((p) => ({ ...p, category: value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Location <span className="text-red-500">*</span></label>
                      <Combobox
                        placeholder="e.g. Phnom Penh, Remote"
                        options={locationOptions}
                        inputClass={inputClass}
                        value={form.location}
                        onChange={(value) => setForm((p) => ({ ...p, location: value }))}
                      />
                    </div>

                    <div className="relative">
                      <label className={labelClass}>Work Arrangement</label>
                      <select
                        value={form.arrangement}
                        onChange={(e) => setForm((p) => ({ ...p, arrangement: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="">On-site / Remote / Hybrid</option>
                        <option>On-site</option>
                        <option>Remote</option>
                        <option>Hybrid</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className={labelClass}>Employment Type</label>
                      <select
                        value={form.employmentType}
                        onChange={(e) => setForm((p) => ({ ...p, employmentType: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="">Select type</option>
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Freelance</option>
                        <option>Internship</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                    </div>

                    <div className="relative">
                      <label className={labelClass}>Experience Level</label>
                      <select
                        value={form.experienceLevel}
                        onChange={(e) => setForm((p) => ({ ...p, experienceLevel: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="">Select level</option>
                        <option>Entry Level</option>
                        <option>Mid Level</option>
                        <option>Senior</option>
                        <option>Lead / Manager</option>
                        <option>Executive</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Salary Minimum</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79] font-bold text-sm">$</span>
                        <input
                          type="number"
                          value={form.salaryMin}
                          onChange={(e) => setForm((p) => ({ ...p, salaryMin: e.target.value }))}
                          placeholder="0"
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Salary Maximum</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79] font-bold text-sm">$</span>
                        <input
                          type="number"
                          value={form.salaryMax}
                          onChange={(e) => setForm((p) => ({ ...p, salaryMax: e.target.value }))}
                          placeholder="0"
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Application Deadline</label>
                    <input
                      type="date"
                      value={form.applicationDeadline}
                      onChange={(e) => setForm((p) => ({ ...p, applicationDeadline: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-extrabold text-[#071a15] mb-2">Job Description</h2>
                <p className="text-xs text-[#6b7f79] font-semibold mb-5">
                  Describe the role, responsibilities, and what success looks like
                </p>
                <textarea
                  rows={10}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Write the job description here..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium placeholder-[#9ab0aa] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594] transition-all resize-none"
                />
              </section>
            </div>

            <div className="lg:w-1/3 space-y-6">
              <section className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-extrabold text-[#071a15] mb-2">Requirements</h2>
                <p className="text-xs text-[#6b7f79] font-semibold mb-5">
                  Skills, qualifications, and must-haves
                </p>
                <textarea
                  rows={8}
                  value={form.requirements}
                  onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))}
                  placeholder="e.g. 3+ years React experience"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium placeholder-[#9ab0aa] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594] transition-all resize-none"
                />
              </section>

              <section className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-extrabold text-[#071a15] mb-6">Application Settings</h2>

                <div className="space-y-5">
                  <div className="relative">
                    <label className={labelClass}>Application Platform</label>
                    <select
                      value={form.applicationPlatform}
                      onChange={(e) => setForm((p) => ({ ...p, applicationPlatform: e.target.value }))}
                      className={selectClass}
                    >
                      <option value="">Select platform</option>
                      <option value="internal">Apply on NexHire</option>
                      <option value="external">External Link</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                  </div>

                  <div>
                    <label className={labelClass}>External Link</label>
                    <input
                      type="text"
                      value={form.externalApplyLink}
                      onChange={(e) => setForm((p) => ({ ...p, externalApplyLink: e.target.value }))}
                      placeholder="https://yoursite.com/apply"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Contact Email</label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                      placeholder="careers@company.com"
                      className={inputClass}
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-extrabold text-[#071a15] mb-3">Visibility</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Public Now", "Save as Draft"].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2.5 bg-[#f8faf9] border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-[#40b594] transition-all"
                        >
                          <input
                            type="radio"
                            name="status"
                            checked={
                              opt === "Public Now"
                                ? form.status === "active"
                                : form.status === "draft"
                            }
                            onChange={() =>
                              setForm((p) => ({
                                ...p,
                                status: opt === "Public Now" ? "active" : "draft",
                              }))
                            }
                            className="accent-[#40b594] w-4 h-4"
                          />
                          <span className="text-sm font-bold text-[#071a15]">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-6" />

                <div className="space-y-3">
                  <button
                    onClick={() => handleSubmit("active")}
                    disabled={loading}
                    className="w-full bg-[#051612] text-white py-3.5 rounded-xl font-extrabold text-sm hover:bg-[#0d2a23] transition-all shadow-sm disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Publish Job"}
                  </button>
                  <button
                    onClick={() => handleSubmit("draft")}
                    disabled={loading}
                    className="w-full bg-[#f0f4f3] text-[#071a15] py-3.5 rounded-xl font-extrabold text-sm border border-[#d1e8e3] hover:bg-[#d1e8e3] transition-all disabled:opacity-60"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() =>
                      setForm({
                        title: "",
                        category: "",
                        location: "",
                        arrangement: "",
                        employmentType: "",
                        experienceLevel: "",
                        salaryMin: "",
                        salaryMax: "",
                        applicationDeadline: "",
                        description: "",
                        requirements: "",
                        applicationPlatform: "",
                        externalApplyLink: "",
                        contactEmail: "",
                        status: "active",
                      })
                    }
                    className="w-full text-[#6b7f79] py-2 rounded-xl font-bold text-sm hover:text-[#071a15] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === "drafts" && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#6b7f79]">
                  Saved drafts
                </p>
                <h2 className="text-xl font-extrabold text-[#071a15] mt-0.5">
                  {draftData.length} unfinished posts
                </h2>
              </div>
              <button
                onClick={() => setActiveTab("post")}
                className="flex items-center gap-2 bg-[#051612] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all shadow-sm"
              >
                <PlusCircle size={17} /> New Post
              </button>
            </div>

            {draftLoading ? (
              <div className="text-sm text-[#6b7f79]">Loading drafts...</div>
            ) : draftData.length === 0 ? (
              <div className="text-sm text-[#6b7f79]">No drafts saved.</div>
            ) : (
              <div className="space-y-4">
                {draftData.map((draft) => (
                  <div
                    key={draft.id}
                    className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between group hover:border-[#40b594] hover:shadow-md transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-[#f0f9f6] rounded-xl flex items-center justify-center border border-[#d1e8e3] flex-shrink-0">
                        <Briefcase size={22} className="text-[#40b594]" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#071a15]">{draft.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs font-bold text-[#40b594] bg-[#f0f9f6] px-2.5 py-1 rounded-lg border border-[#d1e8e3]">
                            {draft.category}
                          </span>
                          <div className="flex items-center gap-1.5 text-[#6b7f79] text-xs font-semibold">
                            <Clock size={13} /> {draft.lastSaved}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2.5 rounded-xl text-[#6b7f79] hover:bg-red-50 hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                      <Link href={`/jobs/${draft.id}`}>
                        <button className="flex items-center gap-2 bg-[#051612] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all">
                          <FileEdit size={16} /> View Draft
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PostJob;
