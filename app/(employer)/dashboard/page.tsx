"use client";

import React, { useRef, useState } from 'react';
import { 
  Plus, FileText, TrendingUp, ArrowUpRight, 
  Users, X, Save, ArrowLeft, FileEdit, Trash2, Clock,
  ChevronDown, Mail, Calendar, Briefcase, Download,
  CheckCircle2, XCircle, Search
} from 'lucide-react';
import Link from 'next/link';

// --- OPTIONS FROM POST JOB SYSTEM ---
const categoryOptions = ["IT & Software", "Design", "Marketing", "Sales", "Finance", "Human Resources", "Engineering", "Customer Support", "Operations", "Legal"];
const locationOptions = ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville", "Kampot", "Kandal", "Takeo", "Remote", "Other"];

// --- COMBOBOX COMPONENT ---
function Combobox({ placeholder, options, inputClass, value, onChange }: any) {
  const [open, setOpen] = useState(false);
  const safeValue = value || "";
  const filtered = options.filter((o: string) => o.toLowerCase().includes(safeValue.toLowerCase()));
  
  return (
    <div className="relative">
      <input 
        type="text" 
        value={safeValue} 
        placeholder={placeholder} 
        className={`${inputClass} pr-10`} 
        onChange={(e) => { onChange(e.target.value); setOpen(true); }} 
        onFocus={() => setOpen(true)} 
        onBlur={() => setTimeout(() => setOpen(false), 120)} 
      />
      <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] pointer-events-none transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {filtered.map((option: string) => (
            <li key={option} onMouseDown={() => { onChange(option); setOpen(false); }} className="px-4 py-2.5 text-sm font-medium text-[#071a15] cursor-pointer hover:bg-[#f0f9f6] hover:text-[#40b594]">
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const EmployerDashboard = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "drafts">("dashboard");
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"view" | "edit" | "view_applicant">("view");
  
  const [selectedJob, setSelectedJob] = useState<any>({
    title: "", cat: "", loc: "", desc: "", arrangement: "On-site", employmentType: "Full-time", requirements: ""
  });

  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const applicantsRef = useRef<HTMLDivElement | null>(null);

  const handleScrollToApplicants = () => {
    applicantsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- DATA ---
  const jobs = [
    { id: 1, title: 'Frontend Developer', cat: 'IT & Software', loc: 'Phnom Penh', status: 'Active', count: 12, desc: "Building responsive web apps using React and Next.js." },
    { id: 2, title: 'UI/UX Designer', cat: 'Design', loc: 'Remote', status: 'Active', count: 8, desc: "Designing user-centric interfaces and prototypes." },
    { id: 3, title: 'Marketing Specialist', cat: 'Marketing', loc: 'Phnom Penh', status: 'Closed', count: 7, desc: "Running social media campaigns." },
    { id: 4, title: 'Sales Executive', cat: 'Sales', loc: 'Siem Reap', status: 'Active', count: 5, desc: "Closing deals and lead generation." },
  ];

  const applicants = [
    { 
        name: 'Rithy Kim', title: 'Frontend Developer', date: 'Apr 23, 2024', status: 'New', 
        email: 'rithy.kim@email.com', bio: 'I have 3 years of experience in React and UI/UX design. I am highly motivated to build responsive and clean user interfaces.', 
        experience: 'Junior Developer at ABC Tech (2021 - Present)' 
    },
    { 
        name: 'Nika Yem', title: 'Sales', date: 'Jan 02, 2024', status: 'New', 
        email: 'nika.yem@email.com', bio: 'Specialized in B2B sales and international market growth with a proven track record of hitting targets.', 
        experience: 'Sales Associate at XYZ Corp' 
    },
    { 
        name: 'Sokha Chan', title: 'UI/UX Designer', date: 'May 10, 2024', status: 'In Review', 
        email: 'sokha.chan@email.com', bio: 'Expert in Figma and user-centric research. Passionate about creating accessible digital products.', 
        experience: 'Freelance Designer' 
    },
  ];

  const statusStyle: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Closed: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  };

  const applicantStatusStyle: Record<string, string> = {
    New: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    'In Review': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  };

  const openPanel = (job: any, mode: "view" | "edit") => {
    setSelectedJob({ ...job, title: job.title || "", cat: job.cat || "", loc: job.loc || "", desc: job.desc || "" });
    setPanelMode(mode);
    setPanelOpen(true);
  };

  const openApplicantDetails = (applicant: any) => {
    setSelectedApplicant(applicant);
    setPanelMode("view_applicant");
    setPanelOpen(true);
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 transition-all";
  const labelClass = "block text-sm font-extrabold text-[#071a15] mb-2";
  const selectClass = "w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 transition-all appearance-none";

  if (activeView === "drafts") {
    return (
      <div className="min-h-screen font-sans pb-16" style={{ background: '#f0f4f3' }}>
        <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
            <span className="text-xl font-extrabold tracking-tight">NexHire</span>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-12">
          <button onClick={() => setActiveView("dashboard")} className="flex items-center gap-2 text-[#4a5a55] font-bold mb-8 hover:text-[#071a15] transition-all">
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <h1 className="text-4xl font-extrabold text-[#071a15] mb-8">Drafts & Archive</h1>
          <div className="bg-white p-6 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0f9f6] rounded-xl flex items-center justify-center border border-[#d1e8e3]">
                  <Clock size={20} className="text-[#40b594]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#071a15]">Data Analyst</h3>
                  <p className="text-xs text-[#6b7f79] font-bold uppercase">Last saved: 2 hours ago</p>
                </div>
              </div>
              <button className="bg-[#051612] text-white px-6 py-2.5 rounded-xl font-bold text-sm">Resume Posting</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-16 relative overflow-hidden" style={{ background: '#f0f4f3' }}>
      
      {/* ─── SLIDE-OVER PANEL ─── */}
      <div className={`fixed inset-0 z-[100] transition-all duration-300 ${panelOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl p-0 overflow-hidden transform transition-transform duration-300 ${panelOpen ? "translate-x-0" : "translate-x-full"}`}>
          
          <div className="h-full flex flex-col">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-5">
                    {panelMode === "view_applicant" ? (
                        <div className="w-16 h-16 rounded-2xl bg-[#051612] flex items-center justify-center text-white text-2xl font-black">
                            {selectedApplicant?.name.charAt(0)}
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-[#f0f9f6] flex items-center justify-center text-[#40b594] border border-[#d1e8e3]">
                            <FileEdit size={28} />
                        </div>
                    )}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#40b594] mb-1">
                            {panelMode === "view_applicant" ? "Job Application" : "Edit Listing"}
                        </p>
                        <h2 className="text-2xl font-extrabold text-[#071a15]">
                            {panelMode === "view_applicant" ? selectedApplicant?.name : selectedJob.title}
                        </h2>
                    </div>
                </div>
                <button onClick={() => setPanelOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 pt-6">
                {panelMode === "view_applicant" ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#f8faf9] p-5 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-[#6b7f79] uppercase mb-1 flex items-center gap-1"><Mail size={12}/> Email Address</p>
                                <p className="text-sm font-bold text-[#071a15]">{selectedApplicant?.email}</p>
                            </div>
                            <div className="bg-[#f8faf9] p-5 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-[#6b7f79] uppercase mb-1 flex items-center gap-1"><Calendar size={12}/> Applied Date</p>
                                <p className="text-sm font-bold text-[#071a15]">{selectedApplicant?.date}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-[#071a15] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Briefcase size={16} className="text-[#40b594]"/> Last Experience
                            </h4>
                            <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <p className="text-sm font-bold text-[#071a15]">{selectedApplicant?.title}</p>
                                <p className="text-xs font-semibold text-[#6b7f79] mt-1">{selectedApplicant?.experience}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-[#071a15] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FileText size={16} className="text-[#40b594]"/> Cover Letter / Bio
                            </h4>
                            <p className="text-sm text-[#4a5a55] leading-relaxed font-medium bg-[#f0f9f6]/40 p-6 rounded-2xl border border-[#d1e8e3]">
                                {selectedApplicant?.bio}
                            </p>
                        </div>

                        <div className="p-5 bg-white border-2 border-dashed border-[#d1e8e3] rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 font-black text-[10px]">PDF</div>
                                <div>
                                    <p className="text-sm font-bold text-[#071a15]">Resume_CV.pdf</p>
                                    <p className="text-[10px] font-bold text-[#6b7f79]">1.2 MB</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 text-[#40b594] font-black text-xs hover:bg-[#f0f9f6] p-2 rounded-lg transition-all">
                                <Download size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Job Title <span className="text-red-500">*</span></label>
                            <input value={selectedJob.title} className={inputClass} onChange={(e) => setSelectedJob({...selectedJob, title: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className={labelClass}>Category</label><Combobox options={categoryOptions} inputClass={inputClass} value={selectedJob.cat} onChange={(v:any)=>setSelectedJob({...selectedJob, cat:v})} /></div>
                            <div><label className={labelClass}>Location</label><Combobox options={locationOptions} inputClass={inputClass} value={selectedJob.loc} onChange={(v:any)=>setSelectedJob({...selectedJob, loc:v})} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="relative">
                                <label className={labelClass}>Work Arrangement</label>
                                <select className={selectClass} value={selectedJob.arrangement} onChange={(e) => setSelectedJob({...selectedJob, arrangement: e.target.value})}>
                                    <option>On-site</option><option>Remote</option><option>Hybrid</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                            </div>
                            <div className="relative">
                                <label className={labelClass}>Employment Type</label>
                                <select className={selectClass} value={selectedJob.employmentType} onChange={(e) => setSelectedJob({...selectedJob, employmentType: e.target.value})}>
                                    <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Freelance</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea rows={6} value={selectedJob.desc} className={`${inputClass} resize-none`} onChange={(e) => setSelectedJob({...selectedJob, desc: e.target.value})} />
                        </div>
                        <button className="w-full bg-[#051612] text-white py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#0d2a23] transition-all"><Save size={18} /> Save Changes</button>
                    </div>
                )}
            </div>

            {panelMode === "view_applicant" && (
                <div className="p-8 border-t border-gray-100 bg-[#f8faf9] flex items-center gap-3">
                    <button className="flex-1 bg-white border border-gray-200 text-[#4a5a55] py-4 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all uppercase">
                        <Search size={14} /> Under Review
                    </button>
                    <button className="flex-1 bg-white border border-gray-200 text-[#4a5a55] py-4 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all uppercase">
                        <XCircle size={14} /> Reject
                    </button>
                    <button className="flex-[1.5] bg-[#051612] text-white py-4 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#40b594] transition-all shadow-lg uppercase">
                        <CheckCircle2 size={14} /> Accept Applicant
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
        <Link href="/employer_profile">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Company</p>
              <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors">Profile</p>
            </div>
            <div className="w-10 h-10 bg-[#40b594] rounded-full flex items-center justify-center font-extrabold text-[#051612] text-sm">C</div>
          </div>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Dashboard Overview</p>
            <h1 className="text-4xl font-extrabold text-[#071a15] leading-tight">Welcome back, Company1</h1>
          </div>
          <Link href="/post_job">
            <button className="flex items-center gap-2 bg-[#051612] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all">
              <Plus size={18} /> Post New Job
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Total Jobs Posted', value: '5', icon: FileText, bg: 'bg-[#051612]', iconBg: 'bg-[#0d2a23]', trend: '+2 this month' },
            { label: 'Total Applicants', value: '32', icon: Users, bg: 'bg-[#133228]', iconBg: 'bg-[#1a4035]', trend: '+8 this week' },
            { label: 'Active Jobs', value: '3', icon: TrendingUp, bg: 'bg-[#40b594]', iconBg: 'bg-[#33997a]', trend: '3 open roles', dark: true },
          ].map(({ label, value, icon: Icon, bg, iconBg, trend, dark }) => (
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
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100"><h2 className="text-lg font-extrabold text-[#071a15]">Recent Jobs</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f8faf9] text-xs font-bold uppercase tracking-wider text-[#6b7f79]">
                    <th className="px-8 py-4">Job Title</th><th className="px-4 py-4">Category</th><th className="px-4 py-4">Location</th><th className="px-4 py-4">Status</th><th className="px-4 py-4 text-center">Applicants</th><th className="px-4 py-4 text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, idx) => (
                    <tr key={idx} className="border-t border-gray-50 hover:bg-[#f8faf9] transition-colors group">
                      <td className="px-8 py-4 font-bold text-[#071a15] text-sm">{job.title}</td>
                      <td className="px-4 py-4 text-[#4a5a55] text-sm font-medium">{job.cat}</td>
                      <td className="px-4 py-4 text-[#4a5a55] text-sm font-medium">{job.loc}</td>
                      <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle[job.status]}`}>{job.status}</span></td>
                      <td className="px-4 py-4 text-center font-extrabold text-[#071a15] text-sm">{job.count}</td>
                      <td className="px-4 py-4 text-right pr-8"><div className="flex justify-end gap-1"><button onClick={() => openPanel(job, "edit")} className="p-2 text-gray-400 hover:text-[#40b594] transition-all"><FileEdit size={16}/></button><button className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={16}/></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 h-fit sticky top-24">
            <h2 className="text-lg font-extrabold text-[#071a15] mb-2">Quick Actions</h2>
            <Link href="/post_job" className="block"><button className="w-full bg-[#051612] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#0d2a23] transition-all"><Plus size={18} /> Post a New Job</button></Link>
            <button onClick={handleScrollToApplicants} className="w-full border-2 border-[#d1e8e3] text-[#071a15] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#f0f9f6] hover:border-[#40b594] transition-all"><Users size={18} /> View Applicants</button>
            <button onClick={() => setActiveView("drafts")} className="w-full border-2 border-[#d1e8e3] text-[#071a15] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#f0f9f6] hover:border-[#40b594] transition-all"><FileText size={18} /> Drafts</button>
          </div>
        </div>

        <section ref={applicantsRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-extrabold text-[#071a15]">Recent Applicants</h2>
            <span className="text-xs font-bold text-[#40b594] bg-emerald-50 px-3 py-1 rounded-full">{applicants.length} new</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8faf9] text-xs font-bold uppercase tracking-wider text-[#6b7f79]">
                <th className="px-8 py-4">Name</th>
                <th className="px-4 py-4">Applied For</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a, idx) => (
                <tr key={idx} className="border-t border-gray-50 hover:bg-[#f8faf9] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d1e8e3] flex items-center justify-center text-xs font-extrabold text-[#051612]">{a.name.charAt(0)}</div>
                      <span className="font-bold text-[#071a15] text-sm">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-[#4a5a55] text-sm font-medium">{a.title}</td>
                  <td className="px-4 py-5 text-[#6b7f79] text-sm">{a.date}</td>
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