"use client";

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CreditCard,
  Radio,
  MessageSquare,
  LogOut,
  User,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  href: string;
}

const salesData = [
  { day: "Mon", current: 20, previous: 15 },
  { day: "Tue", current: 25, previous: 18 },
  { day: "Wed", current: 18, previous: 22 },
  { day: "Thu", current: 30, previous: 20 },
  { day: "Fri", current: 22, previous: 25 },
  { day: "Sat", current: 28, previous: 15 },
  { day: "Sun", current: 24, previous: 19 },
];

const AdminDashboard = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeJobs: 0,
    totalApplications: 0,
  });

  const sidebarItems: SidebarItem[] = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin_dashboard" },
    { name: "Manage Users", icon: <Users size={20} />, href: "/manage_user" },
    { name: "Employers", icon: <Building2 size={20} />, href: "/admin_emplyer" },
    { name: "Job Posts", icon: <FileText size={20} />, href: "/job_station" },
    { name: "Subscription", icon: <CreditCard size={20} />, href: "/admin_subscription" },
    { name: "Broadcast", icon: <Radio size={20} />, href: "/broadcast" },
    { name: "Messages", icon: <MessageSquare size={20} />, href: "/admin_message" },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      <aside className="w-72 bg-[#f1fcf9] border-r border-gray-100 flex flex-col p-8 fixed h-full">
        <div className="flex items-center gap-3 mb-12 ml-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
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
                href={item.href}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all ${
                  isActive
                    ? "bg-[#dcfce7] text-[#16a34a]"
                    : "text-[#153a30]/70 hover:bg-white hover:shadow-sm"
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
            <div className="w-10 h-10 bg-[#00ffa3] rounded-xl flex items-center justify-center font-black text-[#153a30]">
              A
            </div>
            <div>
              <p className="font-bold text-sm text-[#153a30]">Admin</p>
              <p className="text-[10px] text-gray-500 truncate">admin@nexhire.com</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full bg-[#ff4b4b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-12 overflow-y-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-1">Dashboard Overview</h1>
          <p className="text-gray-400 font-bold tracking-wide uppercase text-sm">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8 mb-8">
          <div className="col-span-4 space-y-6">
            <div className="bg-[#153a30] rounded-[30px] p-8 text-white shadow-xl shadow-[#153a30]/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-300 mb-6">Total Users</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black tracking-tighter">
                      {stats.totalUsers.toLocaleString()}
                    </span>
                    <span className="text-[#00ffa3] text-xs font-bold">registered</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl">
                  <User size={24} />
                </div>
              </div>
            </div>

            <div className="bg-[#153a30] rounded-[30px] p-8 text-white shadow-xl shadow-[#153a30]/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-300 mb-6">Active Job Posts</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black tracking-tighter">
                      {stats.activeJobs.toLocaleString()}
                    </span>
                    <span className="text-[#00ffa3] text-xs font-bold">Active</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl">
                  <Briefcase size={24} />
                </div>
              </div>
            </div>

            <div className="bg-[#153a30] rounded-[30px] p-8 text-white shadow-xl shadow-[#153a30]/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-300 mb-6">Total Applications</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black tracking-tighter">
                      {stats.totalApplications.toLocaleString()}
                    </span>
                    <span className="text-[#00ffa3] text-xs font-bold">submitted</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl">
                  <FileText size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-8 bg-white rounded-[35px] border border-gray-100 shadow-sm p-10">
            <h3 className="text-xl font-extrabold text-[#1a1a1a] mb-8">Platform Activity</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#cbd5e1" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#cbd5e1" }}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="previous" fill="#99f6e4" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="current" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;