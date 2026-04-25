"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  MoreVertical,
  ArrowRight,
  Bell,
  User,
  Zap,
  Send,
} from "lucide-react";
import Link from "next/link";

type NotificationItem = {
  id: string;
  type: "Applicant" | "NexHire" | "Interview" | "Application" | "System";
  title: string;
  description: string;
  time: string;
  actionText: string;
  read: boolean;
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const normalizeType = (type: string): NotificationItem["type"] => {
  if (type === "application") return "Application";
  if (type === "interview") return "Interview";
  if (type === "system") return "System";
  if (type === "message") return "Applicant";
  return "NexHire";
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    applicationId: "",
    type: "application",
    title: "",
    description: "",
    link: "/notification",
  });

  const [sending, setSending] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/notifications", { cache: "no-store" });
      const text = await res.text();

      let data: any = [];
      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        console.error("Invalid notifications response:", text);
        setNotifications([]);
        return;
      }

      if (res.status === 401) {
        setNotifications([]);
        return;
      }

      if (!res.ok) {
        console.error(data.error || "Failed to fetch notifications");
        setNotifications([]);
        return;
      }

      const mapped: NotificationItem[] = (data || []).map((notif: any) => ({
        id: notif.id,
        type: normalizeType(notif.type),
        title: notif.title,
        description: notif.description,
        time: formatRelativeTime(notif.createdAt),
        actionText:
          notif.type === "interview"
            ? "View Interview"
            : notif.type === "application"
              ? "View Application"
              : "Open",
        read: Boolean(notif.readAt),
      }));

      setNotifications(mapped);
    } catch (error) {
      console.error("FETCH NOTIFICATIONS ERROR:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const sendEmployerNotification = async () => {
    if (!form.applicationId.trim() || !form.title.trim() || !form.description.trim()) {
      alert("Please fill application ID, title, and description");
      return;
    }

    try {
      setSending(true);

      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: form.applicationId,
          type: form.type,
          title: form.title,
          description: form.description,
          link: form.link,
        }),
      });

      const text = await res.text();

      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        console.error("Invalid send notification response:", text);
        alert("Server returned invalid response");
        return;
      }

      if (!res.ok) {
        alert(data?.error || "Failed to send notification");
        return;
      }

      alert("Notification sent successfully");

      setForm({
        applicationId: "",
        type: "application",
        title: "",
        description: "",
        link: "/notification",
      });

      fetchNotifications();
    } catch (error) {
      console.error("SEND NOTIFICATION ERROR:", error);
      alert("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const typeStyle: Record<
    NotificationItem["type"],
    { badge: string; iconBg: string; iconColor: string; icon: React.ElementType }
  > = {
    Applicant: {
      badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
      iconBg: "bg-[#051612]",
      iconColor: "text-[#40b594]",
      icon: User,
    },
    NexHire: {
      badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      iconBg: "bg-[#40b594]",
      iconColor: "text-[#051612]",
      icon: Zap,
    },
    Interview: {
      badge: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
      iconBg: "bg-[#051612]",
      iconColor: "text-[#40b594]",
      icon: Bell,
    },
    Application: {
      badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      iconBg: "bg-[#051612]",
      iconColor: "text-[#40b594]",
      icon: User,
    },
    System: {
      badge: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
      iconBg: "bg-[#40b594]",
      iconColor: "text-[#051612]",
      icon: Zap,
    },
  };

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: "#f0f4f3" }}>
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="/dashboard">
            <button className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </button>
          </Link>
          <Link href="/post_job">
            <button className="text-gray-300 hover:text-white transition-colors">
              Post Job
            </button>
          </Link>
          <Link href="/employer_message">
            <button className="text-gray-300 hover:text-white transition-colors">
              Messages
            </button>
          </Link>
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">
            Notification
          </button>
          <Link href="/subscription">
            <button className="text-gray-300 hover:text-white transition-colors">
              Subscription
            </button>
          </Link>
          <Link href="/employer_setting">
            <button className="text-gray-300 hover:text-white transition-colors">
              Settings
            </button>
          </Link>
        </nav>

        <Link href="/employer_profile">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Company
              </p>
              <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors">
                Profile
              </p>
            </div>
            <div className="w-10 h-10 bg-[#40b594] rounded-full flex items-center justify-center font-extrabold text-[#051612] text-sm">
              C
            </div>
          </div>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">
              Activity
            </p>
            <h1 className="text-4xl font-extrabold text-[#071a15] leading-tight">
              Notifications
            </h1>
            <p className="text-[#4a5a55] font-medium mt-1">
              Keep track of your hiring activity
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                <Bell size={15} className="text-[#40b594]" />
                <span className="text-sm font-extrabold text-[#071a15]">
                  {unreadCount} unread
                </span>
              </div>
            )}
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 bg-white border border-gray-200 text-[#071a15] px-4 py-2 rounded-xl font-bold text-sm hover:border-[#40b594] hover:text-[#40b594] transition-all shadow-sm"
            >
              <CheckCircle size={16} />
              Mark all read
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-extrabold text-[#071a15]">
                Send Notification To Job Seeker
              </h2>
              <p className="text-sm text-[#6b7f79] mt-1">
                Use application ID to send accept, reject, or interview notice.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#f0f9f6] flex items-center justify-center border border-[#d1e8e3]">
              <Send size={18} className="text-[#40b594]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#071a15] mb-2">
                Application ID
              </label>
              <input
                type="text"
                value={form.applicationId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, applicationId: e.target.value }))
                }
                placeholder="Enter application ID"
                className="w-full rounded-xl border border-gray-200 bg-[#f8faf9] px-4 py-3 text-sm text-[#071a15] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#071a15] mb-2">
                Notification Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-[#f8faf9] px-4 py-3 text-sm text-[#071a15] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594]"
              >
                <option value="application">Application</option>
                <option value="interview">Interview</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#071a15] mb-2">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Example: Your application has been accepted"
                className="w-full rounded-xl border border-gray-200 bg-[#f8faf9] px-4 py-3 text-sm text-[#071a15] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#071a15] mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Write the message for the candidate"
                className="w-full rounded-xl border border-gray-200 bg-[#f8faf9] px-4 py-3 text-sm text-[#071a15] resize-none focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594]"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={sendEmployerNotification}
              disabled={sending}
              className="flex items-center gap-2 bg-[#051612] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all shadow-sm disabled:opacity-60"
            >
              <Send size={16} />
              {sending ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-[#6b7f79] font-medium shadow-sm">
              Loading notifications...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => {
              const style = typeStyle[notif.type];
              const Icon = style.icon;

              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden ${
                    notif.read
                      ? "border-gray-100"
                      : "border-l-4 border-l-[#40b594] border-t-gray-100 border-r-gray-100 border-b-gray-100"
                  } hover:shadow-md hover:border-l-[#40b594]`}
                >
                  <div className="p-7">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon size={18} className={style.iconColor} />
                        </div>

                        <div>
                          <span
                            className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${style.badge}`}
                          >
                            {notif.type}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock size={12} className="text-[#6b7f79]" />
                            <span className="text-xs font-semibold text-[#6b7f79]">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notif.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#40b594] flex-shrink-0" />
                        )}
                        <button
                          onClick={() => markOneRead(notif.id)}
                          className="p-1.5 rounded-lg text-[#6b7f79] hover:bg-[#f0f4f3] hover:text-[#071a15] transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="pl-13 ml-1">
                      <h3 className="text-base font-extrabold text-[#071a15] leading-snug mb-1">
                        {notif.title}
                      </h3>
                      <p className="text-sm text-[#4a5a55] font-medium leading-relaxed">
                        {notif.description}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <button className="flex items-center gap-2 bg-[#051612] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all shadow-sm">
                        {notif.actionText}
                        <ArrowRight size={16} />
                      </button>

                      {!notif.read && (
                        <button
                          onClick={() => markOneRead(notif.id)}
                          className="text-xs font-bold text-[#6b7f79] hover:text-[#40b594] transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                <Bell size={28} className="text-[#40b594]" />
              </div>
              <p className="text-lg font-extrabold text-[#071a15]">All caught up!</p>
              <p className="text-sm text-[#4a5a55] mt-1">
                No new notifications right now.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
