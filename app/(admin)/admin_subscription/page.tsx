"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Minus, Star, Zap, Users, Trash2,
  Clock, Check, X, MoreVertical, CheckCircle2, XCircle,
  CalendarDays, Ban,
} from "lucide-react";
import AdminSidebar from "@/components/ui/AdminSidebar";

// ─── Helpers ───────────────────────────────────────────────────────────────
const planStyle = (p: string) =>
  p === "premium"
    ? "bg-[#0d1f1a] text-[#00ffa3]"
    : p === "standard"
    ? "bg-amber-100 text-amber-800"
    : "bg-gray-100 text-gray-500";

const planLabel = (p: string) =>
  p === "premium" ? "Premium" : p === "standard" ? "Standard" : "Free";

const statusStyle = (s: string) =>
  s === "pending"
    ? "bg-amber-50 text-amber-600"
    : s === "approved"
    ? "bg-emerald-50 text-emerald-700"
    : s === "rejected"
    ? "bg-red-50 text-red-500"
    : "bg-gray-50 text-gray-400";

const statusDot = (s: string) =>
  s === "pending"
    ? "bg-amber-500"
    : s === "approved"
    ? "bg-emerald-500"
    : s === "rejected"
    ? "bg-red-500"
    : "bg-gray-400";

const colorMap = ["#fff3e0", "#e8f5e9", "#e3f2fd", "#fce4ec", "#f3e5f5", "#e0f2f1"];

const fmt = (d: string | Date, opts?: Intl.DateTimeFormatOptions) =>
  new Date(d).toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric", year: "numeric" });

const fmtTime = (d: string | Date) =>
  new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

