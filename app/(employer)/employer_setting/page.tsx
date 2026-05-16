"use client";

import React, { useState, useEffect } from "react";
import {
  Shield, AlertTriangle, Mail, Save, Trash2, LogOut, ChevronRight,
  Lock, Eye, EyeOff, ExternalLink, UserCog, CreditCard, Zap,
  Check, X, AlertCircle, Layers, FileText, Briefcase, ArrowUpRight,
  ArrowUp, ArrowDown, Loader2, CheckCircle2, XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmployerNavProfile from "@/components/ui/EmployerNavProfile";

const planLimits: Record<string, number> = { free: 1, standard: 3, premium: 7 };
const planPrice: Record<string, string> = { free: "$0", standard: "$4.99", premium: "$10.99" };
const planOrder: Record<string, number> = { free: 0, standard: 1, premium: 2 };

const plans = [
  { name: "free", displayName: "Free", price: "0", badge: "Basic", description: "One job post per month. Perfect for casual hiring.", icon: Layers, features: ["1 job slot / month", "Basic job listing", "Standard visibility", "Applicant dashboard"] },
  { name: "standard", displayName: "Standard", price: "4.99", badge: "Popular", description: "Post up to 3 jobs per month. Best for growing teams.", icon: FileText, highlight: true, features: ["3 job slots / month", "Everything in Free", "Visibility boost", "Email support", "Applicant filtering"] },
  { name: "premium", displayName: "Premium", price: "10.99", badge: "Best Value", description: "Post up to 7 jobs per month. For high-volume hiring.", icon: Briefcase, features: ["7 job slots / month", "Everything in Standard", "Featured job placement", "Priority support", "Candidate analytics"] },
];

type Toast = { id: number; type: "success" | "error"; message: string };

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed right-6 top-20 z-[9999] flex flex-col gap-3">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold shadow-xl transition-all ${t.type === "success" ? "bg-[#051612] text-white" : "bg-red-600 text-white"}`}>
          {t.type === "success" ? <CheckCircle2 size={16} className="text-[#40b594]" /> : <XCircle size={16} className="text-red-300" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

const EmployerSettings = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // security
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // email — same two-step OTP flow as employee settings
  const [accountEmail, setAccountEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStep, setEmailStep] = useState<"input" | "verify">("input");
  const [pendingEmail, setPendingEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // subscription
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: "cancel" | "upgrade" | "downgrade"; targetPlan?: string } | null>(null);

  const addToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // Load current account email
  useEffect(() => {
    fetch("/api/auth/setting")
      .then((r) => r.json())
      .then((d) => { if (d?.email) setAccountEmail(d.email); })
      .catch(() => {});
  }, []);

  const fetchSub = () => {
    setSubLoading(true);
    fetch("/api/subscription")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setCurrentSub(d); })
      .finally(() => setSubLoading(false));
  };

  useEffect(() => { if (activeTab === "subscription") fetchSub(); }, [activeTab]);

  // Email step 1 — send OTP to new email
  const handleSaveEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      addToast("error", "Please enter a valid email address.");
      return;
    }
    try {
      setEmailLoading(true);
      const res = await fetch("/api/auth/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_email", newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code");
      setPendingEmail(newEmail.toLowerCase().trim());
      setEmailStep("verify");
      addToast("success", `Verification code sent to ${newEmail}`);
    } catch (err: any) {
      addToast("error", err.message || "Failed to send verification code.");
    } finally {
      setEmailLoading(false);
    }
  };

  // Email step 2 — verify OTP and apply change
  const handleVerifyEmailOtp = async () => {
    if (!emailOtp.trim()) {
      addToast("error", "Please enter the verification code.");
      return;
    }
    try {
      setOtpLoading(true);
      const res = await fetch("/api/auth/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_email_change", newEmail: pendingEmail, code: emailOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setAccountEmail(pendingEmail);
      setNewEmail("");
      setEmailOtp("");
      setPendingEmail("");
      setEmailStep("input");
      addToast("success", "Email updated successfully.");
    } catch (err: any) {
      addToast("error", err.message || "Invalid or expired code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");
    if (!passwordForm.currentPassword) { setPasswordError("Please enter your current password."); return; }
    if (passwordForm.newPassword.length < 8) { setPasswordError("New password must be at least 8 characters."); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError("New passwords do not match."); return; }
    try {
      setPasswordLoading(true);
      const res = await fetch("/api/auth/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      addToast("success", "Password updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      addToast("error", err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const res = await fetch("/api/auth/setting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_account" }),
    });
    if (res.ok) router.push("/login");
    else addToast("error", "Failed to delete account. Please try again.");
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleChangePlan = async (targetPlan: string) => {
    setProcessingPlan(targetPlan);
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: targetPlan }),
    });
    setProcessingPlan(null);
    if (res.ok) { setCurrentSub((p: any) => ({ ...p, plan: targetPlan, jobsPostedThisMonth: 0 })); setModal(null); }
    else addToast("error", "Failed to change plan. Please try again.");
  };

  const openPlanModal = (targetPlan: string) => {
    if (targetPlan === "free") { setModal({ type: "cancel" }); return; }
    const isUpgrade = planOrder[targetPlan] > planOrder[currentSub?.plan || "free"];
    setModal({ type: isUpgrade ? "upgrade" : "downgrade", targetPlan });
  };

  const tabs = [
    { id: "general", name: "General", icon: UserCog },
    { id: "security", name: "Security", icon: Shield },
    { id: "subscription", name: "Subscription", icon: CreditCard },
    { id: "danger", name: "Danger Zone", icon: AlertTriangle },
  ];

  const inputClass = "w-full rounded-xl border border-gray-200 bg-[#f8faf9] px-4 py-3 text-sm font-medium text-[#071a15] placeholder-[#9ab0aa] transition-all focus:border-[#40b594] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30";
  const labelClass = "mb-2 block text-sm font-extrabold text-[#071a15]";
  const currentPlanOrder = planOrder[currentSub?.plan || "free"];
  const targetPlanData = plans.find((p) => p.name === modal?.targetPlan);

  return (
    <div className="min-h-screen bg-[#f0f4f3] pb-16 font-sans">
      <ToastContainer toasts={toasts} />

      {/* Plan change modals — identical to original */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(5,22,18,0.55)", backdropFilter: "blur(2px)" }} onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {modal.type === "cancel" && (
              <>
                <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0"><AlertCircle size={20} className="text-amber-600" /></div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#071a15]">Cancel Subscription</h3>
                      <p className="text-xs font-semibold text-[#6b7f79] mt-0.5">You'll be downgraded to the Free plan</p>
                    </div>
                  </div>
                  <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-[#6b7f79] hover:bg-gray-100"><X size={18} /></button>
                </div>
                <div className="px-8 py-6 space-y-4">
                  <p className="text-sm font-medium text-[#4a5a55] leading-relaxed">Cancelling your <span className="font-extrabold text-[#071a15] capitalize">{currentSub?.plan}</span> plan will immediately move you to <span className="font-extrabold text-[#071a15]">Free</span>. You'll lose:</p>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2.5">
                    {(currentSub?.plan === "premium"
                      ? ["7 job slots → 1 job slot per month", "Featured job placement", "Priority support & candidate analytics", "Advanced reporting"]
                      : ["3 job slots → 1 job slot per month", "Visibility boost & applicant filtering", "Email support"]
                    ).map((item) => (
                      <div key={item} className="flex items-start gap-2.5"><X size={13} className="text-amber-500 shrink-0 mt-0.5" /><span className="text-sm font-semibold text-amber-700">{item}</span></div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-[#9ab0aa]">Your existing active job posts will remain visible until closed manually.</p>
                </div>
                <div className="px-8 py-5 border-t border-gray-100 bg-[#f8faf9] flex items-center justify-end gap-3 rounded-b-2xl">
                  <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#6b7f79] hover:text-[#071a15] transition-all">Keep Plan</button>
                  <button onClick={() => handleChangePlan("free")} disabled={processingPlan === "free"} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all disabled:opacity-60">
                    {processingPlan === "free" ? "Cancelling..." : "Yes, Cancel Subscription"}
                  </button>
                </div>
              </>
            )}
            {modal.type === "upgrade" && targetPlanData && (
              <>
                <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f0f9f6] rounded-xl flex items-center justify-center shrink-0 border border-[#d1e8e3]"><ArrowUp size={20} className="text-[#40b594]" /></div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#071a15]">Upgrade to {targetPlanData.displayName}</h3>
                      <p className="text-xs font-semibold text-[#6b7f79] mt-0.5">${targetPlanData.price}/month · effective immediately</p>
                    </div>
                  </div>
                  <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-[#6b7f79] hover:bg-gray-100"><X size={18} /></button>
                </div>
                <div className="px-8 py-6 space-y-4">
                  <p className="text-sm font-medium text-[#4a5a55] leading-relaxed">Upgrading from <span className="font-extrabold text-[#071a15] capitalize">{currentSub?.plan}</span> to <span className="font-extrabold text-[#071a15]">{targetPlanData.displayName}</span> unlocks:</p>
                  <div className="bg-[#f0f9f6] border border-[#d1e8e3] rounded-xl p-4 space-y-2.5">
                    {targetPlanData.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-[#d1e8e3] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} className="text-[#40b594]" /></div>
                        <span className="text-sm font-semibold text-[#4a5a55]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-8 py-5 border-t border-gray-100 bg-[#f8faf9] flex items-center justify-end gap-3 rounded-b-2xl">
                  <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#6b7f79] hover:text-[#071a15] transition-all">Not Now</button>
                  <button onClick={() => handleChangePlan(targetPlanData.name)} disabled={!!processingPlan} className="flex items-center gap-2 bg-[#051612] hover:bg-[#0d2a23] text-white px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all disabled:opacity-60">
                    {processingPlan === targetPlanData.name ? "Processing..." : `Upgrade to ${targetPlanData.displayName}`}
                  </button>
                </div>
              </>
            )}
            {modal.type === "downgrade" && targetPlanData && (
              <>
                <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0"><ArrowDown size={20} className="text-amber-600" /></div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#071a15]">Downgrade to {targetPlanData.displayName}</h3>
                      <p className="text-xs font-semibold text-[#6b7f79] mt-0.5">${targetPlanData.price}/month · effective immediately</p>
                    </div>
                  </div>
                  <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-[#6b7f79] hover:bg-gray-100"><X size={18} /></button>
                </div>
                <div className="px-8 py-6 space-y-4">
                  <p className="text-sm font-medium text-[#4a5a55] leading-relaxed">Downgrading from <span className="font-extrabold text-[#071a15] capitalize">{currentSub?.plan}</span> to <span className="font-extrabold text-[#071a15]">{targetPlanData.displayName}</span>. You'll lose access to some features:</p>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2.5">
                    {(currentSub?.plan === "premium" && targetPlanData.name === "standard"
                      ? ["7 job slots → 3 job slots per month", "Featured job placement", "Priority support", "Candidate analytics & reporting"]
                      : ["Higher job slot limit", "Premium features for this plan"]
                    ).map((item) => (
                      <div key={item} className="flex items-start gap-2.5"><X size={13} className="text-amber-500 shrink-0 mt-0.5" /><span className="text-sm font-semibold text-amber-700">{item}</span></div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-[#9ab0aa]">Your existing active job posts will remain visible until closed manually.</p>
                </div>
                <div className="px-8 py-5 border-t border-gray-100 bg-[#f8faf9] flex items-center justify-end gap-3 rounded-b-2xl">
                  <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#6b7f79] hover:text-[#071a15] transition-all">Keep Current Plan</button>
                  <button onClick={() => handleChangePlan(targetPlanData.name)} disabled={!!processingPlan} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all disabled:opacity-60">
                    {processingPlan === targetPlanData.name ? "Processing..." : "Yes, Downgrade"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 flex items-center justify-between bg-[#051612] px-8 py-4 text-white shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="h-8 w-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <Link href="/dashboard"><button className="text-gray-300 transition-colors hover:text-white">Dashboard</button></Link>
          <Link href="/post_job"><button className="text-gray-300 transition-colors hover:text-white">Post Job</button></Link>
          <Link href="/employer_message"><button className="text-gray-300 transition-colors hover:text-white">Messages</button></Link>
          <Link href="/employer_notification"><button className="text-gray-300 transition-colors hover:text-white">Notification</button></Link>
          <Link href="/subscription"><button className="text-gray-300 transition-colors hover:text-white">Subscription</button></Link>
          <button className="border-b-2 border-[#40b594] pb-1 text-[#40b594]">Settings</button>
        </nav>
        <EmployerNavProfile />
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="mb-8">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#40b594]">Account</p>
          <h1 className="text-4xl font-extrabold text-[#071a15]">Settings</h1>
          <p className="mt-1 font-medium text-[#4a5a55]">Manage account controls, security, and workspace preferences</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="flex-shrink-0 lg:w-72">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === "danger";
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-5 py-4 text-sm font-bold transition-all ${idx !== 0 ? "border-t border-gray-100" : ""} ${isActive ? isDanger ? "bg-red-50 text-red-600" : "bg-[#f0f9f6] text-[#071a15]" : isDanger ? "text-red-400 hover:bg-red-50 hover:text-red-600" : "text-[#4a5a55] hover:bg-[#f8faf9] hover:text-[#071a15]"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? isDanger ? "bg-red-100" : "bg-[#d1e8e3]" : "bg-[#f0f4f3]"}`}>
                          <Icon size={16} className={isActive ? isDanger ? "text-red-600" : "text-[#40b594]" : isDanger ? "text-red-400" : "text-[#6b7f79]"} />
                        </div>
                        {tab.name}
                      </div>
                      {isActive && <ChevronRight size={16} className={isDanger ? "text-red-400" : "text-[#40b594]"} />}
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={handleSignOut} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 text-sm font-bold text-[#4a5a55] shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f4f3]"><LogOut size={16} className="text-[#6b7f79]" /></div>
              Sign Out
            </button>
          </aside>

          <div className="min-w-0 flex-1">

            {/* ══ General Tab ══ */}
            {activeTab === "general" && (
              <div className="space-y-6">
                {/* Workspace Overview */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-8 py-6">
                    <h2 className="text-lg font-extrabold text-[#071a15]">Workspace Overview</h2>
                    <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">Company information is managed from the public employer profile page</p>
                  </div>
                  <div className="p-8">
                    <div className="rounded-2xl border border-[#d1e8e3] bg-[#f0f9f6] p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-[#071a15]">Edit company profile from the real profile page</p>
                          <p className="mt-1 text-sm font-medium text-[#4a5a55]">Keep branding, company details, photo, and files in one place.</p>
                        </div>
                        <Link href="/employer_profile">
                          <button className="inline-flex items-center gap-2 rounded-xl bg-[#051612] px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23]">
                            Open Profile <ExternalLink size={16} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Email — same two-step OTP flow as employee */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-8 py-6">
                    <h2 className="text-lg font-extrabold text-[#071a15]">Account Email</h2>
                    <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">
                      Update the email address used to sign in
                    </p>
                  </div>
                  <div className="p-8">
                    <div className="max-w-md space-y-6">
                      {/* Current email — always shown */}
                      <div>
                        <label className={labelClass}>Current Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                          <input
                            type="email"
                            value={accountEmail}
                            disabled
                            className={`${inputClass} pl-10 opacity-60 cursor-not-allowed`}
                          />
                        </div>
                      </div>

                      {/* Step 1 — enter new email */}
                      {emailStep === "input" && (
                        <>
                          <div>
                            <label className={labelClass}>New Email Address</label>
                            <div className="relative">
                              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                              <input
                                type="email"
                                placeholder="Enter new email address"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className={`${inputClass} pl-10`}
                              />
                            </div>
                            <p className="ml-1 mt-2 text-xs font-semibold text-[#6b7f79]">
                              A verification code will be sent to this email address
                            </p>
                          </div>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={handleSaveEmail}
                              disabled={emailLoading || !newEmail}
                              className="flex items-center gap-2 rounded-xl bg-[#051612] px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {emailLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                              {emailLoading ? "Sending code…" : "Send Verification Code"}
                            </button>
                          </div>
                        </>
                      )}

                      {/* Step 2 — enter OTP */}
                      {emailStep === "verify" && (
                        <>
                          <div className="rounded-2xl border border-[#d1e8e3] bg-[#f0f9f6] px-5 py-4">
                            <p className="text-sm font-bold text-[#071a15]">Verification code sent</p>
                            <p className="mt-1 text-xs font-medium text-[#4a5a55]">
                              We sent a 6-digit code to{" "}
                              <span className="font-extrabold text-[#40b594]">{pendingEmail}</span>.
                              Enter it below to confirm the change.
                            </p>
                          </div>
                          <div>
                            <label className={labelClass}>Verification Code</label>
                            <input
                              type="text"
                              placeholder="Enter 6-digit code"
                              value={emailOtp}
                              onChange={(e) => setEmailOtp(e.target.value)}
                              maxLength={6}
                              className={inputClass}
                            />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={handleVerifyEmailOtp}
                              disabled={otpLoading || !emailOtp.trim()}
                              className="flex items-center gap-2 rounded-xl bg-[#051612] px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {otpLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                              {otpLoading ? "Verifying…" : "Confirm Change"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setEmailStep("input"); setEmailOtp(""); setPendingEmail(""); setNewEmail(""); }}
                              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-[#6b7f79] hover:bg-gray-50 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ Security Tab ══ — identical to original */}
            {activeTab === "security" && (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-8 py-6">
                  <h2 className="text-lg font-extrabold text-[#071a15]">Change Password</h2>
                  <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">Update your account password</p>
                </div>
                <div className="p-8">
                  <div className="max-w-md space-y-6">
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input type={showCurrent ? "text" : "password"} placeholder="Enter current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} className={`${inputClass} pl-10 pr-10`} />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] transition-colors hover:text-[#071a15]">
                          {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input type={showNew ? "text" : "password"} placeholder="Enter new password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} className={`${inputClass} pl-10 pr-10`} />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] transition-colors hover:text-[#071a15]">
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Confirm New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input type={showConfirm ? "text" : "password"} placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} className={`${inputClass} pl-10 pr-10 ${passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword ? "border-red-300 focus:border-red-400 focus:ring-red-200" : ""}`} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] transition-colors hover:text-[#071a15]">
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                        <p className="ml-1 mt-1.5 text-xs font-semibold text-red-500">Passwords do not match</p>
                      )}
                    </div>
                    {passwordError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-xs font-semibold text-red-600">• {passwordError}</p>
                      </div>
                    )}
                    <div className="pt-2">
                      <button type="button" onClick={handleUpdatePassword} disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                        className="flex items-center gap-2 rounded-xl bg-[#051612] px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23] disabled:cursor-not-allowed disabled:opacity-50">
                        {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ Subscription Tab ══ — identical to original */}
            {activeTab === "subscription" && (
  <div className="space-y-5">
    {/* Current membership card */}
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-lg font-extrabold text-[#071a15]">Your Membership</h2>
        <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">Current plan status and billing details</p>
      </div>
      <div className="p-8">
        {subLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-5 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-1/4" />
          </div>
        ) : (
          <div>
            {/* Plan header */}
            <div className="flex items-center gap-5 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border flex-shrink-0 ${currentSub?.plan !== "free" ? "bg-[#f0f9f6] border-[#d1e8e3]" : "bg-gray-50 border-gray-100"}`}>
                <Zap size={24} className={currentSub?.plan !== "free" ? "text-[#40b594]" : "text-gray-400"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-extrabold text-[#071a15] capitalize">{currentSub?.plan || "free"}</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${currentSub?.plan !== "free" ? "text-[#40b594] bg-[#f0f9f6] border-[#d1e8e3]" : "text-gray-400 bg-gray-50 border-gray-100"}`}>
                    Active
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#6b7f79]">
                  {planPrice[currentSub?.plan || "free"]}/month · {planLimits[currentSub?.plan || "free"]} job slot{planLimits[currentSub?.plan || "free"] > 1 ? "s" : ""}/month
                </p>
              </div>
            </div>

            {/* Billing dates — only for paid plans */}
            {currentSub && currentSub.plan !== "free" && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-[#f8faf9] rounded-xl border border-gray-100 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#6b7f79] mb-1">Started</p>
                    <p className="text-sm font-extrabold text-[#071a15]">
                      {currentSub.billingCycleStart
                        ? new Date(currentSub.billingCycleStart).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                  <div className={`rounded-xl border p-4 ${(() => {
                    const d = currentSub.billingCycleEnd
                      ? Math.ceil((new Date(currentSub.billingCycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;
                    return d !== null && d <= 3 ? "bg-amber-50 border-amber-100" : "bg-[#f8faf9] border-gray-100";
                  })()}`}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#6b7f79] mb-1">Expires</p>
                    <p className={`text-sm font-extrabold ${(() => {
                      const d = currentSub.billingCycleEnd
                        ? Math.ceil((new Date(currentSub.billingCycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : null;
                      return d !== null && d <= 3 ? "text-amber-600" : "text-[#071a15]";
                    })()}`}>
                      {currentSub.billingCycleEnd
                        ? new Date(currentSub.billingCycleEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </p>
                    {(() => {
                      const d = currentSub.billingCycleEnd
                        ? Math.ceil((new Date(currentSub.billingCycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : null;
                      return d !== null && d <= 3 && d >= 0
                        ? <p className="text-[10px] font-bold text-amber-500 mt-0.5">{d} day{d !== 1 ? "s" : ""} left</p>
                        : null;
                    })()}
                  </div>
                </div>

                {/* Usage bar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-extrabold text-[#071a15]">Jobs used this month</p>
                    <p className="text-sm font-bold text-[#6b7f79]">{currentSub.jobsPostedThisMonth} / {planLimits[currentSub.plan]}</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-[#40b594] transition-all" style={{ width: `${Math.min((currentSub.jobsPostedThisMonth / planLimits[currentSub.plan]) * 100, 100)}%` }} />
                  </div>
                  <p className="text-xs font-semibold text-[#9ab0aa] mt-1.5">Resets at the start of each billing cycle</p>
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap">
              <Link href="/subscription">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#051612] hover:bg-[#0d2a23] text-white text-sm font-extrabold rounded-xl transition-all">
                  {currentSub?.plan === "free" ? "Upgrade Plan" : "Renew / Change Plan"}
                </button>
              </Link>
              {currentSub && currentSub.plan !== "free" && (
                <button
                  onClick={async () => {
                    if (!confirm("Cancel your membership? You'll be moved to the Free plan immediately.")) return;
                    const res = await fetch("/api/payments/cancel", { method: "POST" });
                    if (res.ok) {
                      setCurrentSub((p: any) => ({ ...p, plan: "free", billingCycleEnd: null }));
                      addToast("success", "Membership cancelled. You're now on the Free plan.");
                    } else {
                      addToast("error", "Failed to cancel. Please try again.");
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-extrabold rounded-xl transition-all"
                >
                  <X size={14} /> Cancel Membership
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Plan cards — click redirects to subscription page to pay */}
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-lg font-extrabold text-[#071a15]">Available Plans</h2>
        <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">
          Select a plan to go to the subscription page and complete payment via bank transfer
        </p>
      </div>
      <div className="p-8">
        {subLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = currentSub?.plan === plan.name;
              const isHighlight = plan.highlight;
              return (
                <Link key={plan.name} href="/subscription">
                  <div className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all cursor-pointer h-full ${isCurrent ? "border-[#40b594] shadow-md" : isHighlight ? "border-[#0d2a23] bg-[#051612] hover:border-[#40b594]" : "border-gray-100 bg-white hover:border-[#40b594] hover:shadow-sm"}`}>
                    {isCurrent && (
                      <div className="absolute top-3 right-3 bg-[#40b594] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">Current</div>
                    )}
                    <div className="p-5 flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isHighlight ? "bg-[#133228]" : "bg-[#f0f9f6]"}`}>
                          <Icon size={16} className="text-[#40b594]" />
                        </div>
                        <div>
                          <p className={`text-sm font-extrabold ${isHighlight ? "text-white" : "text-[#071a15]"}`}>{plan.displayName}</p>
                          <p className={`text-xs font-semibold ${isHighlight ? "text-gray-400" : "text-[#9ab0aa]"}`}>{planLimits[plan.name]} slot{planLimits[plan.name] > 1 ? "s" : ""}/mo</p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-extrabold ${isHighlight ? "text-white" : "text-[#071a15]"}`}>${plan.price}</span>
                        <span className={`text-xs font-semibold ${isHighlight ? "text-gray-400" : "text-[#6b7f79]"}`}>/mo</span>
                      </div>
                      <div className="space-y-1.5">
                        {plan.features.slice(0, 3).map(f => (
                          <div key={f} className="flex items-start gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isHighlight ? "bg-[#133228]" : "bg-[#f0f9f6]"}`}>
                              <Check size={8} className="text-[#40b594]" />
                            </div>
                            <span className={`text-xs font-medium leading-tight ${isHighlight ? "text-gray-300" : "text-[#4a5a55]"}`}>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="px-5 pb-5">
                      {isCurrent ? (
                        <div className="w-full py-2 rounded-xl text-center text-xs font-extrabold text-[#40b594] bg-[#f0f9f6] border border-[#d1e8e3]">
                          Current Plan
                        </div>
                      ) : (
                        <div className={`w-full py-2 rounded-xl text-center text-xs font-extrabold ${isHighlight ? "bg-[#40b594] text-[#051612]" : "bg-[#051612] text-white"}`}>
                          {planOrder[plan.name] > planOrder[currentSub?.plan || "free"] ? "Upgrade →" : plan.name === "free" ? "Downgrade" : "Switch Plan"}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>
)}

            {/* ══ Danger Zone Tab ══ — identical to original */}
            {activeTab === "danger" && (
              <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
                <div className="border-b border-red-100 bg-red-50/50 px-8 py-6">
                  <h2 className="text-lg font-extrabold text-red-600">Danger Zone</h2>
                  <p className="mt-0.5 text-sm font-medium text-red-400">These actions are permanent and cannot be undone</p>
                </div>
                <div className="p-8">
                  <div className="rounded-2xl border border-red-100 bg-red-50/30 p-7">
                    <div className="mb-6 flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100"><Trash2 size={18} className="text-red-600" /></div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#071a15]">Delete Company Workspace</h3>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-[#4a5a55]">This will permanently delete your company profile, all active job listings, and applicant history. This action cannot be reversed.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <button type="button" onClick={handleDeleteAccount} className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold transition-all bg-red-600 text-white hover:bg-red-700">
                        <Trash2 size={16} />Delete Company Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployerSettings;