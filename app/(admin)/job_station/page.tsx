"use client";
import React, { useState, useEffect } from 'react';
import { Search, Clock, Trash2, RotateCcw } from 'lucide-react';
import AdminSidebar from "@/components/ui/AdminSidebar";

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Tech': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'IT & Software': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'Food': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Finance': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Services': { bg: 'bg-teal-50', text: 'text-teal-700' },
  'Retail': { bg: 'bg-pink-50', text: 'text-pink-700' },
  'Construction': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  'Design': { bg: 'bg-rose-50', text: 'text-rose-700' },
  'Marketing': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700' },
  'Engineering': { bg: 'bg-cyan-50', text: 'text-cyan-700' },
};

export default function JobStation() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'active' | 'closed'>('active');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/jobs?category=${encodeURIComponent(activeCategory)}`);
    if (res.ok) setJobs(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, [activeCategory]);

  const handleDelete = async (jobId: string) => {
    setPendingId(jobId);
    await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' });
    setPendingId(null);
    fetchJobs();
  };

  const handleRestore = async (jobId: string) => {
    setPendingId(jobId);
    await fetch(`/api/admin/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    setPendingId(null);
    fetchJobs();
  };

  const categories = ['All', ...Array.from(new Set(jobs.map(j => j.category)))];

  const tabFiltered = jobs.filter(j =>
    tab === 'active' ? j.status === 'active' : j.status === 'closed'
  );

  const visible = tabFiltered.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    (j.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = jobs.filter(j => j.status === 'active').length;
  const closedCount = jobs.filter(j => j.status === 'closed').length;

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Job Station</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {activeCount} active posts
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Posts', value: jobs.length, color: 'bg-[#0d1f1a]', textColor: 'text-white', subColor: 'text-[#6b9e8a]' },
            { label: 'Active', value: activeCount, color: 'bg-white', textColor: 'text-[#0d1f1a]', subColor: 'text-emerald-600' },
            { label: 'Total Applicants', value: jobs.reduce((a: number, b: any) => a + b.applicants, 0), color: 'bg-white', textColor: 'text-[#0d1f1a]', subColor: 'text-[#6b9e8a]' },
            { label: 'Avg. Applicants', value: jobs.length > 0 ? Math.round(jobs.reduce((a: number, b: any) => a + b.applicants, 0) / jobs.length) : 0, color: 'bg-white', textColor: 'text-[#0d1f1a]', subColor: 'text-[#6b9e8a]' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl p-5 shadow-sm border border-black/5`}>
              <p className={`text-xs font-bold mb-2 opacity-50 ${s.textColor}`}>{s.label}</p>
              <p className={`text-2xl font-black ${s.textColor}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-5 border-b border-gray-50 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Tab switcher */}
              <div className="flex items-center bg-[#f4f7f5] rounded-xl p-1 gap-1">
                <button
                  onClick={() => setTab('active')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    tab === 'active'
                      ? 'bg-[#0d1f1a] text-[#00ffa3] shadow-sm'
                      : 'text-gray-500 hover:text-[#0d1f1a]'
                  }`}
                >
                  Active <span className="ml-1 opacity-60">({activeCount})</span>
                </button>
                <button
                  onClick={() => setTab('closed')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    tab === 'closed'
                      ? 'bg-[#0d1f1a] text-[#00ffa3] shadow-sm'
                      : 'text-gray-500 hover:text-[#0d1f1a]'
                  }`}
                >
                  Closed <span className="ml-1 opacity-60">({closedCount})</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-[#f4f7f5] border-none rounded-xl py-2.5 pl-11 pr-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30 w-56"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.slice(0, 8).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-[#0d1f1a] text-[#00ffa3]'
                      : (categoryColors[cat]
                          ? `${categoryColors[cat].bg} ${categoryColors[cat].text}`
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200')
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading jobs...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#f9fafb]">
                <tr>
                  {['Job Title', 'Company', 'Category', 'Type', 'Applicants', 'Status', 'Posted', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map((job) => {
                  const cat = categoryColors[job.category] || { bg: 'bg-gray-50', text: 'text-gray-500' };
                  const isPending = pendingId === job.id;
                  return (
                    <tr key={job.id} className="hover:bg-[#f9fffe] transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-black text-sm text-[#0d1f1a]">{job.title}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">{job.companyName || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
                          {job.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded-lg">
                          {job.employmentType?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#00ffa3] rounded-full"
                              style={{ width: `${Math.min((job.applicants / 100) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-[#0d1f1a]">{job.applicants}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock size={11} />
                          <span className="text-[11px] font-bold">
                            {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {tab === 'active' ? (
                            <button
                              onClick={() => handleDelete(job.id)}
                              disabled={isPending}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
                              title="Close job post"
                            >
                              {isPending ? (
                                <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestore(job.id)}
                              disabled={isPending}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-300 hover:text-emerald-600 transition-colors disabled:opacity-40"
                              title="Restore job post"
                            >
                              {isPending ? (
                                <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin inline-block" />
                              ) : (
                                <RotateCcw size={13} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">
                      {tab === 'active' ? 'No active job posts found.' : 'No closed job posts found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}