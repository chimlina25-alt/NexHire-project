"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, FileText, TrendingUp, ArrowUpRight,
  Users, X, Save, FileEdit, Trash2, Clock,
  ChevronDown, Mail, Calendar, Briefcase, Download,
  CheckCircle2, XCircle, Search, RotateCcw, Archive,
  MapPin, Tag, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import EmployerNavProfile from '@/components/ui/EmployerNavProfile';

const categoryOptions = ["IT & Software", "Design", "Marketing", "Sales", "Finance", "Human Resources", "Engineering", "Customer Support", "Operations", "Legal"];
const locationOptions = ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville", "Kampot", "Kandal", "Takeo", "Remote", "Other"];

function Combobox({ placeholder, options, inputClass, value, onChange }: any) {
  const [open, setOpen] = useState(false);
  const safeValue = value || "";
  const filtered = options.filter((o: string) => o.toLowerCase().includes(safeValue.toLowerCase()));
  return (
    <div className="relative">
      <input type="text" value={safeValue} placeholder={placeholder} className={`${inputClass} pr-10`}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)} />
      <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] pointer-events-none transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {filtered.map((option: string) => (
            <li key={option} onMouseDown={() => { onChange(option); setOpen(false); }}
              className="px-4 py-2.5 text-sm font-medium text-[#071a15] cursor-pointer hover:bg-[#f0f9f6] hover:text-[#40b594]">
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InterviewModal({ applicant, onClose, onSchedule }: { applicant: any; onClose: () => void; onSchedule: (data: any) => Promise<void>; }) {
  const [form, setForm] = useState({ mode: "remote", scheduledAt: "", duration: 60, link: "", location: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!form.scheduledAt) { alert("Please select a date and time"); return; }
    setLoading(true);
    await onSchedule(form);
    setLoading(false);
  };
  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 transition-all";
  const labelClass = "block text-sm font-extrabold text-[#071a15] mb-2";
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-[#071a15]">Schedule Interview</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <p className="text-sm text-[#4a5a55] font-medium mb-6">
          For: <span className="font-extrabold text-[#071a15]">{applicant?.firstName} {applicant?.lastName}</span> — {applicant?.jobTitle}
        </p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Interview Mode</label>
            <select value={form.mode} onChange={(e) => setForm(p => ({ ...p, mode: e.target.value }))} className={inputClass}>
              <option value="remote">Online / Remote</option>
              <option value="onsite">In-person / On-site</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Date & Time *</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm(p => ({ ...p, scheduledAt: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Duration (minutes)</label>
            <input type="number" value={form.duration} onChange={(e) => setForm(p => ({ ...p, duration: Number(e.target.value) }))} className={inputClass} min={15} step={15} />
          </div>
          {form.mode === "remote" && (
            <div>
              <label className={labelClass}>Meeting Link</label>
              <input type="url" value={form.link} placeholder="https://meet.google.com/..." onChange={(e) => setForm(p => ({ ...p, link: e.target.value }))} className={inputClass} />
            </div>
          )}
          {form.mode === "onsite" && (
            <div>
              <label className={labelClass}>Location / Address</label>
              <input type="text" value={form.location} placeholder="Office address..." onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} className={inputClass} />
            </div>
          )}
          <div>
            <label className={labelClass}>Notes (optional)</label>
            <textarea rows={3} value={form.notes} placeholder="Any additional information..." onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} className={`${inputClass} resize-none`} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-[#4a5a55] py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-[#051612] text-white py-3 rounded-xl font-extrabold text-sm hover:bg-[#0d2a23] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />{loading ? "Scheduling..." : "Schedule & Notify"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DraftsPanel({ drafts, onClose, onRestore, onPermanentDelete }: { drafts: any[]; onClose: () => void; onRestore: (job: any) => void; onPermanentDelete: (jobId: string) => void; }) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const handleDeleteClick = (jobId: string) => {
    if (confirmId === jobId) { onPermanentDelete(jobId); setConfirmId(null); }
    else setConfirmId(jobId);
  };
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    return `${mins}m ago`;
  };
  const todayCount = drafts.filter(d => (Date.now() - new Date(d.deletedAt).getTime()) / 3600000 < 24).length;
  const oldCount = drafts.filter(d => (Date.now() - new Date(d.deletedAt).getTime()) / 86400000 >= 7).length;
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-[#071a15] shadow-2xl flex flex-col">
        <div className="px-8 pt-8 pb-6 border-b border-white/[0.08]">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#40b594]/15 border border-[#40b594]/30 flex items-center justify-center">
                <Archive size={22} className="text-[#40b594]" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#40b594] mb-0.5">Archive</p>
                <h2 className="text-xl font-extrabold text-white leading-tight">Drafts & Deleted Jobs</h2>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ label: 'Total', value: drafts.length, color: 'text-white' }, { label: 'Today', value: todayCount, color: 'text-[#40b594]' }, { label: 'Old (7d+)', value: oldCount, color: 'text-amber-400' }].map(({ label, value, color }) => (
              <div key={label} className="bg-white/[0.05] rounded-xl p-3 text-center border border-white/[0.07]">
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5 font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3">
          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
                <Archive size={30} className="text-white/15" />
              </div>
              <p className="text-white/40 font-bold text-sm">Archive is empty</p>
              <p className="text-white/20 text-xs mt-2 leading-relaxed max-w-[180px]">Jobs you delete will land here for safe recovery</p>
            </div>
          ) : (
            drafts.map((job) => {
              const isOld = (Date.now() - new Date(job.deletedAt).getTime()) / 86400000 >= 7;
              const isConfirming = confirmId === job.id;
              return (
                <div key={job.id} className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${isConfirming ? 'border-red-500/40 bg-red-950/25' : 'border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/[0.15]'}`}>
                  <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full ${isOld ? 'bg-amber-400' : 'bg-[#40b594]'}`} />
                  <div className="pl-6 pr-5 py-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${isOld ? 'bg-amber-400/10 text-amber-400 border-amber-400/25' : 'bg-[#40b594]/10 text-[#40b594] border-[#40b594]/25'}`}>
                            {isOld ? '⚠ Old draft' : '● Draft'}
                          </span>
                          <span className="text-[10px] text-white/25 font-semibold flex items-center gap-1">
                            <Clock size={9} className="shrink-0" />{timeAgo(job.deletedAt)}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-white leading-snug">{job.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                      {job.category && <span className="flex items-center gap-1 text-[10px] text-white/35 font-semibold bg-white/[0.06] px-2.5 py-1 rounded-lg border border-white/[0.06]"><Tag size={9} />{job.category}</span>}
                      {job.location && <span className="flex items-center gap-1 text-[10px] text-white/35 font-semibold bg-white/[0.06] px-2.5 py-1 rounded-lg border border-white/[0.06]"><MapPin size={9} />{job.location}</span>}
                      {job.employmentType && <span className="text-[10px] text-white/35 font-semibold bg-white/[0.06] px-2.5 py-1 rounded-lg border border-white/[0.06]">{job.employmentType.replace('_', ' ')}</span>}
                    </div>
                    {job.description && <p className="text-[11px] text-white/25 leading-relaxed line-clamp-2 mb-4 pr-2">{job.description}</p>}
                    {isConfirming && (
                      <div className="mb-3 px-3 py-2.5 bg-red-950/40 border border-red-500/25 rounded-xl flex items-start gap-2">
                        <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-red-300/80 font-semibold leading-relaxed">Click <span className="text-red-300 font-black">Delete again</span> to permanently remove. This cannot be undone.</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button onClick={() => { onRestore(job); setConfirmId(null); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#40b594]/10 hover:bg-[#40b594]/20 border border-[#40b594]/25 hover:border-[#40b594]/50 text-[#40b594] rounded-xl text-[11px] font-black uppercase tracking-wider transition-all">
                        <RotateCcw size={12} /> Restore
                      </button>
                      <button onClick={() => handleDeleteClick(job.id)}
                        className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${isConfirming ? 'bg-red-500 border-red-400 text-white hover:bg-red-600 shadow-lg shadow-red-500/20' : 'bg-white/[0.05] border-white/[0.08] text-white/35 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'}`}>
                        <Trash2 size={12} />{isConfirming ? 'Confirm Delete' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {drafts.length > 0 && (
          <div className="px-8 py-4 border-t border-white/[0.06] bg-black/20 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#40b594]/40" />
            <p className="text-[10px] text-white/20 font-semibold">Restored jobs return to Active · Permanently deleted jobs cannot be recovered</p>
          </div>
        )}
      </div>
    </div>
  );
}

const EmployerDashboard = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"edit" | "view_applicant">("edit");
  const [draftsPanelOpen, setDraftsPanelOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const applicantsRef = useRef<HTMLDivElement | null>(null);
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalApplicants: 0 });
  const [jobs, setJobs] = useState<any[]>([]);
  const [draftJobs, setDraftJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<any>({ title: "", category: "", location: "", description: "", arrangement: "on_site", employmentType: "full_time", requirements: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [statsRes, jobsRes, applicantsRes, profileRes] = await Promise.all([
        fetch("/api/employer/stats"),
        fetch("/api/employer/recent-jobs"),
        fetch("/api/employer/applicants"),
        fetch("/api/employer/profile"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (applicantsRes.ok) setApplicants(await applicantsRes.json());
      if (profileRes.ok) setProfile(await profileRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const statusStyle: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    closed: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    draft: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  };
  const applicantStatusStyle: Record<string, string> = {
    pending: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    interview: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  };

  const openEditPanel = (job: any) => {
    setSelectedJob(job);
    setEditForm({ title: job.title, category: job.category, location: job.location, description: job.description, arrangement: job.arrangement, employmentType: job.employmentType, requirements: job.requirements || "" });
    setPanelMode("edit"); setPanelOpen(true);
  };
  const openApplicantDetails = (applicant: any) => { setSelectedApplicant(applicant); setPanelMode("view_applicant"); setPanelOpen(true); };
  const handleDeleteJob = async (jobId: string) => {
    const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
    if (res.ok) {
      const job = jobs.find(j => j.id === jobId);
      if (job) setDraftJobs(prev => [...prev, { ...job, deletedAt: new Date().toISOString() }]);
      setJobs(prev => prev.filter(j => j.id !== jobId));
    }
  };
  const handleRestoreJob = (job: any) => {
    const { deletedAt, ...restoredJob } = job;
    setJobs(prev => [restoredJob, ...prev]);
    setDraftJobs(prev => prev.filter(d => d.id !== job.id));
  };
  const handlePermanentDelete = (jobId: string) => setDraftJobs(prev => prev.filter(d => d.id !== jobId));
  const handleSaveJob = async () => {
    if (!selectedJob) return;
    setSaving(true);
    const res = await fetch(`/api/jobs/${selectedJob.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    if (res.ok) {
      const updated = await res.json();
      setJobs(prev => prev.map(j => j.id === selectedJob.id ? { ...j, ...updated } : j));
      setPanelOpen(false);
    }
    setSaving(false);
  };
  const handleDecision = async (decision: string, interviewData?: any) => {
    if (!selectedApplicant) return;
    const body: any = { decision, ...interviewData };
    const res = await fetch(`/api/applications/${selectedApplicant.id}/decision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const data = await res.json();
      setApplicants(prev => prev.map(a => a.id === selectedApplicant.id ? { ...a, status: data.status } : a));
      setSelectedApplicant((p: any) => ({ ...p, status: data.status }));
      if (decision === "accept") { setShowInterviewModal(false); alert("Interview scheduled! Notification sent to applicant."); }
      else if (decision === "reject") alert("Applicant rejected. Notification sent.");
      else if (decision === "review") alert("Application marked as under review. Applicant notified.");
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 transition-all";
  const labelClass = "block text-sm font-extrabold text-[#071a15] mb-2";
  const selectClass = "w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 transition-all appearance-none";
  const companyName = profile?.companyName || "Company";

  return (
    <div className="min-h-screen font-sans pb-16 relative overflow-hidden" style={{ background: '#f0f4f3' }}>
      {showInterviewModal && selectedApplicant && (
        <InterviewModal applicant={selectedApplicant} onClose={() => setShowInterviewModal(false)} onSchedule={async (data) => { await handleDecision("accept", data); }} />
      )}
      {draftsPanelOpen && (
        <DraftsPanel drafts={draftJobs} onClose={() => setDraftsPanelOpen(false)} onRestore={handleRestoreJob} onPermanentDelete={handlePermanentDelete} />
      )}
      <div className={`fixed inset-0 z-[100] transition-all duration-300 ${panelOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-hidden transform transition-transform duration-300 ${panelOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="h-full flex flex-col">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#f0f9f6] flex items-center justify-center text-[#40b594] border border-[#d1e8e3]">
                  {panelMode === "view_applicant" ? (
                    <div className="w-16 h-16 rounded-2xl bg-[#051612] flex items-center justify-center text-white text-2xl font-black">{selectedApplicant?.firstName?.charAt(0)}</div>
                  ) : <FileEdit size={28} />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#40b594] mb-1">{panelMode === "view_applicant" ? "Job Application" : "Edit Listing"}</p>
                  <h2 className="text-2xl font-extrabold text-[#071a15]">{panelMode === "view_applicant" ? `${selectedApplicant?.firstName} ${selectedApplicant?.lastName}` : selectedJob?.title}</h2>
                </div>
              </div>
              <button onClick={() => setPanelOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 pt-6">
              {panelMode === "view_applicant" ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f8faf9] p-5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-[#6b7f79] uppercase mb-1 flex items-center gap-1"><Mail size={12} /> Email</p>
                      <p className="text-sm font-bold text-[#071a15]">{selectedApplicant?.seekerEmail}</p>
                    </div>
                    <div className="bg-[#f8faf9] p-5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-[#6b7f79] uppercase mb-1 flex items-center gap-1"><Calendar size={12} /> Applied</p>
                      <p className="text-sm font-bold text-[#071a15]">{selectedApplicant?.appliedAt ? new Date(selectedApplicant.appliedAt).toLocaleDateString() : "—"}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#071a15] uppercase tracking-wider mb-3 flex items-center gap-2"><Briefcase size={16} className="text-[#40b594]" /> Applied For</h4>
                    <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <p className="text-sm font-bold text-[#071a15]">{selectedApplicant?.jobTitle}</p>
                      <p className="text-xs font-semibold text-[#6b7f79] mt-1">{selectedApplicant?.contact}</p>
                    </div>
                  </div>
                  {selectedApplicant?.coverLetter && (
                    <div>
                      <h4 className="text-xs font-black text-[#071a15] uppercase tracking-wider mb-3 flex items-center gap-2"><FileText size={16} className="text-[#40b594]" /> Cover Letter</h4>
                      <p className="text-sm text-[#4a5a55] leading-relaxed font-medium bg-[#f0f9f6]/40 p-6 rounded-2xl border border-[#d1e8e3]">{selectedApplicant.coverLetter}</p>
                    </div>
                  )}
                  {selectedApplicant?.cvUrl && (
                    <div className="p-5 bg-white border-2 border-dashed border-[#d1e8e3] rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 font-black text-[10px]">CV</div>
                        <p className="text-sm font-bold text-[#071a15]">{selectedApplicant.cvFileName || "Resume.pdf"}</p>
                      </div>
                      <a href={selectedApplicant.cvUrl} download target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#40b594] font-black text-xs hover:bg-[#f0f9f6] p-2 rounded-lg transition-all">
                        <Download size={18} />
                      </a>
                    </div>
                  )}
                  <div className="bg-[#f8faf9] p-4 rounded-xl">
                    <p className="text-xs font-black text-[#6b7f79] uppercase mb-1">Current Status</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${applicantStatusStyle[selectedApplicant?.status] ?? 'bg-gray-100'}`}>{selectedApplicant?.status}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Job Title <span className="text-red-500">*</span></label>
                    <input value={editForm.title} className={inputClass} onChange={(e) => setEditForm((p: any) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Category</label>
                      <Combobox options={categoryOptions} inputClass={inputClass} value={editForm.category} onChange={(v: any) => setEditForm((p: any) => ({ ...p, category: v }))} placeholder="Category" />
                    </div>
                    <div>
                      <label className={labelClass}>Location</label>
                      <Combobox options={locationOptions} inputClass={inputClass} value={editForm.location} onChange={(v: any) => setEditForm((p: any) => ({ ...p, location: v }))} placeholder="Location" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative">
                      <label className={labelClass}>Work Arrangement</label>
                      <select className={selectClass} value={editForm.arrangement} onChange={(e) => setEditForm((p: any) => ({ ...p, arrangement: e.target.value }))}>
                        <option value="on_site">On-site</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div className="relative">
                      <label className={labelClass}>Employment Type</label>
                      <select className={selectClass} value={editForm.employmentType} onChange={(e) => setEditForm((p: any) => ({ ...p, employmentType: e.target.value }))}>
                        <option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option><option value="freelance">Freelance</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea rows={6} value={editForm.description} className={`${inputClass} resize-none`} onChange={(e) => setEditForm((p: any) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <button onClick={handleSaveJob} disabled={saving} className="w-full bg-[#051612] text-white py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#0d2a23] transition-all disabled:opacity-60">
                    <Save size={18} />{saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
            {panelMode === "view_applicant" && (
              <div className="p-8 border-t border-gray-100 bg-[#f8faf9] flex items-center gap-3">
                <button onClick={() => handleDecision("review")} className="flex-1 bg-white border border-gray-200 text-[#4a5a55] py-4 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all uppercase">
                  <Search size={14} /> Under Review
                </button>
                <button onClick={() => handleDecision("reject")} className="flex-1 bg-white border border-gray-200 text-[#4a5a55] py-4 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all uppercase">
                  <XCircle size={14} /> Reject
                </button>
                <button onClick={() => setShowInterviewModal(true)} className="flex-[1.5] bg-[#051612] text-white py-4 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#40b594] transition-all shadow-lg uppercase">
                  <CheckCircle2 size={14} /> Accept & Schedule
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Dashboard</button>
          <Link href="/post_job"><button className="text-gray-300 hover:text-white transition-colors">Post Job</button></Link>
          <Link href="/employer_message"><button className="text-gray-300 hover:text-white transition-colors">Messages</button></Link>
          <Link href="/employer_notification"><button className="text-gray-300 hover:text-white transition-colors">Notification</button></Link>
          <Link href="/subscription"><button className="text-gray-300 hover:text-white transition-colors">Subscription</button></Link>
          <Link href="/employer_setting"><button className="text-gray-300 hover:text-white transition-colors">Settings</button></Link>
        </nav>
        <EmployerNavProfile />
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Dashboard Overview</p>
            <h1 className="text-4xl font-extrabold text-[#071a15] leading-tight">Welcome back, {companyName}</h1>
          </div>
          <Link href="/post_job">
            <button className="flex items-center gap-2 bg-[#051612] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all">
              <Plus size={18} /> Post New Job
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Total Jobs Posted', value: String(stats.totalJobs), icon: FileText, bg: 'bg-[#051612]', iconBg: 'bg-[#0d2a23]' },
            { label: 'Total Applicants', value: String(stats.totalApplicants), icon: Users, bg: 'bg-[#133228]', iconBg: 'bg-[#1a4035]' },
            { label: 'Active Jobs', value: String(stats.activeJobs), icon: TrendingUp, bg: 'bg-[#40b594]', iconBg: 'bg-[#33997a]', dark: true },
          ].map(({ label, value, icon: Icon, bg, iconBg, dark }: any) => (
            <div key={label} className={`${bg} rounded-2xl p-7 flex flex-col gap-5`}>
              <div className="flex items-start justify-between">
                <div className={`${iconBg} p-3 rounded-xl`}><Icon className={dark ? 'text-[#051612]' : 'text-[#40b594]'} size={24} /></div>
                <ArrowUpRight className={dark ? 'text-[#051612] opacity-60' : 'text-[#40b594] opacity-60'} size={18} />
              </div>
              <div>
                <p className={`text-5xl font-extrabold ${dark ? 'text-[#051612]' : 'text-white'} leading-none mb-1`}>{value}</p>
                <p className={`text-sm font-semibold ${dark ? 'text-[#071a15]' : 'text-gray-300'}`}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-[#071a15]">Recent Jobs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f8faf9] text-xs font-bold uppercase tracking-wider text-[#6b7f79]">
                    <th className="px-8 py-4">Job Title</th><th className="px-4 py-4">Category</th><th className="px-4 py-4">Location</th>
                    <th className="px-4 py-4">Status</th><th className="px-4 py-4 text-center">Applicants</th><th className="px-4 py-4 text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 && (
                    <tr><td colSpan={6} className="px-8 py-8 text-center text-[#6b7f79] text-sm">No jobs yet. <Link href="/post_job" className="text-[#40b594] font-bold">Post your first job →</Link></td></tr>
                  )}
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-t border-gray-50 hover:bg-[#f8faf9] transition-colors">
                      <td className="px-8 py-4 font-bold text-[#071a15] text-sm">{job.title}</td>
                      <td className="px-4 py-4 text-[#4a5a55] text-sm font-medium">{job.category}</td>
                      <td className="px-4 py-4 text-[#4a5a55] text-sm font-medium">{job.location}</td>
                      <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle[job.status] || ''}`}>{job.status}</span></td>
                      <td className="px-4 py-4 text-center font-extrabold text-[#071a15] text-sm">{job.applicantCount ?? 0}</td>
                      <td className="px-4 py-4 text-right pr-8">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEditPanel(job)} title="Edit" className="p-2 text-gray-400 hover:text-[#40b594] transition-all"><FileEdit size={16} /></button>
                          <button onClick={() => handleDeleteJob(job.id)} title="Move to drafts" className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 h-fit sticky top-24">
            <h2 className="text-lg font-extrabold text-[#071a15] mb-2">Quick Actions</h2>
            <Link href="/post_job" className="block">
              <button className="w-full bg-[#051612] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#0d2a23] transition-all">
                <Plus size={18} /> Post a New Job
              </button>
            </Link>
            <button onClick={() => applicantsRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full border-2 border-[#d1e8e3] text-[#071a15] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#f0f9f6] hover:border-[#40b594] transition-all">
              <Users size={18} /> View Applicants
            </button>
            <button onClick={() => setDraftsPanelOpen(true)}
              className="w-full border-2 border-[#d1e8e3] text-[#071a15] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#f0f9f6] hover:border-[#40b594] transition-all relative">
              <Archive size={18} /> Drafts
              {draftJobs.length > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#051612] text-[#40b594] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-[#40b594]/40">
                  {draftJobs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <section ref={applicantsRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-extrabold text-[#071a15]">Recent Applicants</h2>
            <span className="text-xs font-bold text-[#40b594] bg-emerald-50 px-3 py-1 rounded-full">{applicants.filter(a => a.status === 'pending').length} new</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8faf9] text-xs font-bold uppercase tracking-wider text-[#6b7f79]">
                <th className="px-8 py-4">Name</th><th className="px-4 py-4">Applied For</th><th className="px-4 py-4">Date</th><th className="px-4 py-4">Status</th><th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {applicants.length === 0 && <tr><td colSpan={5} className="px-8 py-8 text-center text-[#6b7f79] text-sm">No applicants yet</td></tr>}
              {applicants.map((a) => (
                <tr key={a.id} className="border-t border-gray-50 hover:bg-[#f8faf9] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d1e8e3] flex items-center justify-center text-xs font-extrabold text-[#051612]">{a.firstName?.charAt(0)}</div>
                      <span className="font-bold text-[#071a15] text-sm">{a.firstName} {a.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-[#4a5a55] text-sm font-medium">{a.jobTitle}</td>
                  <td className="px-4 py-5 text-[#6b7f79] text-sm">{new Date(a.appliedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${applicantStatusStyle[a.status] ?? 'bg-gray-100'}`}>{a.status}</span></td>
                  <td className="px-4 py-5 text-right pr-8">
                    <button onClick={() => openApplicantDetails(a)} className="text-xs font-black text-[#40b594] hover:bg-[#f0f9f6] px-3 py-1.5 rounded-lg transition-all">View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default EmployerDashboard;