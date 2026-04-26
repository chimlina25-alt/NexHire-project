"use client";

import React, { useRef } from 'react';
import { LayoutDashboard, Users, Settings, Plus, Eye, FileText, Bell, MessageSquare, MoreVertical } from 'lucide-react';
import Link from 'next/link';

const EmployerDashboard = () => {
  const applicantsRef = useRef<HTMLDivElement | null>(null);

  const handleScrollToApplicants = () => {
    applicantsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-20 text-[#1A1A1A]">
      
      {/* UPDATED NAVIGATION BAR - MATCHES YOUR IMAGE */}
      <header className="bg-[#021a15] text-white px-12 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* Logo and Name in a straight line */}
          <img src="/logo.png" alt="NexHire" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold tracking-tight">NexHire</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/" className="px-5 py-2 text-sm font-medium hover:text-gray-300 transition-colors">Home</Link>
          {/* Active State Pill */}
          <button className="px-5 py-2 text-sm font-medium bg-[#0b2b24] rounded-full text-white">My Jobs</button>
          <Link href="/employer_message" className="px-5 py-2 text-sm font-medium hover:text-gray-300 transition-colors">Messages</Link>
          <Link href="/employer_notification" className="px-5 py-2 text-sm font-medium hover:text-gray-300 transition-colors">Notifications</Link>
          <Link href="/setting" className="px-5 py-2 text-sm font-medium hover:text-gray-300 transition-colors">Settings</Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right leading-tight">
            <p className="text-[12px] font-medium">User name</p>
            <p className="text-[10px] text-gray-400">Profile</p>
          </div>
          <div className="w-9 h-9 bg-[#1a3a34] rounded-full flex items-center justify-center font-bold text-white border border-white/10">
            U
          </div>
        </div>
      </header>

      {/* REST OF YOUR DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-12 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back, Company1</h1>
          <p className="text-gray-500">Manage your recruitment pipeline and job postings.</p>
        </div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Jobs Posted', value: '5', icon: FileText, color: 'text-[#00966B]', bg: 'bg-[#eef7f6]' },
            { label: 'Total Applicants', value: '32', icon: Users, color: 'text-black', bg: 'bg-gray-100' },
            { label: 'Active Jobs', value: '3', icon: LayoutDashboard, color: 'text-[#00966B]', bg: 'bg-[#dceae7]' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-100 p-8 rounded-[24px] shadow-sm flex items-center gap-6">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                <stat.icon size={32} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* RECENT JOBS TABLE */}
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-8">Recent Job Postings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-4 font-bold">Job Title</th>
                    <th className="pb-4 font-bold">Location</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-center">Applicants</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { title: 'Frontend Developer', cat: 'IT', loc: 'Phnom Penh', status: 'Active', count: 12 },
                    { title: 'UI/UX Designer', cat: 'Design', loc: 'Remote', status: 'Active', count: 8 },
                    { title: 'Marketing Specialist', cat: 'Marketing', loc: 'Phnom Penh', status: 'Closed', count: 7 },
                  ].map((job, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 pr-4">
                        <p className="font-bold text-gray-800">{job.title}</p>
                        <p className="text-xs text-gray-400">{job.cat}</p>
                      </td>
                      <td className="py-5 text-gray-500 font-medium">{job.loc}</td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-5 text-center font-black text-lg">{job.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#051612] p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/post_job" className="w-full bg-[#00966B] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                  <Plus size={20} /> Post New Job
                </Link>
                <button 
                  onClick={handleScrollToApplicants}
                  className="w-full bg-white/10 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/20 transition-all border border-white/10"
                >
                  <Eye size={20} /> View Applicants
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT APPLICANTS SECTION */}
        <section ref={applicantsRef} className="mt-20">
          <h2 className="text-2xl font-bold mb-8">Recent Applicants</h2>
          <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-widest">
                  <th className="py-4 px-8 font-bold">Candidate</th>
                  <th className="py-4 px-8 font-bold">Applied For</th>
                  <th className="py-4 px-8 font-bold">Date</th>
                  <th className="py-4 px-8 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Rithy Kim', title: 'Frontend Developer', date: 'Apr 23, 2024', status: 'New' },
                  { name: 'Nika Yem', title: 'Sales Specialist', date: 'Jan 02, 2024', status: 'New' },
                ].map((applicant, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="py-6 px-8 font-bold text-gray-800">{applicant.name}</td>
                    <td className="py-6 px-8 text-gray-500">{applicant.title}</td>
                    <td className="py-6 px-8 text-gray-400 italic">{applicant.date}</td>
                    <td className="py-6 px-8 text-[#00966B] font-bold uppercase text-[11px] tracking-widest">{applicant.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EmployerDashboard;