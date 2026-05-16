"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Bell, CheckCircle, Clock, MoreVertical,
  Trash2, Archive, RotateCcw, InboxIcon,
  CreditCard, Check, X, CheckCheck,
} from "lucide-react";
import AdminSidebar from "@/components/ui/AdminSidebar";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  link: string | null;
  meta: Record<string, string> | null;
  archivedAt: string | null;
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
    title: item.title,
    description: item.description || "",
    time: formatRelativeTime(item.createdAt),
    read: Boolean(item.readAt),
    link: item.link ?? null,
    meta: item.meta ?? null,
    archivedAt: item.archivedAt ?? null,
  };
}

function getIconStyle(title: string, meta: Record<string, string> | null) {
  if (meta?.action === "subscription_approved" || title.includes("Approved") || title.includes("Activated")) {
    return { bg: "bg-emerald-50", color: "text-emerald-600", Icon: Check };
  }
  if (meta?.action === "new_payment_request" || title.includes("Payment")) {
    return { bg: "bg-amber-50", color: "text-amber-600", Icon: CreditCard };
  }
  if (title.includes("Cancelled") || title.includes("Rejected") || title.includes("Expired")) {
    return { bg: "bg-red-50", color: "text-red-500", Icon: X };
  }
  return { bg: "bg-[#f4f7f5]", color: "text-[#6b9e8a]", Icon: Bell };
}

function NotificationCard({
  notification,
  isArchiveView,
  menuOpenId,
  setMenuOpenId,
  onMarkRead,
  onArchive,
  onRestore,
  onDelete,
}: {
  notification: NotificationItem;
  isArchiveView: boolean;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isMenuOpen = menuOpenId === notification.id;
  const { bg, color, Icon } = getIconStyle(notification.title, notification.meta);

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
      isArchiveView ? "border-gray-100 opacity-75" :
      notification.read ? "border-gray-100" :
      "border-l-4 border-l-[#00ffa3] border-r-gray-100 border-t-gray-100 border-b-gray-100"
    }`}>
      <div className="p-7">
        {/* Top row */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Clock size={11} className="text-[#6b9e8a]" />
                <span className="text-xs font-semibold text-[#6b9e8a]">{notification.time}</span>
                {!notification.read && !isArchiveView && (
                  <span className="w-2 h-2 rounded-full bg-[#00ffa3] inline-block ml-1" />
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : notification.id); }}
              className="rounded-lg p-1.5 text-[#6b9e8a] hover:bg-[#f4f7f5] hover:text-[#0d1f1a] transition-all"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                {!isArchiveView ? (
                  <>
                    {!notification.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); setMenuOpenId(null); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-[#0d1f1a] hover:bg-[#f4f7f5] flex items-center gap-2"
                      >
                        <CheckCircle size={14} className="text-[#00ffa3]" /> Mark as read
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onArchive(notification.id); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-[#6b9e8a] hover:bg-[#f4f7f5] flex items-center gap-2 border-t border-gray-50"
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
                      className="w-full text-left px-4 py-3 text-sm font-bold text-[#00ffa3] hover:bg-[#f4f7f5] flex items-center gap-2"
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

        {/* Content */}
        <div className="ml-1">
          <h3 className="mb-1 text-base font-extrabold leading-snug text-[#0d1f1a]">
            {notification.title}
          </h3>
          <p className="text-sm font-medium leading-relaxed text-[#4a6b5a]">
            {notification.description}
          </p>

          {/* Transaction number */}
          {notification.meta?.transactionNumber && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-[#0d1f1a] px-2.5 py-1 rounded-lg">
              <span className="text-[10px] font-bold text-[#6b9e8a]">TXN:</span>
              <span className="text-[10px] font-extrabold text-[#00ffa3] font-mono">
                {notification.meta.transactionNumber}
              </span>
            </div>
          )}

          {/* Action button */}
          {!isArchiveView && notification.link && (
            <div className="mt-5">
              <a href={notification.link}>
                <button
                  onClick={() => !notification.read && onMarkRead(notification.id)}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-[#0d1f1a] bg-[#00ffa3] hover:bg-[#00e691] shadow-sm transition-all"
                >
                  {notification.meta?.action === "new_payment_request" ? "Review Payment" :
                   notification.meta?.action === "employer_cancelled" ? "View Subscriptions" :
                   "View"}
                </button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminNotificationsPage() {
  const [inbox, setInbox] = useState<NotificationItem[]>([]);
  const [archived, setArchived] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"inbox" | "archived">("inbox");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = inbox.filter(n => !n.read).length;

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
      setLoading(true);
      try {
        const res = await fetch("/api/admin/my-notifications", { cache: "no-store" });
        const data = await res.json();
        const all = Array.isArray(data) ? data.map(mapItem) : [];
        setInbox(all.filter(n => !n.archivedAt));
        setArchived(all.filter(n => n.archivedAt));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const markAllRead = async () => {
    const unread = inbox.filter(n => !n.read);
    for (const n of unread) {
      await fetch("/api/admin/my-notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });
    }
    setInbox(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = async (id: string) => {
    await fetch("/api/admin/my-notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setInbox(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const archiveOne = (id: string) => {
    const item = inbox.find(n => n.id === id);
    if (item) {
      setInbox(prev => prev.filter(n => n.id !== id));
      setArchived(prev => [{ ...item, archivedAt: new Date().toISOString() }, ...prev]);
    }
    setMenuOpenId(null);
  };

  const restoreOne = (id: string) => {
    const item = archived.find(n => n.id === id);
    if (item) {
      setArchived(prev => prev.filter(n => n.id !== id));
      setInbox(prev => [{ ...item, archivedAt: null }, ...prev]);
    }
    setMenuOpenId(null);
  };

  const deleteOne = (id: string) => {
    setInbox(prev => prev.filter(n => n.id !== id));
    setArchived(prev => prev.filter(n => n.id !== id));
    setMenuOpenId(null);
  };

  const displayList = view === "inbox" ? inbox : archived;

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Notifications</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && view === "inbox" && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0d1f1a] text-[#00ffa3] text-sm font-extrabold rounded-xl hover:bg-[#1a3a2e] transition-all"
            >
              <CheckCheck size={15} /> Mark All Read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 w-fit rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
          <button
            onClick={() => setView("inbox")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              view === "inbox" ? "bg-[#0d1f1a] text-[#00ffa3] shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Bell size={15} />
            Inbox
            {unreadCount > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                view === "inbox" ? "bg-[#00ffa3] text-[#0d1f1a]" : "bg-gray-200 text-gray-600"
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setView("archived")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              view === "archived" ? "bg-[#0d1f1a] text-[#00ffa3] shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Archive size={15} />
            Archived
            {archived.length > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                view === "archived" ? "bg-[#00ffa3] text-[#0d1f1a]" : "bg-gray-200 text-gray-600"
              }`}>
                {archived.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-sm text-[#6b9e8a]">
            Loading notifications...
          </div>
        ) : displayList.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
              {view === "inbox" ? <Bell size={28} className="text-[#6b9e8a]" /> : <InboxIcon size={28} className="text-[#6b9e8a]" />}
            </div>
            <p className="text-lg font-extrabold text-[#0d1f1a]">
              {view === "inbox" ? "All caught up!" : "No archived notifications"}
            </p>
            <p className="mt-1 text-sm text-[#6b9e8a]">
              {view === "inbox" ? "Payment requests and system alerts will appear here." : "Archived notifications will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4" ref={containerRef}>
            {displayList.map(notification => (
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
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}