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
  Trash2,
  MapPin,
  Calendar,
  X,
  ExternalLink,
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
  // Optional metadata for interviews
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  interviewLink?: string;
};

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString),
    diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / (1000 * 60)),
    hours = Math.floor(diff / (1000 * 60 * 60)),
    days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
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

// ── INTERVIEW DETAIL MODAL ──────────────────────────────────────────────────────
function InterviewModal({
  notification,
  onClose,
}: {
  notification: NotificationItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-[#f8faf9]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#051612] text-[#40b594]">
              <Video size={24} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#071a15]">
                Upcoming Interview
              </h2>
              <p className="text-sm text-[#6b7f79]">{notification.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f0f9f6] border border-[#d1e8e3]">
              <Calendar size={18} className="text-[#40b594] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6b7f79]">
                  Date & Time
                </p>
                <p className="text-sm font-bold text-[#071a15]">
                  {notification.interviewDate || "Date not specified"}
                  {notification.interviewTime && (
                    <span className="ml-2 text-[#40b594]">
                      at {notification.interviewTime}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f0f9f6] border border-[#d1e8e3]">
              <MapPin size={18} className="text-[#40b594] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6b7f79]">
                  Location / Link
                </p>
                {notification.interviewLink ? (
                  <a
                    href={notification.interviewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold text-[#0a7e61] hover:underline flex items-center gap-1"
                  >
                    Join Meeting <ExternalLink size={12} />
                  </a>
                ) : (
                  <p className="text-sm font-bold text-[#071a15]">
                    {notification.interviewLocation || "On-site"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-[#071a15] mb-2">
              Description
            </h3>
            <p className="text-sm text-[#4a5a55] leading-relaxed">
              {notification.description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-[#f8faf9] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#6b7f79] hover:bg-white transition-all"
          >
            Close
          </button>
          {notification.interviewLink && (
            <a
              href={notification.interviewLink}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#051612] text-white text-sm font-bold hover:bg-[#0d2a23] transition-all flex items-center gap-2"
            >
              Join Now <Video size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsInterviews() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] =
    useState<NotificationItem | null>(null);

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/notifications", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load notifications");
        
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
          // Mocking some interview details if they exist in meta or specific fields
          interviewDate: item.meta?.date, 
          interviewTime: item.meta?.time,
          interviewLocation: item.meta?.location,
          interviewLink: item.meta?.link,
        }));
        setNotifications(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      alert("Failed to mark all read");
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
    } catch {
      alert("Failed to mark as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Assuming you have a DELETE route for notifications
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      setMenuOpenId(null);
    } catch (err) {
      console.error(err);
      alert("Could not delete notification");
    }
  };

  const handleActionClick = (notification: NotificationItem) => {
    if (!notification.read) {
      markOneRead(notification.id);
    }

    if (notification.type === "Interview") {
      setSelectedInterview(notification);
    } else if (notification.type === "Message") {
      window.location.href = "/message"; // Or specific conversation logic
    } else {
      // Default behavior for others
      console.log("Action for:", notification.type);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    if (menuOpenId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [menuOpenId]);

  return (
    <div className="min-h-screen bg-[#f0f4f3] pb-16 font-sans">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-[#051612] px-8 py-4 text-white shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="h-8 w-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <Link href="/home_page">
            <button className="text-gray-300 transition-colors hover:text-white">
              Home
            </button>
          </Link>
          <Link href="/saved">
            <button className="text-gray-300 transition-colors hover:text-white">
              My Jobs
            </button>
          </Link>
          <Link href="/message">
            <button className="text-gray-300 transition-colors hover:text-white">
              Messages
            </button>
          </Link>
          <Link href="/notification">
            <button className="border-b-2 border-[#40b594] pb-1 text-[#40b594]">
              Notification
            </button>
          </Link>
          <Link href="/setting">
            <button className="text-gray-300 transition-colors hover:text-white">
              Settings
            </button>
          </Link>
        </nav>
        <UserNavProfile />
      </header>

      <main className="mx-auto max-w-4xl px-8 py-10">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#40b594]">
              Activity
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-[#071a15]">
              Notifications
            </h1>
            <p className="mt-1 font-medium text-[#4a5a55]">
              Keep track of your interview and message updates.
            </p>
          </div>
          <div className="mt-2 flex items-center gap-3">
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
                <Bell size={15} className="text-[#40b594]" />
                <span className="text-sm font-extrabold text-[#071a15]">
                  {unreadCount} unread
                </span>
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-sm text-[#6b7f79]">
            Loading notifications...
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const style = typeStyle[notification.type];
              const Icon = style.icon;
              const isMenuOpen = menuOpenId === notification.id;

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
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}
                        >
                          <Icon size={18} className={style.iconColor} />
                        </div>
                        <div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${style.badge}`}
                          >
                            {notification.type}
                          </span>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <Clock size={12} className="text-[#6b7f79]" />
                            <span className="text-xs font-semibold text-[#6b7f79]">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        {!notification.read && (
                          <span className="absolute -left-4 top-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#40b594]" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(isMenuOpen ? null : notification.id);
                          }}
                          className="rounded-lg p-1.5 text-[#6b7f79] transition-all hover:bg-[#f0f4f3] hover:text-[#071a15]"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markOneRead(notification.id);
                                  setMenuOpenId(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-[#071a15] hover:bg-[#f0f9f6] flex items-center gap-2"
                              >
                                <CheckCircle size={14} className="text-[#40b594]" />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
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
                        onClick={() => handleActionClick(notification)}
                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all ${style.button}`}
                      >
                        {notification.actionText}
                        <ArrowRight size={16} />
                      </button>
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
            <p className="text-lg font-extrabold text-[#071a15]">
              All caught up!
            </p>
            <p className="mt-1 text-sm text-[#4a5a55]">
              No new notifications right now.
            </p>
          </div>
        )}
      </main>

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <InterviewModal
          notification={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
}