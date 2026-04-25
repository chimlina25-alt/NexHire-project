"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  MessageSquare,
  MoreVertical,
  Video,
} from "lucide-react";
import Link from "next/link";

type NotificationItem = {
  id: string;
  type: "Interview" | "Message" | "Application" | "System";
  title: string;
  description: string;
  time: string;
  actionText: string;
  read: boolean;
};

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const typeStyle: Record<
  NotificationItem["type"],
  { badge: string; iconBg: string; iconColor: string; button: string; icon: React.ElementType }
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

export default function NotificationsInterviews() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) return;

        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          type:
            item.type === "interview"
              ? "Interview"
              : item.type === "message"
                ? "Message"
                : item.type === "application"
                  ? "Application"
                  : "System",
          title: item.title,
          description: item.description,
          time: formatRelativeTime(item.createdAt),
          actionText:
            item.type === "message"
              ? "View Message"
              : item.type === "interview"
                ? "View Interview"
                : "Open",
          read: Boolean(item.readAt),
        }));

        setNotifications(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f4f3] pb-16 font-sans">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-[#051612] px-8 py-4 text-white shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="h-8 w-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <Link href="/home_page"><button className="text-gray-300 transition-colors hover:text-white">Home</button></Link>
          <Link href="/saved"><button className="text-gray-300 transition-colors hover:text-white">My Jobs</button></Link>
          <Link href="/message"><button className="text-gray-300 transition-colors hover:text-white">Messages</button></Link>
          <Link href="/notification"><button className="border-b-2 border-[#40b594] pb-1 text-[#40b594]">Notification</button></Link>
          <Link href="/setting"><button className="text-gray-300 transition-colors hover:text-white">Settings</button></Link>
        </nav>

        <Link href="/profile">
          <div className="group flex cursor-pointer items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">User Name</p>
              <p className="text-sm font-bold text-white transition-colors group-hover:text-[#40b594]">Profile</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d4f45] text-sm font-extrabold text-white">
              U
            </div>
          </div>
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-8 py-10">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#40b594]">Activity</p>
            <h1 className="text-4xl font-extrabold leading-tight text-[#071a15]">Notifications</h1>
            <p className="mt-1 font-medium text-[#4a5a55]">Keep track of your interview and message updates.</p>
          </div>

          <div className="mt-2 flex items-center gap-3">
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
                <Bell size={15} className="text-[#40b594]" />
                <span className="text-sm font-extrabold text-[#071a15]">{unreadCount} unread</span>
              </div>
            )}
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#071a15] shadow-sm transition-all hover:border-[#40b594] hover:text-[#40b594]"
            >
              <CheckCircle size={16} />
              Mark all read
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-sm text-[#6b7f79]">
            Loading notifications...
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const style = typeStyle[notification.type];
              const Icon = style.icon;

              return (
                <div
                  key={notification.id}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
                    notification.read
                      ? "border-gray-100"
                      : "border-l-4 border-b-gray-100 border-l-[#40b594] border-r-gray-100 border-t-gray-100"
                  } hover:border-l-[#40b594] hover:shadow-md`}
                >
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

                      <div className="flex items-center gap-2">
                        {!notification.read && <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#40b594]" />}
                        <button
                          type="button"
                          onClick={() => markOneRead(notification.id)}
                          className="rounded-lg p-1.5 text-[#6b7f79] transition-all hover:bg-[#f0f4f3] hover:text-[#071a15]"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="ml-1 pl-13">
                      <h3 className="mb-1 text-base font-extrabold leading-snug text-[#071a15]">
                        {notification.title}
                      </h3>
                      <p className="text-sm font-medium leading-relaxed text-[#4a5a55]">
                        {notification.description}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <button
                        type="button"
                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all ${style.button}`}
                      >
                        {notification.actionText}
                        <ArrowRight size={16} />
                      </button>

                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => markOneRead(notification.id)}
                          className="text-xs font-bold text-[#6b7f79] transition-colors hover:text-[#40b594]"
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

        {!loading && notifications.length === 0 && (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
              <Bell size={28} className="text-[#40b594]" />
            </div>
            <p className="text-lg font-extrabold text-[#071a15]">All caught up!</p>
            <p className="mt-1 text-sm text-[#4a5a55]">No new notifications right now.</p>
          </div>
        )}
      </main>
    </div>
  );
}
