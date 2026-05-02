"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  MessageSquare,
  MoreVertical,
  Video,
  Trash2,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  Archive,
  RotateCcw,
  InboxIcon,
} from "lucide-react";
import Link from "next/link";
import UserNavProfile from "@/components/ui/UserNavProfile";

type NotificationItem = {
  id: string;
  type: "Interview" | "Message" | "Application" | "System";
  title: string;
  description: string;
  time: string;
  actionText: string;
  read: boolean;
  archivedAt: string | null;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  interviewLink?: string;
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

function mapItem(item: any): NotificationItem {
  return {
    id: item.id,
    type:
      item.type === "interview" ? "Interview"
      : item.type === "message" ? "Message"
      : item.type === "application" ? "Application"
      : "System",
    title: item.title,
    description: item.description,
    time: formatRelativeTime(item.createdAt),
    actionText:
      item.type === "message" ? "View Message"
      : item.type === "interview" ? "View Interview"
      : "Open",
    read: Boolean(item.readAt),
    archivedAt: item.archivedAt ?? null,
    interviewDate: item.meta?.date,
    interviewTime: item.meta?.time,
    interviewLocation: item.meta?.location,
    interviewLink: item.meta?.link,
  };
}

const typeStyle: Record<
  NotificationItem["type"],
  {
    badge: string;
    iconBg: string;
    iconColor: string;
    button: string;
    icon: React.ElementType;
  }
> = {
  Interview: {
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    iconBg: "bg-[#051612]",
    iconColor: "text-[#40b594]",
    button: "bg-[#051612] hover:bg-[#0d2a23]",
    icon: Video,
  },
  Message: {
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    iconBg: "bg-[#e8eeff]",
    iconColor: "text-[#3553c7]",
    button: "bg-[#3553c7] hover:bg-[#2942a6]",
    icon: MessageSquare,
  },
  Application: {
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    iconBg: "bg-[#051612]",
    iconColor: "text-[#40b594]",
    button: "bg-[#051612] hover:bg-[#0d2a23]",
    icon: Bell,
  },
  System: {
    badge: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
    iconBg: "bg-[#051612]",
    iconColor: "text-[#40b594]",
    button: "bg-[#051612] hover:bg-[#0d2a23]",
    icon: Bell,
  },
};

// ── INTERVIEW MODAL ─────────────────────────────────────────────────────────────
function InterviewModal({ notification, onClose }: { notification: NotificationItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-[#f8faf9]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#051612] text-[#40b594]">
              <Video size={24} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#071a15]">Upcoming Interview</h2>
              <p className="text-sm text-[#6b7f79]">{notification.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f0f9f6] border border-[#d1e8e3]">
              <Calendar size={18} className="text-[#40b594] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6b7f79]">Date & Time</p>
                <p className="text-sm font-bold text-[#071a15]">
                  {notification.interviewDate || "Date not specified"}
                  {notification.interviewTime && <span className="ml-2 text-[#40b594]">at {notification.interviewTime}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f0f9f6] border border-[#d1e8e3]">
              <MapPin size={18} className="text-[#40b594] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6b7f79]">Location / Link</p>
                {notification.interviewLink ? (
                  <a href={notification.interviewLink} target="_blank" rel="noreferrer"
                    className="text-sm font-bold text-[#0a7e61] hover:underline flex items-center gap-1">
                    Join Meeting <ExternalLink size={12} />
                  </a>
                ) : (
                  <p className="text-sm font-bold text-[#071a15]">{notification.interviewLocation || "On-site"}</p>
                )}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#071a15] mb-2">Description</h3>
            <p className="text-sm text-[#4a5a55] leading-relaxed">{notification.description}</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-[#f8faf9] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#6b7f79] hover:bg-white transition-all">
            Close
          </button>
          {notification.interviewLink && (
            <a href={notification.interviewLink} target="_blank" rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#051612] text-white text-sm font-bold hover:bg-[#0d2a23] transition-all flex items-center gap-2">
              Join Now <Video size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── NOTIFICATION CARD ────────────────────────────────────────────────────────────
function NotificationCard({
  notification,
  isArchiveView,
  menuOpenId,
  setMenuOpenId,
  onMarkRead,
  onArchive,
  onRestore,
  onDelete,
  onAction,
}: {
  notification: NotificationItem;
  isArchiveView: boolean;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (n: NotificationItem) => void;
}) {
  const style = typeStyle[notification.type];
  const Icon = style.icon;
  const isMenuOpen = menuOpenId === notification.id;

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
      isArchiveView
        ? "border-gray-100 opacity-75"
        : notification.read
        ? "border-gray-100"
        : "border-l-4 border-b-gray-100 border-l-[#40b594] border-r-gray-100 border-t-gray-100"
    } hover:border-l-[#40b594] hover:shadow-md`}>
      <div className="p-7">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}>
              <Icon size={18} className={style.iconColor} />
            </div>
            <div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${style.badge}`}>
                {notification.type}
              </span>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Clock size={12} className="text-[#6b7f79]" />
                <span className="text-xs font-semibold text-[#6b7f79]">{notification.time}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            {!notification.read && !isArchiveView && (
              <span className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full bg-[#40b594]" />
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : notification.id); }}
              className="rounded-lg p-1.5 text-[#6b7f79] transition-all hover:bg-[#f0f4f3] hover:text-[#071a15]"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                {!isArchiveView ? (
                  <>
                    {!notification.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); setMenuOpenId(null); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-[#071a15] hover:bg-[#f0f9f6] flex items-center gap-2"
                      >
                        <CheckCircle size={14} className="text-[#40b594]" /> Mark as read
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onArchive(notification.id); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-[#6b7f79] hover:bg-[#f0f9f6] flex items-center gap-2 border-t border-gray-50"
                    >
                      <Archive size={14} /> Archive
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRestore(notification.id); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-[#40b594] hover:bg-[#f0f9f6] flex items-center gap-2"
                    >
                      <RotateCcw size={14} /> Restore
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
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
          <h3 className="mb-1 text-base font-extrabold leading-snug text-[#071a15]">{notification.title}</h3>
          <p className="text-sm font-medium leading-relaxed text-[#4a5a55]">{notification.description}</p>
        </div>

        {!isArchiveView && (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => onAction(notification)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all ${style.button}`}
            >
              {notification.actionText} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [inbox, setInbox] = useState<NotificationItem[]>([]);
  const [archived, setArchived] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"inbox" | "archived">("inbox");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<NotificationItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = inbox.filter((n) => !n.read).length;

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
        setLoading(true);
        setError(null);
        const [inboxRes, archiveRes] = await Promise.all([
          fetch("/api/notifications", { cache: "no-store" }),
          fetch("/api/notifications/archived", { cache: "no-store" }),
        ]);
        const inboxData = await inboxRes.json();
        const archiveData = await archiveRes.json();
        if (!inboxRes.ok) throw new Error(inboxData.error || "Failed to load");
        setInbox(Array.isArray(inboxData) ? inboxData.map(mapItem) : []);
        setArchived(Array.isArray(archiveData) ? archiveData.map(mapItem) : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setInbox((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setInbox((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
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

  const handleAction = (notification: NotificationItem) => {
    if (!notification.read) markOneRead(notification.id);
    if (notification.type === "Interview") setSelectedInterview(notification);
    else if (notification.type === "Message") window.location.href = "/message";
  };

  const displayList = view === "inbox" ? inbox : archived;

  return (
    <div className="min-h-screen bg-[#f0f4f3] pb-16 font-sans">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-[#051612] px-8 py-4 text-white shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="h-8 w-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <Link href="/home_page"><button className="text-gray-300 hover:text-white transition-colors">Home</button></Link>
          <Link href="/saved"><button className="text-gray-300 hover:text-white transition-colors">My Jobs</button></Link>
          <Link href="/message"><button className="text-gray-300 hover:text-white transition-colors">Messages</button></Link>
          <Link href="/notification"><button className="border-b-2 border-[#40b594] pb-1 text-[#40b594]">Notification</button></Link>
          <Link href="/setting"><button className="text-gray-300 hover:text-white transition-colors">Settings</button></Link>
        </nav>
        <UserNavProfile />
      </header>

      <main className="mx-auto max-w-4xl px-8 py-10">
        {/* Page header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#40b594]">Activity</p>
            <h1 className="text-4xl font-extrabold leading-tight text-[#071a15]">Notifications</h1>
            <p className="mt-1 font-medium text-[#4a5a55]">Keep track of your interview and message updates.</p>
          </div>
          <div className="mt-2 flex items-center gap-3">
            {unreadCount > 0 && view === "inbox" && (
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
                <Bell size={15} className="text-[#40b594]" />
                <span className="text-sm font-extrabold text-[#071a15]">{unreadCount} unread</span>
              </div>
            )}
            {view === "inbox" && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#071a15] shadow-sm hover:border-[#40b594] hover:text-[#40b594] transition-all"
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">{error}</div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-sm text-[#6b7f79]">
            Loading notifications...
          </div>
        ) : displayList.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
              {view === "inbox" ? <Bell size={28} className="text-[#40b594]" /> : <InboxIcon size={28} className="text-[#40b594]" />}
            </div>
            <p className="text-lg font-extrabold text-[#071a15]">
              {view === "inbox" ? "All caught up!" : "No archived notifications"}
            </p>
            <p className="mt-1 text-sm text-[#4a5a55]">
              {view === "inbox" ? "No new notifications right now." : "Archived notifications will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4" ref={containerRef}>
            {displayList.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isArchiveView={view === "archived"}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onMarkRead={markOneRead}
                onArchive={archiveOne}
                onRestore={restoreOne}
                onDelete={deleteOne}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </main>

      {selectedInterview && (
        <InterviewModal notification={selectedInterview} onClose={() => setSelectedInterview(null)} />
      )}
    </div>
  );
}