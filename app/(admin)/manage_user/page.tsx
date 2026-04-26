"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Radio, MessageSquare, LogOut,
  Search, MoreHorizontal, ChevronDown, UserCheck, UserX, Shield
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

const userData = [
  { name: 'John Son', email: 'john.son@email.com', status: 'Active', forms: 12, joined: 'Jan 14, 2026', role: 'Job Seeker', color: '#e8f5e9' },
  { name: 'Jeff Byers', email: 'jeff.byers@email.com', status: 'Inactive', forms: 5, joined: 'Jan 5, 2026', role: 'Job Seeker', color: '#e3f2fd' },
  { name: 'Jay Thomas', email: 'jay.thomas@email.com', status: 'Active', forms: 2, joined: 'Jan 2, 2026', role: 'Job Seeker', color: '#fce4ec' },
  { name: 'Maria Santos', email: 'maria.s@email.com', status: 'Active', forms: 8, joined: 'Feb 1, 2026', role: 'Job Seeker', color: '#fff3e0' },
  { name: 'Kevin Park', email: 'kevin.p@email.com', status: 'Suspended', forms: 0, joined: 'Jan 20, 2026', role: 'Job Seeker', color: '#f3e5f5' },
  { name: 'Alyssa Chua', email: 'alyssa.c@email.com', status: 'Active', forms: 19, joined: 'Mar 3, 2026', role: 'Job Seeker', color: '#e0f2f1' },
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

const statusConfig = {
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: UserCheck },
  Inactive: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400', icon: UserX },
  Suspended: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', icon: Shield },
};

export default function ManageUsers() {
  const [filter, setFilter] = useState('All');
  const counts = { All: userData.length, Active: userData.filter(u => u.status === 'Active').length, Inactive: userData.filter(u => u.status !== 'Active').length };
  const filtered = filter === 'All' ? userData : filter === 'Active' ? userData.filter(u => u.status === 'Active') : userData.filter(u => u.status !== 'Active');

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Manage Users</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">Apr 28, 2026</p>
          </div>
          <div className="flex items-center gap-2">
            {Object.entries(counts).map(([key, count]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  filter === key ? 'bg-[#0d1f1a] text-[#00ffa3]' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                }`}>
                {key} <span className="opacity-60">({count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Users', value: '5,189', sub: '↑ 12% this week', color: 'bg-[#0d1f1a] text-white' },
            { label: 'Active Users', value: '4,821', sub: '93% of total', color: 'bg-white border border-gray-100' },
            { label: 'New This Month', value: '312', sub: '↑ 8% vs last month', color: 'bg-white border border-gray-100' },
          ].map((c, i) => (
            <div key={i} className={`${c.color} rounded-2xl p-5 shadow-sm`}>
              <p className={`text-xs font-bold mb-3 ${i === 0 ? 'text-[#6b9e8a]' : 'text-gray-400'}`}>{c.label}</p>
              <p className={`text-2xl font-black ${i === 0 ? 'text-white' : 'text-[#0d1f1a]'}`}>{c.value}</p>
              <p className={`text-xs font-bold mt-1 ${i === 0 ? 'text-[#00ffa3]' : 'text-[#6b9e8a]'}`}>{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table Header Controls */}
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input type="text" placeholder="Search users..."
                className="bg-[#f4f7f5] border-none rounded-xl py-2.5 pl-11 pr-5 text-sm font-medium w-72 focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30" />
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-xl px-4 py-2.5 hover:border-gray-300 transition-colors">
              Sort by Joined <ChevronDown size={13} />
            </button>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb] text-left">
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Applications</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user, i) => {
                const s = statusConfig[user.status as keyof typeof statusConfig] || statusConfig.Inactive;
                return (
                  <tr key={i} className="hover:bg-[#f9fffe] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-[#0d1f1a]"
                          style={{ backgroundColor: user.color }}>
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#0d1f1a]">{user.name}</p>
                          <p className="text-[11px] text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00ffa3] rounded-full" style={{ width: `${Math.min((user.forms / 20) * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-500">{user.forms}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{user.joined}</td>
                    <td className="px-6 py-4">
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
                        <MoreHorizontal size={16} />
                      </button>
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