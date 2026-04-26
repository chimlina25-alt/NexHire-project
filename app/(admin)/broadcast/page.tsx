"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CreditCard,
  Radio,
  MessageSquare,
  LogOut,
  ListFilter,
  Send,
} from "lucide-react";

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  href: string;
}

type BroadcastItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

const BroadcastPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const sidebarItems: SidebarItem[] = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin_dashboard" },
    { name: "Manage Users", icon: <Users size={20} />, href: "/manage_user" },
    { name: "Employers", icon: <Building2 size={20} />, href: "/admin_emplyer" },
    { name: "Job Posts", icon: <FileText size={20} />, href: "/job_station" },
    { name: "Subscription", icon: <CreditCard size={20} />, href: "/admin_subscription" },
    { name: "Broadcast", icon: <Radio size={20} />, href: "/broadcast" },
    { name: "Messages", icon: <MessageSquare size={20} />, href: "/admin_message" },
  ];

  const load = async () => {
    try {
      const res = await fetch("/api/admin/broadcast", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleBroadcast = async () => {
    if (!form.title || !form.description) {
      alert("Please fill in title and description");
      return;
    }
    try {
      setSending(true);
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description }),
      });
      if (res.ok) {
        alert("Broadcast sent successfully");
        setForm({ title: "", description: "" });
        setShowModal(false);
        load();
      } else {
        alert("Failed to broadcast");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  function formatRelativeTime(dateString: string) {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

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

      <main className="flex-1 ml-72 p-12">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-1">Broadcast</h1>
            <p className="text-gray-400 font-bold tracking-wide text-sm">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#153a30] text-[#00ffa3] px-10 py-3 rounded-xl font-bold hover:bg-[#1a4a3d] transition-all shadow-md"
          >
            Broadcast
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading broadcasts...</div>
        ) : broadcasts.length === 0 ? (
          <div className="text-sm text-gray-500">No broadcasts yet.</div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {broadcasts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-6 border-b border-gray-100 last:border-none"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center font-black text-purple-600 text-xl">
                    A
                  </div>
                  <div>
                    <span className="font-bold text-[#1a1a1a] text-base block">{item.title}</span>
                    <span className="text-sm text-gray-500">{item.description}</span>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <span className="text-sm font-bold text-gray-300">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-extrabold text-[#1a1a1a]">Send Broadcast</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                x
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-[#1a1a1a] mb-2">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Broadcast title"
                  className="w-full rounded-xl border border-gray-200 bg-[#f8faf9] px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-[#1a1a1a] mb-2">Message</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Write your broadcast message..."
                  className="w-full rounded-xl border border-gray-200 bg-[#f8faf9] px-4 py-3 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBroadcast}
                disabled={sending}
                className="flex-1 bg-[#153a30] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Send size={16} />
                {sending ? "Sending..." : "Send to All Users"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 rounded-xl font-bold text-sm border border-gray-200 text-[#6b7f79] hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastPage;