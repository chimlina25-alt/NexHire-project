"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Minus, Star, Zap, Users, Trash2,
  Clock, Check, X, MoreVertical,
} from "lucide-react";
import AdminSidebar from "@/components/ui/AdminSidebar";

const planStyle = (p: string) => p === "premium" ? "bg-[#0d1f1a] text-[#00ffa3]" : p === "standard" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500";
const planLabel = (p: string) => p === "premium" ? "Premium" : p === "standard" ? "Standard" : "Free";
const statusStyle = (s: string) => s === "pending" ? "bg-amber-50 text-amber-600" : s === "approved" ? "bg-emerald-50 text-emerald-700" : s === "rejected" ? "bg-red-50 text-red-500" : s === "cancelled" ? "bg-gray-50 text-gray-500" : "bg-gray-50 text-gray-400";
const statusDot = (s: string) => s === "pending" ? "bg-amber-500" : s === "approved" ? "bg-emerald-500" : s === "rejected" ? "bg-red-500" : "bg-gray-400";
const colorMap = ["#fff3e0", "#e8f5e9", "#e3f2fd", "#fce4ec", "#f3e5f5", "#e0f2f1"];

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
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, [open]);

  // Only hide for approved
  if (payment.status === "approved") return null;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className={`p-1.5 rounded-lg transition-all ${open ? "bg-gray-100 text-[#0d1f1a]" : "hover:bg-gray-100 text-gray-400"}`}
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onApprove(payment.id); }}
            disabled={processing === payment.id}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-60"
          >
            <Check size={14} className="text-emerald-600" />
            {payment.status === "rejected" || payment.status === "cancelled" ? "Approve" : "Approve"}
          </button>
          <div className="h-px bg-gray-100 mx-2" />
          <button
            onClick={() => { setOpen(false); onReject(payment); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <X size={14} className="text-red-500" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

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

  // ++ FIXED stats — count all paid subs regardless of expiry
  const paidSubs = subs.filter(s => s.plan !== "free");
  const pendingCount = payments.filter(p => p.status === "pending").length;

  const stats = [
    { label: "Total Subscribers", value: paidSubs.length, Icon: Users, bg: "bg-emerald-50", color: "text-emerald-700" },
    { label: "Premium Plans", value: paidSubs.filter(s => s.plan === "premium").length, Icon: Star, bg: "bg-[#fff3e0]", color: "text-amber-700" },
    { label: "Standard Plans", value: paidSubs.filter(s => s.plan === "standard").length, Icon: Zap, bg: "bg-purple-50", color: "text-purple-700" },
    { label: "Pending Payments", value: pendingCount, Icon: Clock, bg: "bg-amber-50", color: "text-amber-600" },
  ];

  const handleApprove = async (id: string) => {
    setProcessing(id);
    await fetch(`/api/admin/payment/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    setProcessing(null);
    setDetailModal(null);
    fetchPayments();
    fetchSubs();
  };

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
    fetchPayments();
  };

  // ++ FIXED — cancel sub also marks latest approved payment as cancelled
  const handleCancelSub = async (employerId: string) => {
    setProcessing(employerId);
    await fetch(`/api/admin/payment/${employerId}`, { method: "DELETE" });
    setProcessing(null);
    setCancelSubModal(null);
    fetchPayments();
    fetchSubs();
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

  const visible = subs
    .filter(s => s.plan !== "free")
    .filter(s =>
      (s.companyName || "").toLowerCase().includes(query.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <AdminSidebar />

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(5,22,18,0.7)", backdropFilter: "blur(2px)" }} onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#0d1f1a]">Payment Detail</h3>
                <p className="text-xs text-gray-400 mt-0.5">{detailModal.companyName}</p>
              </div>
              <button onClick={() => setDetailModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-6">
              <div className="bg-[#0d1f1a] rounded-xl px-4 py-3 mb-4">
                <p className="text-[10px] font-bold text-[#6b9e8a] uppercase tracking-widest mb-1">Transaction Number</p>
                <p className="text-sm font-extrabold text-[#00ffa3] font-mono">{detailModal.transactionNumber}</p>
              </div>
              <div className="space-y-2.5 bg-[#f4f7f5] rounded-xl p-4 mb-5">
                {[
                  ["Company", detailModal.companyName],
                  ["Email", detailModal.email],
                  ["Plan", detailModal.plan],
                  ["Amount", `$${detailModal.amount}`],
                  ["Bank", detailModal.bank?.toUpperCase()],
                  ["Status", detailModal.status],
                  ["Submitted", new Date(detailModal.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })],
                  ...(detailModal.approvedAt ? [["Approved", new Date(detailModal.approvedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })]] : []),
                  ...(detailModal.note ? [["Note", detailModal.note]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-xs font-bold text-gray-400">{k}</span>
                    <span className={`text-xs font-extrabold capitalize ${k === "Status" ? (detailModal.status === "approved" ? "text-emerald-600" : detailModal.status === "pending" ? "text-amber-600" : detailModal.status === "cancelled" ? "text-gray-500" : "text-red-500") : "text-[#0d1f1a]"}`}>{v}</span>
                  </div>
                ))}
              </div>
              {detailModal.status !== "approved" ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(detailModal.id)}
                    disabled={processing === detailModal.id}
                    className="flex-1 py-3 bg-[#0d1f1a] hover:bg-[#1a3a2e] text-[#00ffa3] font-extrabold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                  >
                    {processing === detailModal.id ? <div className="w-4 h-4 border-2 border-[#00ffa3] border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectModal(detailModal)}
                    className="flex-1 py-3 border border-red-200 bg-red-50 text-red-600 font-extrabold rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 text-sm"
                  >
                    <X size={15} /> Reject
                  </button>
                </div>
              ) : (
                <div className="text-center py-3 rounded-xl text-sm font-extrabold bg-emerald-50 text-emerald-700">
                  ✓ Approved & Activated
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(5,22,18,0.7)" }} onClick={() => setRejectModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-[#0d1f1a]">Reject Payment</h3>
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
                <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                <button
                  onClick={handleReject}
                  disabled={processing === rejectModal.id}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-extrabold disabled:opacity-60"
                >
                  {processing === rejectModal.id ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Sub Modal */}
      {cancelSubModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(5,22,18,0.7)" }} onClick={() => setCancelSubModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="text-lg font-extrabold text-[#0d1f1a] text-center mb-2">Cancel Subscription?</h3>
            <p className="text-sm font-medium text-gray-500 text-center mb-1">{cancelSubModal.companyName}</p>
            <p className="text-xs text-gray-400 text-center mb-6">Will be moved to Free plan immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelSubModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50">Keep Plan</button>
              <button
                onClick={() => handleCancelSub(cancelSubModal.employerId)}
                disabled={processing === cancelSubModal.employerId}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-extrabold disabled:opacity-60"
              >
                {processing === cancelSubModal.employerId ? "Cancelling..." : "Cancel Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#0d1f1a]">Subscriptions</h1>
          <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, Icon, bg, color }, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
                <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={14} className={color} />
                </div>
              </div>
              <p className="text-3xl font-black text-[#0d1f1a]">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab("payments")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all ${tab === "payments" ? "bg-[#0d1f1a] text-[#00ffa3]" : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"}`}
          >
            <Clock size={14} /> Payment Requests
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
          <button
            onClick={() => setTab("subscriptions")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all ${tab === "subscriptions" ? "bg-[#0d1f1a] text-[#00ffa3]" : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"}`}
          >
            <Zap size={14} /> Active Subscriptions
          </button>
        </div>

        {/* Payment Requests Tab */}
        {tab === "payments" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <p className="text-sm font-extrabold text-[#0d1f1a]">Payment Requests</p>
              <p className="text-xs font-bold text-gray-400">{payments.length} total · {pendingCount} pending</p>
            </div>
            {loadingPayments ? (
              <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center">
                <Clock size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">No payment requests yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#f9fafb]">
                  <tr>
                    {["Company", "Transaction", "Plan", "Amount", "Bank", "Date", "Status", ""].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p, i) => (
                    <tr key={p.id} className="hover:bg-[#f9fffe] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a]" style={{ backgroundColor: colorMap[i % colorMap.length] }}>
                            {(p.companyName || "U")[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#0d1f1a]">{p.companyName}</p>
                            <p className="text-[10px] text-gray-400">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] font-extrabold text-[#0d1f1a] font-mono bg-gray-100 px-2 py-1 rounded-lg">{p.transactionNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${planStyle(p.plan)}`}>{planLabel(p.plan)}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-extrabold text-[#0d1f1a]">${p.amount}</td>
                      <td className="px-5 py-4 text-xs font-bold text-[#0d1f1a] uppercase">{p.bank}</td>
                      <td className="px-5 py-4 text-xs font-bold text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        <br />
                        <span className="text-[10px]">{new Date(p.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                      </td>
                      <td className="px-5 py-4">
                        {/* ++ FIXED status shows cancelled too */}
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${statusStyle(p.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(p.status)}`} />
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDetailModal(p)}
                            className="px-3 py-1.5 rounded-lg bg-[#f4f7f5] hover:bg-[#e8f5f0] text-[#0d1f1a] text-[11px] font-bold transition-all"
                          >
                            View
                          </button>
                          {/* ++ FIXED — show three-dot for pending, rejected, cancelled — hide for approved */}
                          <PaymentActionMenu
                            payment={p}
                            processing={processing}
                            onApprove={handleApprove}
                            onReject={(p) => setRejectModal(p)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Active Subscriptions Tab */}
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
              <table className="w-full">
                <thead className="bg-[#f9fafb]">
                  <tr>
                    {["Company", "Plan", "Posts Used", "Started", "Expires", "Adjust", ""].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingSubs ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
                  ) : visible.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">No active subscriptions found.</td></tr>
                  ) : visible.map((sub, i) => {
                    const daysLeftSub = sub.billingCycleEnd
                      ? Math.ceil((new Date(sub.billingCycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;
                    const isExpiringSoon = daysLeftSub !== null && daysLeftSub <= 3 && daysLeftSub >= 0;
                    return (
                      <tr key={sub.id} className="hover:bg-[#f9fffe] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a]" style={{ backgroundColor: colorMap[i % colorMap.length] }}>
                              {(sub.companyName || "U")[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#0d1f1a]">{sub.companyName || "Unknown"}</p>
                              <p className="text-[10px] text-gray-400">{sub.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${planStyle(sub.plan)}`}>{planLabel(sub.plan)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-[#0d1f1a]">{sub.jobsPostedThisMonth}</span>
                            <span className="text-[10px] text-gray-400">/{sub.plan === "premium" ? 7 : 3}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-bold text-gray-400">
                          {sub.billingCycleStart
                            ? new Date(sub.billingCycleStart).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="px-5 py-4">
                          {sub.billingCycleEnd ? (
                            <div>
                              <p className={`text-xs font-bold ${isExpiringSoon ? "text-amber-600" : "text-gray-400"}`}>
                                {new Date(sub.billingCycleEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                              {daysLeftSub !== null && daysLeftSub >= 0 && (
                                <p className={`text-[10px] font-bold ${isExpiringSoon ? "text-amber-500" : "text-gray-300"}`}>
                                  {daysLeftSub}d left
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => adjust(sub.id, -1, sub.jobsPostedThisMonth)} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 transition-colors">
                              <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <span className="w-5 text-center text-sm font-black text-[#0d1f1a]">{sub.jobsPostedThisMonth}</span>
                            <button onClick={() => adjust(sub.id, 1, sub.jobsPostedThisMonth)} className="w-7 h-7 bg-[#0d1f1a] hover:bg-[#1a3a2e] rounded-lg flex items-center justify-center text-[#00ffa3] transition-colors">
                              <Plus size={12} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setCancelSubModal(sub)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-[11px] font-bold transition-all flex items-center gap-1"
                          >
                            <X size={11} /> Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}