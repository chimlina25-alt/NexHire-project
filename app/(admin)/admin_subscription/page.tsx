"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Radio, MessageSquare, LogOut,
  Search, Plus, Minus, Star, Zap, TrendingUp, MoreVertical, Trash2
} from 'lucide-react';
import AdminSidebar from "@/components/ui/AdminSidebar";



const planStyle = (type: string) => {
  if (type === 'premium') return 'bg-[#0d1f1a] text-[#00ffa3]';
  if (type === 'standard') return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-500';
};

const planLabel = (type: string) => {
  if (type === 'premium') return 'Premium';
  if (type === 'standard') return 'Standard';
  return 'Free';
};

const colorMap = ['#fff3e0', '#e8f5e9', '#e3f2fd', '#fce4ec', '#f3e5f5', '#e0f2f1'];

export default function ManageSubscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchSubs = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/subscriptions');
    if (res.ok) setSubs(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, []);

  const adjust = async (id: string, delta: number, currentPosts: number) => {
    const newPosts = Math.max(0, currentPosts + delta);
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posts: newPosts }),
    });
    setSubs(prev => prev.map(s => s.id === id ? { ...s, jobsPostedThisMonth: newPosts } : s));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Cancel this subscription? The employer will be moved to the Free plan.')) return;
    await fetch(`/api/admin/subscriptions/${id}`, { method: 'DELETE' });
    fetchSubs();
  };

  const visible = subs.filter(s =>
    (s.companyName || '').toLowerCase().includes(query.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(query.toLowerCase())
  );

  const stats = [
    { label: 'Total Subscribers', value: subs.filter(s => s.plan !== 'free').length, Icon: Users, bg: 'bg-emerald-50', iconColor: 'text-emerald-700' },
    { label: 'Premium Plans', value: subs.filter(s => s.plan === 'premium').length, Icon: Star, bg: 'bg-[#fff3e0]', iconColor: 'text-amber-700' },
    { label: 'Standard Plans', value: subs.filter(s => s.plan === 'standard').length, Icon: Zap, bg: 'bg-purple-50', iconColor: 'text-purple-700' },
    { label: 'Total Posts Used', value: subs.reduce((a, s) => a + s.jobsPostedThisMonth, 0), Icon: TrendingUp, bg: 'bg-blue-50', iconColor: 'text-blue-700' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Subscriptions</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {subs.filter(s => s.plan !== 'free').length} active plans</p>
          </div>
        </div>

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

        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input type="text" placeholder="Search subscribers..." value={query} onChange={e => setQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-11 pr-5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f9fafb]">
              <tr>
                {['Company', 'Industry', 'Plan', 'Posts Used', 'Adjust Posts', 'Started', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">Loading subscriptions...</td></tr>
              ) : visible.map((sub, i) => (
                <tr key={sub.id} className="hover:bg-[#f9fffe] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a]" style={{ backgroundColor: colorMap[i % colorMap.length] }}>
                        {(sub.companyName || sub.email || 'U')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#0d1f1a]">{sub.companyName || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-400">{sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">{sub.industry || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${planStyle(sub.plan)}`}>{planLabel(sub.plan)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-[#0d1f1a]">{sub.jobsPostedThisMonth}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">posts</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => adjust(sub.id, -1, sub.jobsPostedThisMonth)} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 transition-colors">
                        <Minus size={12} strokeWidth={2.5} />
                      </button>
                      <span className="w-5 text-center text-sm font-black text-[#0d1f1a]">{sub.jobsPostedThisMonth}</span>
                      <button onClick={() => adjust(sub.id, 1, sub.jobsPostedThisMonth)} className="w-7 h-7 bg-[#0d1f1a] hover:bg-[#1a3a2e] rounded-lg flex items-center justify-center text-[#00ffa3] transition-colors">
                        <Plus size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-400">{new Date(sub.billingCycleStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    {sub.plan !== 'free' && (
                      <button onClick={() => handleDelete(sub.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && visible.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">No subscriptions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}