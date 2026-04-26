"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Radio, MessageSquare, LogOut,
  Search, ChevronDown, MoreHorizontal, Clock, Eye, Trash2
} from 'lucide-react';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin_dashboard' },
  { name: 'Manage Users', icon: Users, href: '/manage_user' },
  { name: 'Employers', icon: Building2, href: '/admin_emplyer' },
  { name: 'Job Posts', icon: FileText, href: '/job_station' },
  { name: 'Subscription', icon: CreditCard, href: '/admin_subscription' },
  { name: 'Broadcast', icon: Radio, href: '/broadcast' },
  { name: 'Messages', icon: MessageSquare, href: '/admin_message' },
];

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Tech': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'Food': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Finance': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Services': { bg: 'bg-teal-50', text: 'text-teal-700' },
  'Retail': { bg: 'bg-pink-50', text: 'text-pink-700' },
  'Construction': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
};

const jobPosts = [
  { title: 'Cashier', company: 'Coffee Corner', category: 'Retail', status: 'Active', posted: 'Jan 14, 2026', applicants: 24, type: 'Full-time' },
  { title: 'Baker', company: "Mike's Bakery", category: 'Food', status: 'Active', posted: 'Jan 5, 2026', applicants: 9, type: 'Part-time' },
  { title: 'IT Support', company: 'Spendly', category: 'Tech', status: 'Active', posted: 'Jan 2, 2026', applicants: 41, type: 'Full-time' },
  { title: 'Financial Analyst', company: 'Spendly', category: 'Finance', status: 'Closed', posted: 'Dec 28, 2025', applicants: 63, type: 'Full-time' },
  { title: 'Plumber', company: 'BuildCo', category: 'Construction', status: 'Active', posted: 'Feb 3, 2026', applicants: 7, type: 'Contract' },
  { title: 'Housekeeper', company: 'GreenServe', category: 'Services', status: 'Active', posted: 'Feb 14, 2026', applicants: 18, type: 'Part-time' },
  { title: 'Frontend Dev', company: 'TechNow Ltd', category: 'Tech', status: 'Active', posted: 'Mar 1, 2026', applicants: 88, type: 'Full-time' },
];

function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-[#0d1f1a] flex flex-col py-8 px-5 fixed h-full z-10">
      <div className="flex items-center gap-2.5 mb-10 px-2">
        <div className="w-8 h-8 bg-[#00ffa3] rounded-lg flex items-center justify-center">
          <span className="text-[#0d1f1a] font-black text-xs">N</span>
        </div>
        <span className="text-white font-black text-lg tracking-tight">NexHire</span>
      </div>
      <p className="text-[#3a5a4f] text-[9px] font-black uppercase tracking-[0.2em] mb-3 px-2">Main Menu</p>
      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isActive ? 'bg-[#00ffa3] text-[#0d1f1a]' : 'text-[#6b9e8a] hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={17} />{item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/5 pt-5 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-[#00ffa3] rounded-lg flex items-center justify-center font-black text-[#0d1f1a] text-xs">A</div>
          <div>
            <p className="text-white font-bold text-xs">Admin</p>
            <p className="text-[#3a5a4f] text-[10px]">Admin67@example.com</p>
          </div>
        </div>
        <Link href="/log_in">
          <button className="w-full bg-red-500/10 text-red-400 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
            <LogOut size={15} />Sign Out
          </button>
        </Link>
      </div>
    </aside>
  );
}

export default function JobStation() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...Object.keys(categoryColors)];
  const visible = activeCategory === 'All' ? jobPosts : jobPosts.filter(j => j.category === activeCategory);

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Job Station</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">Apr 28, 2026 · {jobPosts.filter(j => j.status === 'Active').length} active posts</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Posts', value: jobPosts.length, color: 'bg-[#0d1f1a]', textColor: 'text-white', subColor: 'text-[#6b9e8a]' },
            { label: 'Active', value: jobPosts.filter(j => j.status === 'Active').length, color: 'bg-white', textColor: 'text-[#0d1f1a]', subColor: 'text-emerald-600' },
            { label: 'Total Applicants', value: jobPosts.reduce((a, b) => a + b.applicants, 0), color: 'bg-white', textColor: 'text-[#0d1f1a]', subColor: 'text-[#6b9e8a]' },
            { label: 'Avg. Applicants', value: Math.round(jobPosts.reduce((a, b) => a + b.applicants, 0) / jobPosts.length), color: 'bg-white', textColor: 'text-[#0d1f1a]', subColor: 'text-[#6b9e8a]' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl p-5 shadow-sm border border-black/5`}>
              <p className={`text-xs font-bold mb-2 opacity-50 ${s.textColor}`}>{s.label}</p>
              <p className={`text-2xl font-black ${s.textColor}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Controls */}
          <div className="flex items-center justify-between p-5 border-b border-gray-50 gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input type="text" placeholder="Search jobs..."
                className="w-full bg-[#f4f7f5] border-none rounded-xl py-2.5 pl-11 pr-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30" />
            </div>
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-[#0d1f1a] text-[#00ffa3]'
                      : (categoryColors[cat]
                        ? `${categoryColors[cat].bg} ${categoryColors[cat].text}`
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200')
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead className="bg-[#f9fafb]">
              <tr>
                {['Job Title', 'Company', 'Category', 'Type', 'Applicants', 'Status', 'Posted', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map((job, i) => {
                const cat = categoryColors[job.category] || { bg: 'bg-gray-50', text: 'text-gray-500' };
                return (
                  <tr key={i} className="hover:bg-[#f9fffe] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-black text-sm text-[#0d1f1a]">{job.title}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{job.company}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>{job.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded-lg">{job.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00ffa3] rounded-full" style={{ width: `${Math.min((job.applicants / 100) * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs font-black text-[#0d1f1a]">{job.applicants}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${
                        job.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock size={11} />
                        <span className="text-[11px] font-bold">{job.posted}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-300 hover:text-blue-500 transition-colors"><Eye size={13} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}