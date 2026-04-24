"use client";

import React, { useRef } from 'react';
import { LayoutDashboard, Users, Plus, Eye, FileText, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const EmployerDashboard = () => {
  const applicantsRef = useRef<HTMLDivElement | null>(null);

  const handleScrollToApplicants = () => {
    applicantsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const jobs = [
    { title: 'Frontend Developer', cat: 'IT & Software', loc: 'Phnom Penh', status: 'Active', count: 12 },
    { title: 'UI/UX Designer', cat: 'Design', loc: 'Remote', status: 'Active', count: 8 },
    { title: 'Marketing Specialist', cat: 'Marketing', loc: 'Phnom Penh', status: 'Closed', count: 7 },
    { title: 'Sales Executive', cat: 'Sales', loc: 'Siem Reap', status: 'Active', count: 5 },
    { title: 'Data Analyst', cat: 'IT & Software', loc: 'Hybrid', status: 'Draft', count: 0 },
  ];

  const applicants = [
    { name: 'Rithy Kim', title: 'Frontend Developer', date: 'Apr 23, 2024', status: 'New' },
    { name: 'Nika Yem', title: 'Sales', date: 'Jan 02, 2024', status: 'New' },
    { name: 'Sokha Chan', title: 'UI/UX Designer', date: 'May 10, 2024', status: 'In Review' },
  ];

  const statusStyle: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Closed: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    Draft:  'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  };

  const applicantStatusStyle: Record<string, string> = {
    New:       'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    'In Review': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  };

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: '#f0f4f3' }}>

      {/* ── HEADER ── */}
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
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

        {/* ── PAGE TITLE ── */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Dashboard Overview</p>
            <h1 className="text-4xl font-extrabold text-[#071a15] leading-tight">Welcome back, Company1</h1>
          </div>
          <Link href="/post_job">
            <button className="flex items-center gap-2 bg-[#051612] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all shadow-md">
              <Plus size={18} /> Post New Job
            </button>
          </Link>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Total Jobs Posted', value: '5',  icon: FileText,      bg: 'bg-[#051612]', iconBg: 'bg-[#0d2a23]', trend: '+2 this month' },
            { label: 'Total Applicants',  value: '32', icon: Users,         bg: 'bg-[#133228]', iconBg: 'bg-[#1a4035]', trend: '+8 this week'  },
            { label: 'Active Jobs',       value: '3',  icon: TrendingUp,    bg: 'bg-[#40b594]', iconBg: 'bg-[#33997a]', trend: '3 open roles', dark: true },
          ].map(({ label, value, icon: Icon, bg, iconBg, trend, dark }) => (
            <div key={label} className={`${bg} rounded-2xl p-7 flex flex-col gap-5 shadow-sm`}>
              <div className="flex items-start justify-between">
                <div className={`${iconBg} p-3 rounded-xl`}>
                  <Icon className={dark ? 'text-[#051612]' : 'text-[#40b594]'} size={24} />
                </div>
                <ArrowUpRight className={dark ? 'text-[#051612] opacity-60' : 'text-[#40b594] opacity-60'} size={18} />
              </div>
              <div>
                <p className={`text-5xl font-extrabold ${dark ? 'text-[#051612]' : 'text-white'} leading-none mb-1`}>{value}</p>
                <p className={`text-sm font-semibold ${dark ? 'text-[#071a15]' : 'text-gray-300'}`}>{label}</p>
                <p className={`text-xs mt-1 ${dark ? 'text-[#133228]' : 'text-[#40b594]'} font-medium`}>{trend}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* RECENT JOBS TABLE */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-[#071a15]">Recent Jobs</h2>
              <span className="text-xs font-bold text-[#40b594] bg-emerald-50 px-3 py-1 rounded-full">5 listings</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f8faf9] text-xs font-bold uppercase tracking-wider text-[#6b7f79]">
                    <th className="px-8 py-4">Job Title</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Location</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-center">Applicants</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, idx) => (
                    <tr key={idx} className="border-t border-gray-50 hover:bg-[#f8faf9] transition-colors">
                      <td className="px-8 py-4 font-bold text-[#071a15] text-sm">{job.title}</td>
                      <td className="px-4 py-4 text-[#4a5a55] text-sm font-medium">{job.cat}</td>
                      <td className="px-4 py-4 text-[#4a5a55] text-sm font-medium">{job.loc}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle[job.status]}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-extrabold text-[#071a15] text-sm">{job.count}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 h-fit sticky top-24">
            <h2 className="text-lg font-extrabold text-[#071a15] mb-2">Quick Actions</h2>

            <Link href="/post_job" className="block">
              <button className="w-full bg-[#051612] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#0d2a23] transition-all shadow-sm">
                <Plus size={18} /> Post a New Job
              </button>
            </Link>

            <button
              onClick={handleScrollToApplicants}
              className="w-full border-2 border-[#d1e8e3] text-[#071a15] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#f0f9f6] hover:border-[#40b594] transition-all"
            >
              <Eye size={18} /> View Applicants
            </button>

            <button className="w-full border-2 border-[#d1e8e3] text-[#071a15] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#f0f9f6] hover:border-[#40b594] transition-all">
              <FileText size={18} /> Drafts
            </button>

            <div className="border-t border-gray-100 my-1" />

            <div className="bg-[#f0f9f6] rounded-xl p-4">
              <p className="text-xs font-bold text-[#40b594] uppercase tracking-wider mb-1">Plan</p>
              <p className="text-sm font-extrabold text-[#071a15]">Free Tier</p>
              <p className="text-xs text-[#6b7f79] mt-0.5">3 active job slots</p>
              <Link href="/subscription">
                <button className="mt-3 w-full text-xs font-bold text-[#40b594] hover:underline text-left">
                  Upgrade plan →
                </button>
              </Link>
            </div>
          </div>

        </div>

        {/* ── RECENT APPLICANTS ── */}
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
                      <div className="w-8 h-8 rounded-full bg-[#d1e8e3] flex items-center justify-center text-xs font-extrabold text-[#051612]">
                        {a.name.charAt(0)}
                      </div>
                      <span className="font-bold text-[#071a15] text-sm">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-[#4a5a55] text-sm font-medium">{a.title}</td>
                  <td className="px-4 py-5 text-[#6b7f79] text-sm">{a.date}</td>
                  <td className="px-4 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${applicantStatusStyle[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <button className="text-xs font-bold text-[#40b594] hover:underline">View →</button>
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