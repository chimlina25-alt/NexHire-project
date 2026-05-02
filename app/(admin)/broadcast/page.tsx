"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Send, X, Globe, Bell, Radio,
  Users, Building2, Loader2, RefreshCw,
  CheckCircle2, Clock, MoreVertical, Pencil,
  Trash2, AlertTriangle, Check,
} from "lucide-react";
import AdminSidebar from "@/components/ui/AdminSidebar";

type BroadcastLog = {
  id: string;
  message: string;
  audience: string;
  sentCount: number;
  createdAt: string;
  updatedAt: string;
};

type AudienceCount = {
  all: number;
  employers: number;
  jobSeekers: number;
};

const audienceOptions = [
  {
    label: "All Users",
    icon: Globe,
    color: "text-[#0d1f1a]",
    bg: "bg-[#00ffa3]/15",
    countKey: "all" as keyof AudienceCount,
  },
  {
    label: "Job Seekers",
    icon: Users,
    color: "text-blue-700",
    bg: "bg-blue-50",
    countKey: "jobSeekers" as keyof AudienceCount,
  },
  {
    label: "Employers",
    icon: Building2,
    color: "text-purple-700",
    bg: "bg-purple-50",
    countKey: "employers" as keyof AudienceCount,
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function ActionMenu({
  log,
  onEdit,
  onDelete,
}: {
  log: BroadcastLog;
  onEdit: (log: BroadcastLog) => void;
  onDelete: (log: BroadcastLog) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`p-1.5 rounded-lg transition-all ${
          open
            ? "bg-gray-100 text-[#0d1f1a]"
            : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
        }`}
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              Broadcast Actions
            </p>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              onEdit(log);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#0d1f1a] hover:bg-[#f4f7f5] transition-colors"
          >
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Pencil size={13} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-[#0d1f1a]">Edit Message</p>
              <p className="text-[10px] text-gray-400">Update notification text</p>
            </div>
          </button>

          <div className="h-px bg-gray-100 mx-3" />

          <button
            onClick={() => {
              setOpen(false);
              onDelete(log);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
          >
            <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trash2 size={13} className="text-red-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Delete Broadcast</p>
              <p className="text-[10px] text-red-400">Remove from all users</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default function BroadcastPage() {
  const [logs, setLogs] = useState<BroadcastLog[]>([]);
  const [counts, setCounts] = useState<AudienceCount>({
    all: 0,
    employers: 0,
    jobSeekers: 0,
  });
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [showCompose, setShowCompose] = useState(false);
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("All Users");
  const [sending, setSending] = useState(false);

  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [editingLog, setEditingLog] = useState<BroadcastLog | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [deletingLog, setDeletingLog] = useState<BroadcastLog | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/broadcast");
      if (res.ok) setLogs(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoadingLogs(false);
  };

  const fetchCounts = async () => {
    try {
      const res = await fetch("/api/admin/broadcast/counts");
      if (res.ok) setCounts(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchCounts();
  }, []);

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), audience }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage("");
        setShowCompose(false);
        fetchLogs();
        showToast(`Sent to ${data.sent} recipients successfully!`);
      } else {
        showToast("Failed to send broadcast.", "error");
      }
    } catch (e) {
      showToast("Network error. Please try again.", "error");
    }
    setSending(false);
  };

  const handleOpenEdit = (log: BroadcastLog) => {
    setEditingLog(log);
    setEditMessage(log.message);
  };

  const handleSaveEdit = async () => {
    if (!editingLog || !editMessage.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/broadcast/${editingLog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: editMessage.trim() }),
      });
      if (res.ok) {
        setEditingLog(null);
        setEditMessage("");
        fetchLogs();
        showToast("Broadcast message updated successfully!");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to update.", "error");
      }
    } catch (e) {
      showToast("Network error. Please try again.", "error");
    }
    setSaving(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLog) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/broadcast/${deletingLog.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeletingLog(null);
        fetchLogs();
        showToast("Broadcast deleted and removed from all users.");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to delete.", "error");
      }
    } catch (e) {
      showToast("Network error. Please try again.", "error");
    }
    setDeleting(false);
  };

  const selectedAudienceCount = () => {
    const opt = audienceOptions.find((o) => o.label === audience);
    if (!opt) return 0;
    return counts[opt.countKey];
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Broadcast</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              · {logs.length} broadcasts sent
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchLogs(); fetchCounts(); }}
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-[#0d1f1a] hover:border-gray-300 transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => setShowCompose(true)}
              className="bg-[#0d1f1a] text-[#00ffa3] font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#1a3028] transition-colors shadow-sm"
            >
              <Radio size={16} /> New Broadcast
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-6 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-sm border ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            )}
            <p
              className={`text-sm font-bold ${
                toast.type === "success" ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {toast.text}
            </p>
          </div>
        )}

        {/* Audience Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {audienceOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <div
                  className={`w-10 h-10 ${opt.bg} rounded-xl flex items-center justify-center mb-3`}
                >
                  <Icon size={18} className={opt.color} />
                </div>
                <p className="text-xs font-bold text-gray-400 mb-1">
                  {opt.label}
                </p>
                <p className="text-2xl font-black text-[#0d1f1a]">
                  {counts[opt.countKey].toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-[#6b9e8a] mt-1">
                  registered users
                </p>
              </div>
            );
          })}
        </div>

        {/* Broadcast History */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-black text-[#0d1f1a]">Broadcast History</p>
          <span className="text-xs text-gray-400 font-medium">
            Last 50 broadcasts
          </span>
        </div>

        <div className="space-y-3">
          {loadingLogs ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
              <Loader2
                size={20}
                className="animate-spin text-[#6b9e8a] mx-auto"
              />
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-14 h-14 bg-[#f4f7f5] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell size={24} className="text-[#6b9e8a]" />
              </div>
              <p className="font-bold text-[#0d1f1a]">No broadcasts yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Click "New Broadcast" to send your first message.
              </p>
            </div>
          ) : (
            logs.map((b) => {
              const audOpt =
                audienceOptions.find((a) => a.label === b.audience) ||
                audienceOptions[0];
              const AudIcon = audOpt.icon;
              const wasEdited =
                b.updatedAt &&
                new Date(b.updatedAt).getTime() -
                  new Date(b.createdAt).getTime() >
                  1000;
              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-sm font-medium text-[#0d1f1a] leading-relaxed flex-1">
                      {b.message}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {timeAgo(b.createdAt)}
                      </span>
                      <ActionMenu
                        log={b}
                        onEdit={handleOpenEdit}
                        onDelete={(log) => setDeletingLog(log)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${audOpt.bg} ${audOpt.color}`}
                    >
                      <AudIcon size={10} />
                      {b.audience}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {b.sentCount.toLocaleString()} recipients
                    </span>
                    {wasEdited && (
                      <span className="text-[10px] text-amber-500 font-bold">
                        · edited
                      </span>
                    )}
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-black">
                      <CheckCircle2 size={11} />
                      Delivered
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── COMPOSE MODAL ── */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-[#0d1f1a]">
                    New Broadcast
                  </h2>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Appears in users' notification bell
                  </p>
                </div>
                <button
                  onClick={() => { setShowCompose(false); setMessage(""); }}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-5">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                  Send to
                </p>
                <div className="flex gap-2">
                  {audienceOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = audience === opt.label;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => setAudience(opt.label)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-xs font-bold ${
                          isSelected
                            ? "border-[#0d1f1a] bg-[#0d1f1a] text-[#00ffa3]"
                            : "border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <Icon size={16} />
                        {opt.label}
                        <span
                          className={`text-[9px] ${
                            isSelected ? "text-[#00ffa3]/70" : "text-gray-400"
                          }`}
                        >
                          {counts[opt.countKey].toLocaleString()} users
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-5 bg-[#f4f7f5] rounded-xl px-4 py-3 flex items-center gap-2">
                <Bell size={13} className="text-[#6b9e8a]" />
                <p className="text-xs font-bold text-[#0d1f1a]">
                  Will notify{" "}
                  <span className="text-[#00a36a]">
                    {selectedAudienceCount().toLocaleString()} users
                  </span>{" "}
                  via notification bell
                </p>
              </div>

              <div className="mb-6">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                  Message
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your broadcast message..."
                  rows={4}
                  className="w-full bg-[#f4f7f5] border-none rounded-2xl p-4 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30 text-[#0d1f1a] placeholder:text-gray-400"
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-[10px] text-gray-400">
                    Title: "Announcement from NexHire"
                  </p>
                  <p
                    className={`text-[11px] font-bold ${
                      message.length > 400 ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {message.length}/500
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCompose(false); setMessage(""); }}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold text-sm py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBroadcast}
                  disabled={!message.trim() || sending || message.length > 500}
                  className="flex-1 bg-[#0d1f1a] text-[#00ffa3] font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1a3028] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send to {selectedAudienceCount().toLocaleString()} users
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT MODAL ── */}
        {editingLog && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-black text-[#0d1f1a]">
                  Edit Broadcast
                </h2>
                <button
                  onClick={() => { setEditingLog(null); setEditMessage(""); }}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-6">
                Editing will update the notification for all{" "}
                {editingLog.sentCount.toLocaleString()} recipients.
              </p>

              <div className="mb-5">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                  Audience
                </p>
                {(() => {
                  const audOpt =
                    audienceOptions.find(
                      (a) => a.label === editingLog.audience
                    ) || audienceOptions[0];
                  const AudIcon = audOpt.icon;
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${audOpt.bg} ${audOpt.color}`}
                    >
                      <AudIcon size={12} />
                      {editingLog.audience} ·{" "}
                      {editingLog.sentCount.toLocaleString()} recipients
                    </span>
                  );
                })()}
              </div>

              <div className="mb-6">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                  Message
                </p>
                <textarea
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  rows={4}
                  autoFocus
                  className="w-full bg-[#f4f7f5] border-none rounded-2xl p-4 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30 text-[#0d1f1a] placeholder:text-gray-400"
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-[10px] text-gray-400">
                    Changes apply to all recipients' notifications
                  </p>
                  <p
                    className={`text-[11px] font-bold ${
                      editMessage.length > 400 ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {editMessage.length}/500
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setEditingLog(null); setEditMessage(""); }}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold text-sm py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={
                    !editMessage.trim() ||
                    saving ||
                    editMessage.trim() === editingLog.message ||
                    editMessage.length > 500
                  }
                  className="flex-1 bg-[#0d1f1a] text-[#00ffa3] font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1a3028] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM MODAL ── */}
        {deletingLog && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h2 className="text-xl font-black text-[#0d1f1a] mb-2">
                  Delete Broadcast?
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  This will permanently delete the broadcast and remove the
                  notification from all{" "}
                  <span className="font-bold text-[#0d1f1a]">
                    {deletingLog.sentCount.toLocaleString()} recipients
                  </span>
                  . This action cannot be undone.
                </p>
              </div>

              <div className="bg-[#f4f7f5] rounded-2xl p-4 mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Message to delete
                </p>
                <p className="text-sm font-medium text-[#0d1f1a] leading-relaxed line-clamp-3">
                  {deletingLog.message}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingLog(null)}
                  disabled={deleting}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold text-sm py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      Delete Broadcast
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}