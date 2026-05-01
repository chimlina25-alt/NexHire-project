"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Search, MoreHorizontal, ChevronDown,
  UserCheck, Shield, Trash2, ArrowUpDown,
} from "lucide-react";
import AdminSidebar from "@/components/ui/AdminSidebar";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Inactive: { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" },
  Suspended: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

type User = {
  id: string;
  name: string;
  email: string;
  status: string;
  applications: number;
  createdAt: string;
};

function ActionMenu({
  user,
  onSuspend,
  onActivate,
  onDelete,
}: {
  user: User;
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
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Account Actions</p>
          </div>

          {user.status === "Active" || user.status === "Inactive" ? (
            <button
              onClick={() => { setOpen(false); onSuspend(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={14} className="text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Suspend Account</p>
                <p className="text-[10px] text-amber-500 font-medium">Disable user access</p>
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
                <p className="text-[10px] text-emerald-500 font-medium">Restore user access</p>
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
              <p className="text-[10px] text-red-400 font-medium">Permanently remove user</p>
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
        className={`flex items-center gap-2 text-xs font-bold border rounded-xl px-4 py-2.5 transition-all bg-white ${
          open ? "border-[#00ffa3] text-[#0d1f1a] shadow-sm" : "border-gray-200 text-gray-500 hover:border-gray-300"
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

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest First");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sortOptions = ["Newest First", "Oldest First", "Name A–Z", "Name Z–A", "Most Applications"];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(search)}&filter=${filter}`
      );
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleSuspend = async (userId: string) => {
    setPendingId(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "suspended" }),
    });
    setPendingId(null);
    fetchUsers();
  };

  const handleActivate = async (userId: string) => {
    setPendingId(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    setPendingId(null);
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    setPendingId(userId);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setPendingId(null);
    fetchUsers();
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === "Newest First") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "Oldest First") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "Name A–Z") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "Name Z–A") return (b.name || "").localeCompare(a.name || "");
    if (sortBy === "Most Applications") return b.applications - a.applications;
    return 0;
  });

  const counts = {
    All: users.length,
    Active: users.filter((u) => u.status === "Active").length,
    Inactive: users.filter((u) => u.status !== "Active").length,
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Manage Users</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {Object.entries(counts).map(([key, count]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  filter === key
                    ? "bg-[#0d1f1a] text-[#00ffa3]"
                    : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                }`}
              >
                {key} <span className="opacity-60">({count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Users", value: users.length.toLocaleString(), sub: "Job seekers", dark: true },
            { label: "Active Users", value: users.filter((u) => u.status === "Active").length.toLocaleString(), sub: `${Math.round((users.filter((u) => u.status === "Active").length / Math.max(users.length, 1)) * 100)}% of total`, dark: false },
            { label: "New This Month", value: users.filter((u) => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length.toLocaleString(), sub: "Last 30 days", dark: false },
          ].map((c, i) => (
            <div key={i} className={`${c.dark ? "bg-[#0d1f1a]" : "bg-white border border-gray-100"} rounded-2xl p-5 shadow-sm`}>
              <p className={`text-xs font-bold mb-3 ${c.dark ? "text-[#6b9e8a]" : "text-gray-400"}`}>{c.label}</p>
              <p className={`text-2xl font-black ${c.dark ? "text-white" : "text-[#0d1f1a]"}`}>{c.value}</p>
              <p className={`text-xs font-bold mt-1 ${c.dark ? "text-[#00ffa3]" : "text-[#6b9e8a]"}`}>{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#f4f7f5] border-none rounded-xl py-2.5 pl-11 pr-5 text-sm font-medium w-72 focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30"
              />
            </form>
            <SortDropdown sortBy={sortBy} onChange={setSortBy} options={sortOptions} />
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading users...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#f9fafb] text-left">
                  {["User", "Status", "Applications", "Joined", ""].map((h) => (
                    <th key={h} className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">No users found.</td>
                  </tr>
                ) : (
                  sortedUsers.map((user) => {
                    const s = statusConfig[user.status] || statusConfig.Inactive;
                    const isPending = pendingId === user.id;
                    return (
                      <tr key={user.id} className={`hover:bg-[#f9fffe] transition-colors ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-[#0d1f1a] bg-[#e8f5e9]">
                              {(user.name || user.email)[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#0d1f1a]">{user.name || "Unknown"}</p>
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
                              <div className="h-full bg-[#00ffa3] rounded-full" style={{ width: `${Math.min((user.applications / 20) * 100, 100)}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-500">{user.applications}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4">
                          <ActionMenu
                            user={user}
                            onSuspend={() => handleSuspend(user.id)}
                            onActivate={() => handleActivate(user.id)}
                            onDelete={() => handleDelete(user.id)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}