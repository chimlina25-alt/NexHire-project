"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Radio, MessageSquare, LogOut,
  Briefcase, User, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin_dashboard' },
  { name: 'Manage Users', icon: Users, href: '/manage_user' },
  { name: 'Employers', icon: Building2, href: '/admin_emplyer' },
  { name: 'Job Posts', icon: FileText, href: '/job_station' },
  { name: 'Subscription', icon: CreditCard, href: '/admin_subscription' },
  { name: 'Broadcast', icon: Radio, href: '/broadcast' },
  { name: 'Messages', icon: MessageSquare, href: '/admin_message' },
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
                isActive
                  ? 'bg-[#00ffa3] text-[#0d1f1a]'
                  : 'text-[#6b9e8a] hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={17} />
              {item.name}
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
            <LogOut size={15} />
            Sign Out
          </button>
        </Link>
      </div>
    </aside>
  );
}

const salesData = [
  { day: 'Mon', current: 20, previous: 15 },
  { day: 'Tue', current: 38, previous: 28 },
  { day: 'Wed', current: 27, previous: 22 },
  { day: 'Thu', current: 45, previous: 30 },
  { day: 'Fri', current: 32, previous: 25 },
  { day: 'Sat', current: 50, previous: 38 },
  { day: 'Sun', current: 41, previous: 29 },
];

const areaData = [
  { name: 'W1', value: 4200 },
  { name: 'W2', value: 5800 },
  { name: 'W3', value: 4900 },
  { name: 'W4', value: 7200 },
  { name: 'W5', value: 6100 },
  { name: 'W6', value: 8500 },
  { name: 'W7', value: 9200 },
  { name: 'W8', value: 11000 },
  { name: 'W9', value: 12677 },
];

const categories = [
  { name: 'Software Engineer', count: 234, pct: 78 },
  { name: 'Plumber', count: 182, pct: 60 },
  { name: 'Financial Officer', count: 141, pct: 47 },
  { name: 'Maid / Housekeeping', count: 98, pct: 32 },
  { name: 'Cashier', count: 76, pct: 25 },
];

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Dashboard Overview</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">Apr 28, 2026 — Monday</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse" />
            <span className="text-xs font-bold text-[#0d1f1a]">Live</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: '5,189', delta: '+12%', icon: Users, bg: 'bg-[#0d1f1a]', text: 'text-white', accent: 'text-[#00ffa3]' },
            { label: 'Active Jobs', value: '1,067', delta: '• Live', icon: Briefcase, bg: 'bg-[#00ffa3]', text: 'text-[#0d1f1a]', accent: 'text-[#0d1f1a]/60' },
            { label: 'Employers', value: '348', delta: '+5%', icon: Building2, bg: 'bg-white', text: 'text-[#0d1f1a]', accent: 'text-[#6b9e8a]' },
            { label: 'Revenue', value: '$12,677', delta: '+67%', icon: TrendingUp, bg: 'bg-white', text: 'text-[#0d1f1a]', accent: 'text-[#6b9e8a]' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`${stat.bg} rounded-2xl p-5 shadow-sm border border-black/5`}>
                <div className="flex justify-between items-start mb-4">
                  <p className={`text-xs font-bold opacity-60 ${stat.text}`}>{stat.label}</p>
                  <div className={`p-2 rounded-lg ${stat.bg === 'bg-white' ? 'bg-gray-50' : 'bg-white/10'}`}>
                    <Icon size={15} className={stat.text} />
                  </div>
                </div>
                <p className={`text-2xl font-black ${stat.text}`}>{stat.value}</p>
                <p className={`text-xs font-bold mt-1 ${stat.accent}`}>{stat.delta}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* Area Chart */}
          <div className="col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Revenue</p>
                <p className="text-3xl font-black text-[#0d1f1a] mt-1">$12,677.00</p>
              </div>
              <span className="bg-[#00ffa3]/15 text-[#0d8a5a] text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1">
                <ArrowUpRight size={12} /> 67%
              </span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ffa3" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00ffa3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#00ffa3" strokeWidth={2.5} fill="url(#colorVal)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="col-span-4 bg-[#0d1f1a] rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-[#6b9e8a] uppercase tracking-widest mb-1">Weekly Activity</p>
            <p className="text-white font-black text-lg mb-5">Job Posts</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b9e8a', fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b9e8a', fontWeight: 700 }} />
                  <Tooltip contentStyle={{ background: '#1a3028', border: 'none', borderRadius: 10, color: '#fff', fontSize: 11 }} />
                  <Bar dataKey="previous" fill="#1e3d30" radius={[4, 4, 0, 0]} barSize={10} />
                  <Bar dataKey="current" fill="#00ffa3" radius={[4, 4, 0, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-12 gap-4">
          {/* Top Categories */}
          <div className="col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <p className="font-black text-[#0d1f1a]">Top Job Categories</p>
              <span className="text-xs text-[#6b9e8a] font-bold">This month</span>
            </div>
            <div className="space-y-4">
              {categories.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-[#0d1f1a]">{cat.name}</span>
                    <span className="text-xs font-black text-[#6b9e8a]">{cat.count} posts</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00ffa3] rounded-full transition-all" style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <p className="font-black text-[#0d1f1a]">Recent Subscriptions</p>
              <span className="text-xs text-[#6b9e8a] font-bold cursor-pointer hover:text-[#0d1f1a]">View all</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Coffee Corner', plan: 'Premium', amount: '+$29.99' },
                { name: "Mike's Bakery", plan: 'Standard', amount: '+$11.99' },
                { name: 'Spendly', plan: 'Premium', amount: '+$29.99' },
                { name: 'TechNow Ltd', plan: 'Standard', amount: '+$11.99' },
                { name: 'BuildCo', plan: 'Premium', amount: '+$29.99' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#f4f7f5] rounded-lg flex items-center justify-center text-[10px] font-black text-[#0d1f1a]">
                      {item.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0d1f1a]">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{item.plan}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#00a36a]">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}