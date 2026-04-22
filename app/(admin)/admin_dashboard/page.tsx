"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Building2, FileText, 
  CreditCard, Radio, MessageSquare, LogOut, 
  Briefcase, User 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define the type to strictly enforce that href must be a string
interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  href: string; // This ensures TypeScript warns you if href is missing
}

const AdminDashboard = () => {
  const pathname = usePathname();

  const salesData = [
    { day: 'APR 24', current: 20, previous: 15 },
    { day: 'APR 24', current: 25, previous: 18 },
    { day: 'APR 24', current: 18, previous: 22 },
    { day: 'APR 24', current: 30, previous: 20 },
    { day: 'APR 24', current: 22, previous: 25 },
    { day: 'APR 24', current: 28, previous: 15 },
    { day: 'APR 24', current: 24, previous: 19 },
    { day: 'APR 24', current: 15, previous: 12 },
    { day: 'APR 24', current: 26, previous: 21 },
  ];

  // FIX: Every object in this array MUST have a 'href' property
  const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin_dashboard' },
    { name: 'Manage Users', icon: <Users size={20} />, href: '/manage_user' },
    { name: 'Employers', icon: <Building2 size={20} />, href: '/admin_employers' },
    { name: 'Job Posts', icon: <FileText size={20} />, href: '/job_station' },
    { name: 'Subscription', icon: <CreditCard size={20} />, href: '/admin_subscription' },
    { name: 'Broadcast', icon: <Radio size={20} />, href: '/broadcast' },
    { name: 'Messages', icon: <MessageSquare size={20} />, href: '/admin_message' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#f1fcf9] border-r border-gray-100 flex flex-col p-8 fixed h-full">
        <div className="flex items-center gap-3 mb-12 ml-2">
          <div className="w-10 h-10  rounded-full flex items-center justify-center">
             <img src="/logo.png" alt="NexHire" />
          </div>
          <span className="text-2xl font-black text-[#153a30] tracking-tight">NexHire</span>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href} // Now guaranteed to be a string
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all ${
                  isActive 
                  ? 'bg-[#dcfce7] text-[#16a34a]' 
                  : 'text-[#153a30]/70 hover:bg-white hover:shadow-sm'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-[#dcfce7] p-4 rounded-2xl flex items-center gap-3 border border-green-100">
            <div className="w-10 h-10 bg-[#00ffa3] rounded-xl flex items-center justify-center font-black text-[#153a30]">A</div>
            <div>
              <p className="font-bold text-sm text-[#153a30]">Admin</p>
              <p className="text-[10px] text-gray-500 truncate">Admin67@example.com</p>
            </div>
          </div>
          <Link href="/log_in">
          <button className="w-full bg-[#ff4b4b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
            <LogOut size={20} />
            Sign Out
          </button>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-12 overflow-y-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-1">Dashboard Overview,</h1>
          <p className="text-gray-400 font-bold tracking-wide uppercase text-sm">Apr 28, 2026</p>
        </div>

        <div className="grid grid-cols-12 gap-8 mb-8">
          {/* STAT CARDS */}
          <div className="col-span-4 space-y-6">
            <div className="bg-[#153a30] rounded-[30px] p-8 text-white relative overflow-hidden shadow-xl shadow-[#153a30]/10">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-sm font-bold text-gray-300 mb-6">Total Users</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black tracking-tighter">5,189</span>
                    <span className="text-[#00ffa3] text-xs font-bold">+ 12% this week</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl"><User size={24} /></div>
              </div>
            </div>

            <div className="bg-[#153a30] rounded-[30px] p-8 text-white relative overflow-hidden shadow-xl shadow-[#153a30]/10">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-sm font-bold text-gray-300 mb-6">Active Job Posts</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black tracking-tighter">1,067</span>
                    <span className="text-[#00ffa3] text-xs font-bold">• Active</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl"><Briefcase size={24} /></div>
              </div>
            </div>
          </div>

          {/* JOB CATEGORIES */}
          <div className="col-span-8 bg-white rounded-[35px] border border-gray-100 shadow-sm p-10">
            <h3 className="text-xl font-extrabold text-[#1a1a1a] mb-8">Top Job Categories</h3>
            <div className="grid grid-cols-1 gap-6">
              {[
                { name: 'Plumber', val: '+ 12', color: 'bg-green-500' },
                { name: 'Maid', val: '+ 12', color: 'bg-emerald-400' },
                { name: 'Engineering', val: '+ 12', color: 'bg-teal-600' },
                { name: 'Financial Officer', val: '+ 12', color: 'bg-green-800' },
                { name: 'Cashier', val: '+ 12', color: 'bg-emerald-900' },
              ].map((cat, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                    <span className="font-bold text-gray-600 group-hover:text-[#153a30] transition-colors">{cat.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-gray-400">{cat.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* MAIN CHART */}
          <div className="col-span-10 bg-white rounded-[35px] border border-gray-100 shadow-sm p-10">
            <div className="flex justify-between items-center mb-10 text-center">
              <div className="w-full">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Overall Sales</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-black text-[#1a1a1a]">$ 12,677.00</span>
                  <span className="bg-[#00ffa3] text-[#153a30] text-[10px] font-black px-2 py-1 rounded-full">+ 67%</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#cbd5e1' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#cbd5e1' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="previous" fill="#99f6e4" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="current" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SALES HISTORY */}
          <div className="col-span-2 bg-white rounded-[35px] border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-black text-gray-400 uppercase mb-4 text-center tracking-tighter">Sales History</h3>
            <div className="space-y-4">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-none">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"><User size={12} /></div>
                    <span className="text-[8px] font-bold text-gray-600 truncate w-12">Apple Company</span>
                  </div>
                  <span className="text-[8px] font-black text-[#00ffa3]">+ $11.99</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;