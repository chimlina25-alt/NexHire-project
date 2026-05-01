"use client";
import React, { useEffect, useState } from "react";
import { Users, Building2, TrendingUp, ArrowUpRight, Briefcase } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import Link from "next/link";
import AdminSidebar from "@/components/ui/AdminSidebar";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const areaData = [
    { name: "W1", value: 4200 }, { name: "W2", value: 5800 },
    { name: "W3", value: 4900 }, { name: "W4", value: 7200 },
    { name: "W5", value: 6100 }, { name: "W6", value: 8500 },
    { name: "W7", value: 9200 }, { name: "W8", value: 11000 },
    { name: "W9", value: data?.revenue ? Math.round(data.revenue) : 0 },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f4f7f5]">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="text-[#6b9e8a] font-bold">Loading dashboard...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Dashboard Overview</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                month: "long", day: "numeric",
                year: "numeric", weekday: "long",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse" />
            <span className="text-xs font-bold text-[#0d1f1a]">Live</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Users", value: data?.totalUsers?.toLocaleString() ?? "0", delta: "+12%", icon: Users, bg: "bg-[#0d1f1a]", text: "text-white", accent: "text-[#00ffa3]" },
            { label: "Active Jobs", value: data?.activeJobs?.toLocaleString() ?? "0", delta: "• Live", icon: Briefcase, bg: "bg-[#00ffa3]", text: "text-[#0d1f1a]", accent: "text-[#0d1f1a]/60" },
            { label: "Employers", value: data?.employers?.toLocaleString() ?? "0", delta: "+5%", icon: Building2, bg: "bg-white", text: "text-[#0d1f1a]", accent: "text-[#6b9e8a]" },
            { label: "Revenue", value: `$${data?.revenue?.toFixed(2) ?? "0.00"}`, delta: "+67%", icon: TrendingUp, bg: "bg-white", text: "text-[#0d1f1a]", accent: "text-[#6b9e8a]" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`${stat.bg} rounded-2xl p-5 shadow-sm border border-black/5`}>
                <div className="flex justify-between items-start mb-4">
                  <p className={`text-xs font-bold opacity-60 ${stat.text}`}>{stat.label}</p>
                  <div className={`p-2 rounded-lg ${stat.bg === "bg-white" ? "bg-gray-50" : "bg-white/10"}`}>
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
          <div className="col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Revenue</p>
                <p className="text-3xl font-black text-[#0d1f1a] mt-1">
                  ${data?.revenue?.toFixed(2) ?? "0.00"}
                </p>
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
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#00ffa3" strokeWidth={2.5} fill="url(#colorVal)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-4 bg-[#0d1f1a] rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-[#6b9e8a] uppercase tracking-widest mb-1">Weekly Activity</p>
            <p className="text-white font-black text-lg mb-5">Job Posts</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.weeklyJobPosts ?? []} margin={{ left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#6b9e8a", fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#6b9e8a", fontWeight: 700 }} />
                  <Tooltip contentStyle={{ background: "#1a3028", border: "none", borderRadius: 10, color: "#fff", fontSize: 11 }} />
                  <Bar dataKey="previous" fill="#1e3d30" radius={[4, 4, 0, 0]} barSize={10} />
                  <Bar dataKey="current" fill="#00ffa3" radius={[4, 4, 0, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <p className="font-black text-[#0d1f1a]">Top Job Categories</p>
              <span className="text-xs text-[#6b9e8a] font-bold">This month</span>
            </div>
            <div className="space-y-4">
              {(data?.categoryBreakdown ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 font-medium py-4 text-center">No job categories yet.</p>
              ) : (
                (data?.categoryBreakdown ?? []).map((cat: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-bold text-[#0d1f1a]">{cat.name}</span>
                      <span className="text-xs font-black text-[#6b9e8a]">{cat.count} posts</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00ffa3] rounded-full transition-all" style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <p className="font-black text-[#0d1f1a]">Recent Subscriptions</p>
              <Link href="/admin_subscription" className="text-xs text-[#6b9e8a] font-bold hover:text-[#0d1f1a]">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {(data?.recentSubscriptions ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 font-medium py-4 text-center">No paid subscriptions yet.</p>
              ) : (
                (data?.recentSubscriptions ?? []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#f4f7f5] rounded-lg flex items-center justify-center text-[10px] font-black text-[#0d1f1a]">
                        {(item.name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0d1f1a]">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{item.plan}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#00a36a]">{item.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}