// ─── Payment three-dot ─────────────────────────────────────────────────────
// pending  → Approve + Reject
// rejected → Approve Again + Reject Again
// approved → hidden (those are managed from Subscriptions tab via Cancel)
function PaymentActionMenu({
  payment,
  processing,
  onApprove,
  onReject,
}: {
  payment: any;
  processing: string | null;
  onApprove: (id: string) => void;
  onReject: (p: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("mousedown", h), 0);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", h); };
  }, [open]);

  if (payment.status === "approved") return null;

  const busy = processing === payment.id;
  const isRejected = payment.status === "rejected";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-150 ${
          open
            ? "border-[#0d1f1a] bg-[#0d1f1a] text-[#00ffa3]"
            : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-[#0d1f1a]"
        }`}
      >
        <MoreVertical size={14} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-[252px] bg-white rounded-2xl border border-gray-100 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.16),0_4px_12px_-2px_rgba(0,0,0,0.06)] overflow-hidden">

          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-[#0d1f1a] flex items-center justify-center text-[10px] font-black text-[#00ffa3] flex-shrink-0">
                  {(payment.companyName || "U")[0]?.toUpperCase()}
                </div>
                <p className="text-[11px] font-extrabold text-[#0d1f1a] truncate">{payment.companyName}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 ${statusStyle(payment.status)}`}>
                <span className={`w-1 h-1 rounded-full ${statusDot(payment.status)}`} />
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${planStyle(payment.plan)}`}>
                {planLabel(payment.plan)}
              </span>
              <span className="text-[9px] text-gray-300">·</span>
              <span className="text-[9px] font-bold text-[#0d1f1a]">${payment.amount}</span>
              <span className="text-[9px] text-gray-300">·</span>
              <span className="text-[9px] font-mono font-bold text-gray-400 truncate">{payment.transactionNumber}</span>
            </div>
          </div>

          {/* Rejection note */}
          {isRejected && payment.note && (
            <div className="mx-3 mt-2.5 px-3 py-2 bg-red-50 rounded-xl border border-red-100">
              <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-0.5">Rejection Reason</p>
              <p className="text-[10px] font-semibold text-red-600 leading-snug">"{payment.note}"</p>
            </div>
          )}

          {/* Actions */}
          <div className="p-2 space-y-0.5">
            <button
              onClick={() => { setOpen(false); onApprove(payment.id); }}
              disabled={busy}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-emerald-50 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center flex-shrink-0 transition-colors">
                {busy
                  ? <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  : <CheckCircle2 size={14} className="text-emerald-600" strokeWidth={2} />
                }
              </div>
              <div className="text-left flex-1">
                <p className="text-[12px] font-extrabold text-emerald-700 leading-none">
                  {isRejected ? "Approve Again" : "Approve"}
                </p>
                <p className="text-[9px] text-emerald-500 font-medium mt-0.5">
                  {isRejected ? "Override rejection & activate" : `Activate ${planLabel(payment.plan)} · $${payment.amount}/mo`}
                </p>
              </div>
            </button>

            <div className="mx-2 h-px bg-gray-100" />

            <button
              onClick={() => { setOpen(false); onReject(payment); }}
              disabled={busy}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="w-7 h-7 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <XCircle size={14} className="text-red-500" strokeWidth={2} />
              </div>
              <div className="text-left flex-1">
                <p className="text-[12px] font-extrabold text-red-600 leading-none">
                  {isRejected ? "Reject Again" : "Reject"}
                </p>
                <p className="text-[9px] text-red-400 font-medium mt-0.5">
                  {isRejected ? "Update reason & notify" : "Decline & notify employer"}
                </p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-[9px] text-gray-400 font-medium">
              Submitted <span className="font-bold text-gray-500">{fmt(payment.createdAt)}</span>
              {" · "}{fmtTime(payment.createdAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Subscription three-dot ────────────────────────────────────────────────
// paid plan → Cancel Plan (backend: downgrade + email + notification)
// free plan → hidden
function SubscriptionActionMenu({
  sub,
  processing,
  onCancel,
}: {
  sub: any;
  processing: string | null;
  onCancel: (sub: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("mousedown", h), 0);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", h); };
  }, [open]);

  if (sub.plan === "free") return null;

  const busy = processing === sub.employerId;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-150 ${
          open
            ? "border-[#0d1f1a] bg-[#0d1f1a] text-[#00ffa3]"
            : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-[#0d1f1a]"
        }`}
      >
        <MoreVertical size={14} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-[232px] bg-white rounded-2xl border border-gray-100 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.16),0_4px_12px_-2px_rgba(0,0,0,0.06)] overflow-hidden">

          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-[#0d1f1a] flex items-center justify-center text-[10px] font-black text-[#00ffa3] flex-shrink-0">
                {(sub.companyName || "U")[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-[#0d1f1a] truncate leading-none">{sub.companyName}</p>
                <p className="text-[9px] text-gray-400 font-medium mt-0.5 truncate">{sub.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${planStyle(sub.plan)}`}>
                {planLabel(sub.plan)}
              </span>
              <span className="text-[9px] text-gray-300">·</span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                Active
              </span>
            </div>
          </div>

          {/* Action */}
          <div className="p-2">
            <button
              onClick={() => { setOpen(false); onCancel(sub); }}
              disabled={busy}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="w-7 h-7 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center flex-shrink-0 transition-colors">
                {busy
                  ? <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  : <Ban size={13} className="text-red-500" strokeWidth={2} />
                }
              </div>
              <div className="text-left flex-1">
                <p className="text-[12px] font-extrabold text-red-600 leading-none">Cancel Plan</p>
                <p className="text-[9px] text-red-400 font-medium mt-0.5">Move to Free · email & notify</p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-[9px] text-gray-400 font-medium flex items-center gap-1">
              <CalendarDays size={9} />
              {sub.billingCycleEnd
                ? <>Expires <span className="font-bold text-gray-500 ml-0.5">{fmt(sub.billingCycleEnd)}</span></>
                : "No expiry set"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ManageSubscriptions() {
  const [tab, setTab] = useState<"payments" | "subscriptions">("payments");
  const [subs, setSubs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [query, setQuery] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [detailModal, setDetailModal] = useState<any>(null);
  const [cancelSubModal, setCancelSubModal] = useState<any>(null);

  const fetchSubs = async () => {
    setLoadingSubs(true);
    const r = await fetch("/api/admin/subscriptions");
    if (r.ok) setSubs(await r.json());
    setLoadingSubs(false);
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    const r = await fetch("/api/admin/payment");
    if (r.ok) setPayments(await r.json());
    setLoadingPayments(false);
  };

  useEffect(() => { fetchSubs(); fetchPayments(); }, []);

  // ── Stats — all from live data ──────────────────────────────────────────
  const pendingCount  = payments.filter(p => p.status === "pending").length;
  const totalSubs     = subs.filter(s => s.plan !== "free").length;
  const premiumCount  = subs.filter(s => s.plan === "premium").length;
  const standardCount = subs.filter(s => s.plan === "standard").length;

  // ── Approve ─────────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    setProcessing(id);
    await fetch(`/api/admin/payment/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    setProcessing(null);
    setDetailModal(null);
    // Refresh both tabs so stats and both tables update immediately
    await Promise.all([fetchPayments(), fetchSubs()]);
  };

  // ── Reject ──────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessing(rejectModal.id);
    await fetch(`/api/admin/payment/${rejectModal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", note: rejectNote }),
    });
    setProcessing(null);
    setRejectModal(null);
    setRejectNote("");
    setDetailModal(null);
    await Promise.all([fetchPayments(), fetchSubs()]);
  };

  // ── Cancel subscription ─────────────────────────────────────────────────
  // Backend must: set plan = "free", set payment status = "rejected",
  //               send cancellation email + in-app notification
  const handleCancelSub = async (employerId: string) => {
    setProcessing(employerId);
    await fetch(`/api/admin/payment/${employerId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sendEmail: true, sendNotification: true }),
    });
    setProcessing(null);
    setCancelSubModal(null);
    // After cancel: sub shows as Free, payment flips to "rejected"
    // → three-dot "Approve Again" appears on the Payments tab automatically
    await Promise.all([fetchSubs(), fetchPayments()]);
  };

  const adjust = async (id: string, delta: number, cur: number) => {
    const n = Math.max(0, cur + delta);
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts: n }),
    });
    setSubs(p => p.map(s => s.id === id ? { ...s, jobsPostedThisMonth: n } : s));
  };

  const visible = subs.filter(s =>
    (s.companyName || "").toLowerCase().includes(query.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(query.toLowerCase())
  );

  const stats = [
    { label: "Total Subscribers", value: totalSubs,     Icon: Users,  bg: "bg-emerald-50", color: "text-emerald-700", sub: "paid plans active"   },
    { label: "Premium Plans",     value: premiumCount,   Icon: Star,   bg: "bg-[#fff3e0]",  color: "text-amber-700",  sub: "premium tier"         },
    { label: "Standard Plans",    value: standardCount,  Icon: Zap,    bg: "bg-purple-50",  color: "text-purple-700", sub: "standard tier"        },
    { label: "Pending Payments",  value: pendingCount,   Icon: Clock,  bg: "bg-amber-50",   color: "text-amber-600",  sub: "awaiting review"      },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <AdminSidebar />

      {/* ── Detail Modal ── */}
      {detailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(5,22,18,0.72)", backdropFilter: "blur(3px)" }}
          onClick={() => setDetailModal(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#0d1f1a]">Payment Detail</h3>
                <p className="text-xs text-gray-400 mt-0.5">{detailModal.companyName}</p>
              </div>
              <button onClick={() => setDetailModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-[#0d1f1a] rounded-xl px-4 py-3 mb-4">
                <p className="text-[10px] font-bold text-[#6b9e8a] uppercase tracking-widest mb-1">Transaction Number</p>
                <p className="text-sm font-extrabold text-[#00ffa3] font-mono">{detailModal.transactionNumber}</p>
              </div>
              <div className="space-y-2.5 bg-[#f4f7f5] rounded-xl p-4 mb-5">
                {([
                  ["Company",   detailModal.companyName],
                  ["Email",     detailModal.email],
                  ["Plan",      planLabel(detailModal.plan)],
                  ["Amount",    `$${detailModal.amount}`],
                  ["Bank",      detailModal.bank?.toUpperCase()],
                  ["Status",    detailModal.status],
                  ["Submitted", `${fmt(detailModal.createdAt)} · ${fmtTime(detailModal.createdAt)}`],
                  ...(detailModal.approvedAt
                    ? [["Approved", `${fmt(detailModal.approvedAt)} · ${fmtTime(detailModal.approvedAt)}`]]
                    : []),
                  ...(detailModal.note ? [["Note", detailModal.note]] : []),
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-xs font-bold text-gray-400 flex-shrink-0">{k}</span>
                    <span className={`text-xs font-extrabold capitalize text-right ${
                      k === "Status"
                        ? detailModal.status === "approved" ? "text-emerald-600"
                        : detailModal.status === "pending"  ? "text-amber-600"
                        : "text-red-500"
                        : "text-[#0d1f1a]"
                    }`}>{v}</span>
                  </div>
                ))}
              </div>
              {detailModal.status !== "approved" ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(detailModal.id)}
                    disabled={processing === detailModal.id}
                    className="flex-1 py-3 bg-[#0d1f1a] hover:bg-[#1a3a2e] text-[#00ffa3] font-extrabold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 text-sm transition-colors"
                  >
                    {processing === detailModal.id
                      ? <div className="w-4 h-4 border-2 border-[#00ffa3] border-t-transparent rounded-full animate-spin" />
                      : <Check size={15} />}
                    {detailModal.status === "rejected" ? "Approve Again" : "Approve & Activate"}
                  </button>
                  <button
                    onClick={() => setRejectModal(detailModal)}
                    className="flex-1 py-3 border border-red-200 bg-red-50 text-red-600 font-extrabold rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <X size={15} />
                    {detailModal.status === "rejected" ? "Reject Again" : "Reject"}
                  </button>
                </div>
              ) : (
                <div className="text-center py-3 rounded-xl text-sm font-extrabold bg-emerald-50 text-emerald-700 flex items-center justify-center gap-2">
                  <CheckCircle2 size={15} />
                  Approved & Activated
                  {detailModal.approvedAt && (
                    <span className="text-[10px] font-medium text-emerald-500 ml-1">
                      {fmt(detailModal.approvedAt)} {fmtTime(detailModal.approvedAt)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(5,22,18,0.72)" }}
          onClick={() => setRejectModal(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-[#0d1f1a]">
                {rejectModal.status === "rejected" ? "Update Rejection" : "Reject Payment"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Txn: {rejectModal.transactionNumber}</p>
            </div>
            <div className="p-6">
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="Reason for rejection (optional)..."
                className="w-full rounded-xl border border-gray-200 bg-[#f4f7f5] px-4 py-3 text-sm font-medium text-[#0d1f1a] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none h-24 mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing === rejectModal.id}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-extrabold disabled:opacity-60 transition-colors"
                >
                  {processing === rejectModal.id ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Subscription Modal ── */}
      {cancelSubModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(5,22,18,0.72)" }}
          onClick={() => setCancelSubModal(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Ban size={20} className="text-red-500" />
            </div>
            <h3 className="text-lg font-extrabold text-[#0d1f1a] text-center mb-1.5">Cancel Subscription?</h3>
            <p className="text-sm font-medium text-gray-500 text-center mb-1.5">
              <span className="font-extrabold text-[#0d1f1a]">{cancelSubModal.companyName}</span> will be downgraded to Free immediately.
            </p>
            <p className="text-xs text-gray-400 text-center mb-6 leading-relaxed">
              An email and in-app notification will be sent.
              Their payment request will show <span className="font-bold text-gray-500">"Approve Again"</span> on the Payments tab.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelSubModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Keep Plan
              </button>
              <button
                onClick={() => handleCancelSub(cancelSubModal.employerId)}
                disabled={processing === cancelSubModal.employerId}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-extrabold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {processing === cancelSubModal.employerId
                  ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Cancelling...</>
                  : <><Ban size={14} /> Cancel & Notify</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 ml-64 p-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#0d1f1a]">Subscriptions</h1>
          <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* ── Stats cards (all live data) ── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, Icon, bg, color, sub: subLabel }, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
                <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={14} className={color} />
                </div>
              </div>
              <p className="text-3xl font-black text-[#0d1f1a]">{value}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-1">{subLabel}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab("payments")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
              tab === "payments"
                ? "bg-[#0d1f1a] text-[#00ffa3]"
                : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Clock size={14} />
            Payment Requests
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
          <button
            onClick={() => setTab("subscriptions")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
              tab === "subscriptions"
                ? "bg-[#0d1f1a] text-[#00ffa3]"
                : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Zap size={14} />
            Active Subscriptions
            {totalSubs > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{totalSubs}</span>
            )}
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════
            PAYMENT REQUESTS
            • pending  → View + three-dot (Approve / Reject)
            • rejected → View + three-dot (Approve Again / Reject Again)
            • approved → View only, no three-dot (manage from Subscriptions)
               Shows approved date + time in the Date column
        ════════════════════════════════════════════════════════════ */}
        {tab === "payments" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <p className="text-sm font-extrabold text-[#0d1f1a]">Payment Requests</p>
              <p className="text-xs font-bold text-gray-400">{payments.length} total · {pendingCount} pending</p>
            </div>

            {loadingPayments ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-[#00ffa3] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Loading...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center">
                <Clock size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">No payment requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f9fafb]">
                    <tr>
                      {["Company", "Transaction", "Plan", "Amount", "Bank", "Date", "Status", ""].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((p, i) => (
                      <tr key={p.id} className="hover:bg-[#f9fffe] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a] flex-shrink-0"
                              style={{ backgroundColor: colorMap[i % colorMap.length] }}
                            >
                              {(p.companyName || "U")[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#0d1f1a] whitespace-nowrap">{p.companyName}</p>
                              <p className="text-[10px] text-gray-400">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] font-extrabold text-[#0d1f1a] font-mono bg-gray-100 px-2 py-1 rounded-lg whitespace-nowrap">
                            {p.transactionNumber}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap ${planStyle(p.plan)}`}>
                            {planLabel(p.plan)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-extrabold text-[#0d1f1a] whitespace-nowrap">${p.amount}</td>
                        <td className="px-5 py-4 text-xs font-bold text-[#0d1f1a] uppercase whitespace-nowrap">{p.bank}</td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-gray-500 whitespace-nowrap">{fmt(p.createdAt)}</p>
                          <p className="text-[10px] text-gray-400">{fmtTime(p.createdAt)}</p>
                          {/* Approved date shown inline */}
                          {p.status === "approved" && p.approvedAt && (
                            <p className="text-[9px] text-emerald-600 font-bold mt-0.5 whitespace-nowrap flex items-center gap-0.5">
                              <Check size={8} strokeWidth={3} />
                              {fmt(p.approvedAt)} {fmtTime(p.approvedAt)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyle(p.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot(p.status)}`} />
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setDetailModal(p)}
                              className="px-3 py-1.5 rounded-lg bg-[#f4f7f5] hover:bg-[#e8f5f0] text-[#0d1f1a] text-[11px] font-bold transition-all whitespace-nowrap"
                            >
                              View
                            </button>
                            {/* Three-dot: pending/rejected only */}
                            <PaymentActionMenu
                              payment={p}
                              processing={processing}
                              onApprove={handleApprove}
                              onReject={p => setRejectModal(p)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            ACTIVE SUBSCRIPTIONS
            • free plan → no three-dot
            • paid plan → three-dot with Cancel Plan
            When cancelled: plan → free, payment → rejected
            → Payments tab three-dot shows "Approve Again" automatically
        ════════════════════════════════════════════════════════════ */}
        {tab === "subscriptions" && (
          <>
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Search subscribers..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-11 pr-5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f9fafb]">
                    <tr>
                      {["Company", "Plan", "Posts Used", "Started", "Expires", "Adjust", ""].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loadingSubs ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center">
                          <div className="w-6 h-6 border-2 border-[#00ffa3] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Loading...</p>
                        </td>
                      </tr>
                    ) : visible.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">No subscriptions found.</td>
                      </tr>
                    ) : visible.map((sub, i) => {
                      const daysLeft = sub.billingCycleEnd
                        ? Math.ceil((new Date(sub.billingCycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : null;
                      const expiringSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;
                      return (
                        <tr key={sub.id} className="hover:bg-[#f9fffe] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a] flex-shrink-0"
                                style={{ backgroundColor: colorMap[i % colorMap.length] }}
                              >
                                {(sub.companyName || "U")[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-[#0d1f1a] whitespace-nowrap">{sub.companyName || "Unknown"}</p>
                                <p className="text-[10px] text-gray-400">{sub.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap ${planStyle(sub.plan)}`}>
                              {planLabel(sub.plan)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-black text-[#0d1f1a]">{sub.jobsPostedThisMonth}</td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <p className="text-xs font-bold text-gray-400">
                              {sub.billingCycleStart ? fmt(sub.billingCycleStart) : "—"}
                            </p>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {sub.billingCycleEnd ? (
                              <>
                                <p className={`text-xs font-bold ${expiringSoon ? "text-amber-600" : "text-gray-400"}`}>
                                  {fmt(sub.billingCycleEnd)}
                                </p>
                                {daysLeft !== null && daysLeft >= 0 && (
                                  <p className={`text-[10px] font-bold ${expiringSoon ? "text-amber-500" : "text-gray-300"}`}>
                                    {daysLeft}d left
                                  </p>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => adjust(sub.id, -1, sub.jobsPostedThisMonth)}
                                className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 transition-colors"
                              >
                                <Minus size={12} strokeWidth={2.5} />
                              </button>
                              <span className="w-6 text-center text-sm font-black text-[#0d1f1a]">{sub.jobsPostedThisMonth}</span>
                              <button
                                onClick={() => adjust(sub.id, 1, sub.jobsPostedThisMonth)}
                                className="w-7 h-7 bg-[#0d1f1a] hover:bg-[#1a3a2e] rounded-lg flex items-center justify-center text-[#00ffa3] transition-colors"
                              >
                                <Plus size={12} strokeWidth={2.5} />
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {/* Three-dot: paid plans only */}
                            <SubscriptionActionMenu
                              sub={sub}
                              processing={processing}
                              onCancel={s => setCancelSubModal(s)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}