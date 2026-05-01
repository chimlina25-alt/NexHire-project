"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Search, MapPin, Briefcase, Calendar,
  MoreVertical, Trash2, Shield, UserCheck,
  ArrowUpDown, ChevronDown,
} from "lucide-react";
import AdminSidebar from "@/components/ui/AdminSidebar";

const colorMap = ["#fff3e0", "#e8f5e9", "#e3f2fd", "#fce4ec", "#f3e5f5", "#e0f2f1"];

type Employer = {
  id: string;
  email: string;
  companyName: string;
  industry: string;
  currentAddress: string;
  jobs: number;
  plan: string;
  status: string;
  createdAt: string;
};

function ActionMenu({
  emp,
  onSuspend,
  onActivate,
  onDelete,
}: {
  emp: Employer;
  onSuspend: () => void;
  onActivate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`p-1.5 rounded-lg transition-all ${open ? "bg-gray-100 text-[#0d1f1a]" : "hover:bg-gray-100 text-gray-400"}`}
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Account Actions</p>
          </div>

          {emp.status === "Active" ? (
            <button
              onClick={() => { setOpen(false); onSuspend(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={14} className="text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Suspend Account</p>
                <p className="text-[10px] text-amber-500 font-medium">Disable employer access</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => { setOpen(false); onActivate(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserCheck size={14} className="text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Activate Account</p>
                <p className="text-[10px] text-emerald-500 font-medium">Restore employer access</p>
              </div>
            </button>
          )}

          <div className="h-px bg-gray-100 mx-3" />

          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
          >
            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trash2 size={14} className="text-red-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Delete Account</p>
              <p className="text-[10px] text-red-400 font-medium">Permanently remove employer</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

function SortDropdown({
  sortBy,
  onChange,
  options,
}: {
  sortBy: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 text-xs font-bold border rounded-xl px-4 py-3 transition-all bg-white shadow-sm ${
          open ? "border-[#00ffa3] text-[#0d1f1a]" : "border-gray-200 text-gray-500 hover:border-gray-300"
        }`}
      >
        <ArrowUpDown size={13} className="text-gray-400" />
        {sortBy}
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Sort by</p>
          </div>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                sortBy === opt ? "bg-[#f4f7f5] text-[#0d1f1a] font-black" : "text-gray-600 font-medium hover:bg-[#f9fffe] hover:text-[#0d1f1a]"
              }`}
            >
              {opt}
              {sortBy === opt && <div className="w-2 h-2 rounded-full bg-[#00ffa3]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminEmployers() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("Newest First");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sortOptions = ["Newest First", "Oldest First", "Name A–Z", "Name Z–A", "Most Jobs"];

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/employers?search=${encodeURIComponent(query)}`);
      if (res.ok) setEmployers(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEmployers(); }, []);

  const handleSuspend = async (id: string) => {
    setPendingId(id);
    await fetch(`/api/admin/employers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "suspended" }),
    });
    setPendingId(null);
    fetchEmployers();
  };

  const handleActivate = async (id: string) => {
    setPendingId(id);
    await fetch(`/api/admin/employers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    setPendingId(null);
    fetchEmployers();
  };

  const handleDelete = async (id: string) => {
    setPendingId(id);
    await fetch(`/api/admin/employers/${id}`, { method: "DELETE" });
    setPendingId(null);
    fetchEmployers();
  };

  const sortedVisible = [...employers]
    .filter((e) =>
      (e.companyName || "").toLowerCase().includes(query.toLowerCase()) ||
      e.email.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "Newest First") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "Oldest First") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "Name A–Z") return (a.companyName || "").localeCompare(b.companyName || "");
      if (sortBy === "Name Z–A") return (b.companyName || "").localeCompare(a.companyName || "");
      if (sortBy === "Most Jobs") return b.jobs - a.jobs;
      return 0;
    });

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Employers</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {employers.length} registered
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView("grid")} className={`p-2.5 rounded-xl border transition-all ${view === "grid" ? "bg-[#0d1f1a] border-[#0d1f1a] text-[#00ffa3]" : "bg-white border-gray-200 text-gray-400"}`}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
                <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
                <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
                <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
              </svg>
            </button>
            <button onClick={() => setView("list")} className={`p-2.5 rounded-xl border transition-all ${view === "list" ? "bg-[#0d1f1a] border-[#0d1f1a] text-[#00ffa3]" : "bg-white border-gray-200 text-gray-400"}`}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1" y="2" width="13" height="2" rx="1" fill="currentColor" />
                <rect x="1" y="6.5" width="13" height="2" rx="1" fill="currentColor" />
                <rect x="1" y="11" width="13" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input
              type="text"
              placeholder="Search employers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchEmployers()}
              className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-11 pr-5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30"
            />
          </div>
          <SortDropdown sortBy={sortBy} onChange={setSortBy} options={sortOptions} />
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400">Loading employers...</div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-3 gap-4">
            {sortedVisible.map((emp, i) => (
              <div key={emp.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible hover:shadow-md transition-shadow ${pendingId === emp.id ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="p-5 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-[#0d1f1a]" style={{ backgroundColor: colorMap[i % colorMap.length] }}>
                      {(emp.companyName || emp.email)[0]?.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${emp.plan === "Premium" ? "bg-[#0d1f1a] text-[#00ffa3]" : emp.plan === "Standard" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {emp.plan}
                      </span>
                      <ActionMenu
                        emp={emp}
                        onSuspend={() => handleSuspend(emp.id)}
                        onActivate={() => handleActivate(emp.id)}
                        onDelete={() => handleDelete(emp.id)}
                      />
                    </div>
                  </div>
                  <h3 className="font-black text-[#0d1f1a] text-base">{emp.companyName || "Unknown Company"}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{emp.industry || "No industry"}</p>
                </div>
                <div className="h-px bg-gray-50 mx-5" />
                <div className="px-5 py-4 grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1"><MapPin size={10} /></div>
                    <p className="text-[11px] font-bold text-[#0d1f1a] truncate">{emp.currentAddress || "N/A"}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1"><Briefcase size={10} /></div>
                    <p className="text-[11px] font-bold text-[#0d1f1a]">{emp.jobs} jobs</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1"><Calendar size={10} /></div>
                    <p className="text-[11px] font-bold text-[#0d1f1a] truncate">
                      {new Date(emp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className={`px-5 py-3 rounded-b-2xl flex items-center justify-between ${emp.status === "Active" ? "bg-emerald-50" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${emp.status === "Active" ? "bg-emerald-500" : "bg-gray-400"}`} />
                    <span className={`text-[10px] font-black ${emp.status === "Active" ? "text-emerald-700" : "text-gray-400"}`}>{emp.status}</span>
                  </div>
                </div>
              </div>
            ))}
            {sortedVisible.length === 0 && (
              <div className="col-span-3 py-12 text-center text-sm text-gray-400">No employers found.</div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
            <table className="w-full">
              <thead className="bg-[#f9fafb]">
                <tr>
                  {["Company", "Industry", "Job Posts", "Plan", "Status", "Joined", ""].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedVisible.map((emp, i) => (
                  <tr key={emp.id} className={`hover:bg-[#f9fffe] transition-colors ${pendingId === emp.id ? "opacity-50 pointer-events-none" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a]" style={{ backgroundColor: colorMap[i % colorMap.length] }}>
                          {(emp.companyName || emp.email)[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#0d1f1a]">{emp.companyName || "Unknown"}</p>
                          <p className="text-[10px] text-gray-400">{emp.currentAddress || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{emp.industry || "N/A"}</td>
                    <td className="px-6 py-4 text-xs font-bold text-[#0d1f1a]">{emp.jobs}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${emp.plan === "Premium" ? "bg-[#0d1f1a] text-[#00ffa3]" : emp.plan === "Standard" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {emp.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${emp.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "Active" ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">
                      {new Date(emp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <ActionMenu
                        emp={emp}
                        onSuspend={() => handleSuspend(emp.id)}
                        onActivate={() => handleActivate(emp.id)}
                        onDelete={() => handleDelete(emp.id)}
                      />
                    </td>
                  </tr>
                ))}
                {sortedVisible.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">No employers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}