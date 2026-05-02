"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, Clock, MoreVertical, ArrowRight, Bell,
  User, Zap, Archive, RotateCcw, Trash2, InboxIcon,
} from 'lucide-react';
import Link from 'next/link';
import EmployerNavProfile from '@/components/ui/EmployerNavProfile';

type NotifItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  link: string | null;
  readAt: string | null;
  archivedAt: string | null;
  createdAt: string;
};

function mapItem(item: any): NotifItem {
  return {
    id: item.id,
    type: item.type ?? "system",
    title: item.title,
    description: item.description,
    link: item.link ?? null,
    readAt: item.readAt ?? null,
    archivedAt: item.archivedAt ?? null,
    createdAt: item.createdAt,
  };
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const typeStyle: Record<string, { badge: string; iconBg: string; iconColor: string }> = {
  application: { badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200', iconBg: 'bg-[#051612]', iconColor: 'text-[#40b594]' },
  system:      { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', iconBg: 'bg-[#40b594]', iconColor: 'text-[#051612]' },
  interview:   { badge: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200', iconBg: 'bg-purple-600', iconColor: 'text-white' },
  message:     { badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', iconBg: 'bg-amber-500', iconColor: 'text-white' },
};

const Notifications = () => {
  const [inbox, setInbox] = useState<NotifItem[]>([]);
  const [archived, setArchived] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"inbox" | "archived">("inbox");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = inbox.filter((n) => !n.readAt).length;

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [inboxRes, archiveRes] = await Promise.all([
          fetch("/api/notifications", { cache: "no-store" }),
          fetch("/api/notifications/archived", { cache: "no-store" }),
        ]);
        const inboxData = await inboxRes.json();
        const archiveData = await archiveRes.json();
        if (inboxRes.ok) setInbox(Array.isArray(inboxData) ? inboxData.map(mapItem) : []);
        if (archiveRes.ok) setArchived(Array.isArray(archiveData) ? archiveData.map(mapItem) : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setInbox((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  };

  const markOneRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setInbox((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    setMenuOpenId(null);
  };

  const archiveOne = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/archive`, { method: "POST" });
    if (res.ok) {
      const item = inbox.find((n) => n.id === id);
      if (item) {
        setInbox((prev) => prev.filter((n) => n.id !== id));
        setArchived((prev) => [{ ...item, archivedAt: new Date().toISOString() }, ...prev]);
      }
      setMenuOpenId(null);
    }
  };

  const restoreOne = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/archive`, { method: "DELETE" });
    if (res.ok) {
      const item = archived.find((n) => n.id === id);
      if (item) {
        setArchived((prev) => prev.filter((n) => n.id !== id));
        setInbox((prev) => [{ ...item, archivedAt: null }, ...prev]);
      }
      setMenuOpenId(null);
    }
  };

  const deleteOne = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    if (res.ok) {
      setInbox((prev) => prev.filter((n) => n.id !== id));
      setArchived((prev) => prev.filter((n) => n.id !== id));
      setMenuOpenId(null);
    }
  };

  const displayList = view === "inbox" ? inbox : archived;

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: '#f0f4f3' }}>
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="/dashboard"><button className="text-gray-300 hover:text-white transition-colors">Dashboard</button></Link>
          <Link href="/post_job"><button className="text-gray-300 hover:text-white transition-colors">Post Job</button></Link>
          <Link href="/employer_message"><button className="text-gray-300 hover:text-white transition-colors">Messages</button></Link>
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Notification</button>
          <Link href="/subscription"><button className="text-gray-300 hover:text-white transition-colors">Subscription</button></Link>
          <Link href="/employer_setting"><button className="text-gray-300 hover:text-white transition-colors">Settings</button></Link>
        </nav>
        <EmployerNavProfile />
      </header>

      <main className="max-w-3xl mx-auto px-6 md:px-10 py-10">
        {/* Page header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Activity</p>
            <h1 className="text-4xl font-extrabold text-[#071a15] leading-tight">Notifications</h1>
            <p className="text-[#4a5a55] font-medium mt-1">Keep track of your hiring activity</p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            {unreadCount > 0 && view === "inbox" && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                <Bell size={15} className="text-[#40b594]" />
                <span className="text-sm font-extrabold text-[#071a15]">{unreadCount} unread</span>
              </div>
            )}
            {view === "inbox" && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 bg-white border border-gray-200 text-[#071a15] px-4 py-2 rounded-xl font-bold text-sm hover:border-[#40b594] hover:text-[#40b594] transition-all shadow-sm"
              >
                <CheckCircle size={16} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white border border-gray-100 p-1 rounded-2xl w-fit shadow-sm">
          <button
            onClick={() => setView("inbox")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              view === "inbox" ? "bg-[#051612] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Bell size={15} />
            Inbox
            {unreadCount > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                view === "inbox" ? "bg-[#40b594] text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setView("archived")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              view === "archived" ? "bg-[#051612] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Archive size={15} />
            Archived
            {archived.length > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                view === "archived" ? "bg-[#40b594] text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {archived.length}
              </span>
            )}
          </button>
        </div>

        {loading && (
          <div className="text-center py-12 text-[#6b7f79]">Loading...</div>
        )}

        {/* Notification cards */}
        {!loading && (
          <div className="space-y-4" ref={containerRef}>
            {displayList.map((notif) => {
              const style = typeStyle[notif.type] ?? typeStyle["application"];
              const isMenuOpen = menuOpenId === notif.id;

              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden ${
                    view === "archived"
                      ? "border-gray-100 opacity-75"
                      : notif.readAt
                      ? "border-gray-100"
                      : "border-l-4 border-l-[#40b594] border-t-gray-100 border-r-gray-100 border-b-gray-100"
                  } hover:shadow-md`}
                >
                  <div className="p-7">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                          {notif.type === "application"
                            ? <User size={18} className={style.iconColor} />
                            : <Zap size={18} className={style.iconColor} />}
                        </div>
                        <div>
                          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${style.badge}`}>
                            {notif.type}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock size={12} className="text-[#6b7f79]" />
                            <span className="text-xs font-semibold text-[#6b7f79]">{timeAgo(notif.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* 3-dot menu */}
                      <div className="flex items-center gap-2 relative">
                        {!notif.readAt && view === "inbox" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#40b594] flex-shrink-0" />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : notif.id); }}
                          className="p-1.5 rounded-lg text-[#6b7f79] hover:bg-[#f0f4f3] hover:text-[#071a15] transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                            {view === "inbox" ? (
                              <>
                                {!notif.readAt && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); markOneRead(notif.id); }}
                                    className="w-full text-left px-4 py-3 text-sm font-bold text-[#071a15] hover:bg-[#f0f9f6] flex items-center gap-2"
                                  >
                                    <CheckCircle size={14} className="text-[#40b594]" /> Mark as read
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); archiveOne(notif.id); }}
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-[#6b7f79] hover:bg-[#f0f9f6] flex items-center gap-2 border-t border-gray-50"
                                >
                                  <Archive size={14} /> Archive
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteOne(notif.id); }}
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); restoreOne(notif.id); }}
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-[#40b594] hover:bg-[#f0f9f6] flex items-center gap-2"
                                >
                                  <RotateCcw size={14} /> Restore
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteOne(notif.id); }}
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-1">
                      <h3 className="text-base font-extrabold text-[#071a15] leading-snug mb-1">{notif.title}</h3>
                      <p className="text-sm text-[#4a5a55] font-medium leading-relaxed">{notif.description}</p>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      {notif.link && view === "inbox" && (
                        <Link href={notif.link}>
                          <button className="flex items-center gap-2 bg-[#051612] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all shadow-sm">
                            View <ArrowRight size={16} />
                          </button>
                        </Link>
                      )}
                      {!notif.readAt && view === "inbox" && (
                        <button
                          onClick={() => markOneRead(notif.id)}
                          className="text-xs font-bold text-[#6b7f79] hover:text-[#40b594] transition-colors ml-auto"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && displayList.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
              {view === "inbox"
                ? <Bell size={28} className="text-[#40b594]" />
                : <InboxIcon size={28} className="text-[#40b594]" />}
            </div>
            <p className="text-lg font-extrabold text-[#071a15]">
              {view === "inbox" ? "All caught up!" : "No archived notifications"}
            </p>
            <p className="text-sm text-[#4a5a55] mt-1">
              {view === "inbox" ? "No new notifications right now." : "Archived notifications will appear here."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;