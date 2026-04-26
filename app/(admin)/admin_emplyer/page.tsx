"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Radio, MessageSquare, LogOut,
  Search, MapPin, Briefcase, Calendar, MoreVertical, ExternalLink, TrendingUp
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

const employers = [
  { name: 'Coffee Corner', industry: 'Food & Beverage', location: 'Phnom Penh', jobs: 3, plan: 'Premium', joined: 'Jan 14, 2026', status: 'Active', color: '#fff3e0', initials: 'CC', employees: '12–50' },
  { name: "Mike's Bakery", industry: 'Food & Beverage', location: 'Siem Reap', jobs: 1, plan: 'Standard', joined: 'Jan 5, 2026', status: 'Active', color: '#e8f5e9', initials: 'MB', employees: '1–10' },
  { name: 'Spendly', industry: 'Fintech', location: 'Phnom Penh', jobs: 16, plan: 'Premium', joined: 'Jan 2, 2026', status: 'Active', color: '#e3f2fd', initials: 'SP', employees: '50–200' },
  { name: 'BuildCo', industry: 'Construction', location: 'Battambang', jobs: 7, plan: 'Standard', joined: 'Feb 1, 2026', status: 'Active', color: '#fce4ec', initials: 'BC', employees: '100–500' },
  { name: 'TechNow Ltd', industry: 'Technology', location: 'Phnom Penh', jobs: 22, plan: 'Premium', joined: 'Feb 10, 2026', status: 'Active', color: '#f3e5f5', initials: 'TN', employees: '50–200' },
  { name: 'GreenServe', industry: 'Services', location: 'Kampot', jobs: 4, plan: 'Standard', joined: 'Mar 3, 2026', status: 'Inactive', color: '#e0f2f1', initials: 'GS', employees: '10–50' },
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

export default function AdminEmployers() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const visible = employers.filter(e => e.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Employers</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">Apr 28, 2026 · {employers.length} registered</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('grid')} className={`p-2.5 rounded-xl border transition-all ${view === 'grid' ? 'bg-[#0d1f1a] border-[#0d1f1a] text-[#00ffa3]' : 'bg-white border-gray-200 text-gray-400'}`}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" fill="currentColor"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" fill="currentColor"/></svg>
            </button>
            <button onClick={() => setView('list')} className={`p-2.5 rounded-xl border transition-all ${view === 'list' ? 'bg-[#0d1f1a] border-[#0d1f1a] text-[#00ffa3]' : 'bg-white border-gray-200 text-gray-400'}`}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="2" rx="1" fill="currentColor"/><rect x="1" y="6.5" width="13" height="2" rx="1" fill="currentColor"/><rect x="1" y="11" width="13" height="2" rx="1" fill="currentColor"/></svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input type="text" placeholder="Search employers..." value={query} onChange={e => setQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-11 pr-5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30" />
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {visible.map((emp, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                {/* Card Top */}
                <div className="p-5 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-[#0d1f1a]"
                      style={{ backgroundColor: emp.color }}>
                      {emp.initials}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                        emp.plan === 'Premium' ? 'bg-[#0d1f1a] text-[#00ffa3]' : 'bg-gray-100 text-gray-500'
                      }`}>{emp.plan}</span>
                      <button className="p-1 rounded-lg hover:bg-gray-50 text-gray-300 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-black text-[#0d1f1a] text-base">{emp.name}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{emp.industry}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-50 mx-5" />

                {/* Stats */}
                <div className="px-5 py-4 grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <MapPin size={10} />
                    </div>
                    <p className="text-[11px] font-bold text-[#0d1f1a] truncate">{emp.location}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Briefcase size={10} />
                    </div>
                    <p className="text-[11px] font-bold text-[#0d1f1a]">{emp.jobs} jobs</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Calendar size={10} />
                    </div>
                    <p className="text-[11px] font-bold text-[#0d1f1a] truncate">{emp.joined.split(',')[0]}</p>
                  </div>
                </div>

                {/* Status Footer */}
                <div className={`px-5 py-3 flex items-center justify-between ${
                  emp.status === 'Active' ? 'bg-emerald-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className={`text-[10px] font-black ${emp.status === 'Active' ? 'text-emerald-700' : 'text-gray-400'}`}>{emp.status}</span>
                  </div>
                  <button className="text-[10px] font-bold text-gray-400 hover:text-[#0d1f1a] flex items-center gap-1 transition-colors">
                    View <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f9fafb]">
                <tr>
                  {['Company', 'Industry', 'Job Posts', 'Plan', 'Status', 'Joined', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map((emp, i) => (
                  <tr key={i} className="hover:bg-[#f9fffe] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a]" style={{ backgroundColor: emp.color }}>{emp.initials}</div>
                        <div>
                          <p className="font-bold text-sm text-[#0d1f1a]">{emp.name}</p>
                          <p className="text-[10px] text-gray-400">{emp.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{emp.industry}</td>
                    <td className="px-6 py-4 text-xs font-bold text-[#0d1f1a]">{emp.jobs}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${emp.plan === 'Premium' ? 'bg-[#0d1f1a] text-[#00ffa3]' : 'bg-gray-100 text-gray-500'}`}>{emp.plan}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{emp.joined}</td>
                    <td className="px-6 py-4">
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}