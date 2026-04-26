"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Radio, MessageSquare, LogOut,
  Search, Plus, Minus, Star, Zap, TrendingUp, MoreVertical
} from 'lucide-react';

const sidebarItems = [
  { name: 'Dashboard',    icon: LayoutDashboard, href: '/admin_dashboard' },
  { name: 'Manage Users', icon: Users,           href: '/manage_user' },
  { name: 'Employers',    icon: Building2,        href: '/admin_emplyer' },
  { name: 'Job Posts',    icon: FileText,         href: '/job_station' },
  { name: 'Subscription', icon: CreditCard,       href: '/admin_subscription' },
  { name: 'Broadcast',    icon: Radio,            href: '/broadcast' },
  { name: 'Messages',     icon: MessageSquare,    href: '/admin_message' },
];

const initialSubs = [
  { id: 1, user: 'Coffee Corner',  initials: 'CC', color: '#fff3e0', posts: 2, type: 'Premium',    joined: 'Mar 12, 2026', industry: 'Food & Beverage' },
  { id: 2, user: "Mike's Bakery",  initials: 'MB', color: '#e8f5e9', posts: 1, type: 'Standard',   joined: 'Jan 5, 2026',  industry: 'Food & Beverage' },
  { id: 3, user: 'Spendly',        initials: 'SP', color: '#e3f2fd', posts: 3, type: 'Standard',   joined: 'Apr 2, 2026',  industry: 'Fintech' },
  { id: 4, user: 'TechBridge',     initials: 'TB', color: '#f3e5f5', posts: 5, type: 'Enterprise', joined: 'Feb 20, 2026', industry: 'Technology' },
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
            <LogOut size={15} /> Sign Out
          </button>
        </Link>
      </div>
    </aside>
  );
}

const planStyle = (type: string) => {
  if (type === 'Premium')    return 'bg-[#0d1f1a] text-[#00ffa3]';
  if (type === 'Enterprise') return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-500';
};

export default function ManageSubscriptions() {
  const [subs, setSubs] = useState(initialSubs);
  const [query, setQuery] = useState('');

  const adjust = (id: number, delta: number) =>
    setSubs(prev => prev.map(s => s.id === id ? { ...s, posts: Math.max(0, s.posts + delta) } : s));

  const visible = subs.filter(s =>
    s.user.toLowerCase().includes(query.toLowerCase())
  );

  const stats = [
    { label: 'Total Subscribers', value: subs.length,                                  Icon: Users,       bg: 'bg-emerald-50',  iconColor: 'text-emerald-700' },
    { label: 'Premium Plans',     value: subs.filter(s => s.type === 'Premium').length, Icon: Star,        bg: 'bg-[#fff3e0]',   iconColor: 'text-amber-700' },
    { label: 'Enterprise Plans',  value: subs.filter(s => s.type === 'Enterprise').length, Icon: Zap,      bg: 'bg-purple-50',   iconColor: 'text-purple-700' },
    { label: 'Total Posts',       value: subs.reduce((a, s) => a + s.posts, 0),         Icon: TrendingUp,  bg: 'bg-blue-50',     iconColor: 'text-blue-700' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Subscriptions</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">Apr 28, 2026 · {subs.length} active plans</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, Icon, bg, iconColor }, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
                <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={14} className={iconColor} />
                </div>
              </div>
              <p className="text-3xl font-black text-[#0d1f1a]">{value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-11 pr-5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f9fafb]">
              <tr>
                {['Company', 'Industry', 'Plan', 'Posts Available', 'Adjust Posts', 'Joined', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#f9fffe] transition-colors group">

                  {/* Company */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a]"
                        style={{ backgroundColor: sub.color }}
                      >
                        {sub.initials}
                      </div>
                      <p className="font-bold text-sm text-[#0d1f1a]">{sub.user}</p>
                    </div>
                  </td>

                  {/* Industry */}
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">{sub.industry}</td>

                  {/* Plan */}
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${planStyle(sub.type)}`}>
                      {sub.type}
                    </span>
                  </td>

                  {/* Posts Count */}
                  <td className="px-6 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-[#0d1f1a]">{sub.posts}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">posts</span>
                    </div>
                  </td>

                  {/* Adjust */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => adjust(sub.id, -1)}
                        className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 transition-colors"
                      >
                        <Minus size={12} strokeWidth={2.5} />
                      </button>
                      <span className="w-5 text-center text-sm font-black text-[#0d1f1a]">{sub.posts}</span>
                      <button
                        onClick={() => adjust(sub.id, 1)}
                        className="w-7 h-7 bg-[#0d1f1a] hover:bg-[#1a3a2e] rounded-lg flex items-center justify-center text-[#00ffa3] transition-colors"
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>

                  {/* Joined */}
                  <td className="px-6 py-4 text-xs font-bold text-gray-400">{sub.joined}</td>

                  {/* More */}
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

      </main>
    </div>
  );
}