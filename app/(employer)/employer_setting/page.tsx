"use client";

import React, { useState, useEffect } from "react";
import {
  Shield, AlertTriangle, Mail, Save, Trash2, LogOut, ChevronRight,
  Lock, Eye, EyeOff, ExternalLink, UserCog, CreditCard, Zap,
  Check, X, AlertCircle, Layers, FileText, Briefcase, ArrowUpRight, ArrowUp, ArrowDown,
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

const EmployerSettings = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: "cancel" | "upgrade" | "downgrade"; targetPlan?: string } | null>(null);
  const [settings, setSettings] = useState({ adminEmail: "", billingEmail: "" });

  const fetchSub = () => {
    setSubLoading(true);
    fetch("/api/subscription").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) setCurrentSub(d); }).finally(() => setSubLoading(false));
  };

  useEffect(() => { if (activeTab === "subscription") fetchSub(); }, [activeTab]);

  const handleSaveEmails = async () => {
    setSavingEmail(true);
    const res = await fetch("/api/auth/setting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update-emails", adminEmail: settings.adminEmail, billingEmail: settings.billingEmail }) });
    setSavingEmail(false);
    if (res.ok) alert("Email settings saved");
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) { alert("Please fill in both password fields"); return; }
    if (newPassword.length < 8) { alert("New password must be at least 8 characters"); return; }
    setSavingPassword(true);
    const res = await fetch("/api/auth/setting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update-password", currentPassword, newPassword }) });
    setSavingPassword(false);
    if (res.ok) { alert("Password updated successfully"); setCurrentPassword(""); setNewPassword(""); }
    else { const data = await res.json(); alert(data.error || "Failed to update password"); }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "DELETE") return;
    const res = await fetch("/api/auth/setting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete-account" }) });
    if (res.ok) router.push("/login");
  };

  const handleSignOut = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); };

  const handleChangePlan = async (targetPlan: string) => {
    setProcessingPlan(targetPlan);
    const res = await fetch("/api/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: targetPlan }) });
    setProcessingPlan(null);
    if (res.ok) { setCurrentSub((p: any) => ({ ...p, plan: targetPlan, jobsPostedThisMonth: 0 })); setModal(null); }
    else alert("Failed to change plan. Please try again.");
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
            {activeTab === "general" && (
              <div className="space-y-6">
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
                          <button className="inline-flex items-center gap-2 rounded-xl bg-[#051612] px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23]">Open Profile <ExternalLink size={16} /></button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-8 py-6"><h2 className="text-lg font-extrabold text-[#071a15]">Account Emails</h2></div>
                  <div className="p-8">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveEmails(); }}>
                      <div>
                        <label className={labelClass}>Admin Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                          <input type="email" value={settings.adminEmail} onChange={(e) => setSettings((p) => ({ ...p, adminEmail: e.target.value }))} className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Billing Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                          <input type="email" value={settings.billingEmail} onChange={(e) => setSettings((p) => ({ ...p, billingEmail: e.target.value }))} className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                      <div className="pt-2">
                        <button type="submit" disabled={savingEmail} className="flex items-center gap-2 rounded-xl bg-[#051612] px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23] disabled:opacity-60">
                          <Save size={16} />{savingEmail ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-8 py-6">
                  <h2 className="text-lg font-extrabold text-[#071a15]">Security</h2>
                  <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">Update your account password</p>
                </div>
                <div className="p-8">
                  <form className="max-w-md space-y-6" onSubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }}>
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className={`${inputClass} pl-10 pr-10`} />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] transition-colors hover:text-[#071a15]">
                          {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className={`${inputClass} pl-10 pr-10`} />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] transition-colors hover:text-[#071a15]">
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#d1e8e3] bg-[#f0f9f6] p-4">
                      <p className="mb-2 text-xs font-extrabold text-[#071a15]">Password requirements</p>
                      {["At least 8 characters", "One uppercase letter", "One number or symbol"].map((req) => (
                        <div key={req} className="mt-1.5 flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-[#40b594]" /><p className="text-xs font-medium text-[#4a5a55]">{req}</p></div>
                      ))}
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={savingPassword} className="flex items-center gap-2 rounded-xl bg-[#051612] px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23] disabled:opacity-60">
                        <Shield size={16} />{savingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "subscription" && (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-8 py-6">
                    <h2 className="text-lg font-extrabold text-[#071a15]">Current Plan</h2>
                    <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">Your active subscription and usage this billing cycle</p>
                  </div>
                  <div className="p-8">
                    {subLoading ? (
                      <div className="space-y-3 animate-pulse"><div className="h-5 bg-gray-100 rounded w-1/3" /><div className="h-4 bg-gray-100 rounded w-1/4" /></div>
                    ) : (
                      <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-[#f0f9f6] rounded-2xl flex items-center justify-center border border-[#d1e8e3] shrink-0"><Zap size={24} className="text-[#40b594]" /></div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl font-extrabold text-[#071a15] capitalize">{currentSub?.plan || "free"}</span>
                                <span className="text-xs font-bold text-[#40b594] bg-[#f0f9f6] px-2.5 py-0.5 rounded-lg border border-[#d1e8e3]">Active</span>
                              </div>
                              <p className="text-sm font-semibold text-[#6b7f79]">{planPrice[currentSub?.plan || "free"]}/month · {planLimits[currentSub?.plan || "free"]} job slot{planLimits[currentSub?.plan || "free"] > 1 ? "s" : ""} / month</p>
                            </div>
                          </div>
                        </div>
                        {currentSub && (
                          <div className="mt-7 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-extrabold text-[#071a15]">Jobs used this month</p>
                              <p className="text-sm font-bold text-[#6b7f79]">{currentSub.jobsPostedThisMonth} / {planLimits[currentSub.plan]}</p>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <div className="h-2.5 rounded-full bg-[#40b594] transition-all" style={{ width: `${Math.min((currentSub.jobsPostedThisMonth / planLimits[currentSub.plan]) * 100, 100)}%` }} />
                            </div>
                            <p className="text-xs font-semibold text-[#9ab0aa] mt-2">Resets at the start of each billing cycle</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-8 py-6">
                    <h2 className="text-lg font-extrabold text-[#071a15]">Change Plan</h2>
                    <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">Switch between plans anytime — changes take effect immediately</p>
                  </div>
                  <div className="p-8">
                    {subLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.map((plan) => {
                          const Icon = plan.icon;
                          const isCurrent = currentSub?.plan === plan.name;
                          const isHighlight = plan.highlight;
                          const isUpgrade = planOrder[plan.name] > currentPlanOrder;
                          const isDowngrade = planOrder[plan.name] < currentPlanOrder && plan.name !== "free";
                          const isCancelTarget = plan.name === "free" && currentSub?.plan !== "free";
                          return (
                            <div key={plan.name} className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all ${isCurrent ? "border-[#40b594] shadow-md" : isHighlight ? "border-[#0d2a23] bg-[#051612]" : "border-gray-100 bg-white hover:border-[#40b594] hover:shadow-sm"}`}>
                              {isCurrent && <div className="absolute top-3 right-3 bg-[#40b594] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">Current</div>}
                              <div className="p-6 flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2.5 rounded-xl ${isHighlight ? "bg-[#133228]" : "bg-[#f0f9f6]"}`}><Icon size={18} className="text-[#40b594]" /></div>
                                  <div>
                                    <p className={`text-sm font-extrabold ${isHighlight ? "text-white" : "text-[#071a15]"}`}>{plan.displayName}</p>
                                    <p className={`text-xs font-semibold ${isHighlight ? "text-gray-400" : "text-[#9ab0aa]"}`}>{planLimits[plan.name]} slot{planLimits[plan.name] > 1 ? "s" : ""}/mo</p>
                                  </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                  <span className={`text-3xl font-extrabold ${isHighlight ? "text-white" : "text-[#071a15]"}`}>${plan.price}</span>
                                  <span className={`text-xs font-semibold ${isHighlight ? "text-gray-400" : "text-[#6b7f79]"}`}>/mo</span>
                                </div>
                                <div className="space-y-2">
                                  {plan.features.slice(0, 4).map((feat) => (
                                    <div key={feat} className="flex items-start gap-2">
                                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isHighlight ? "bg-[#133228]" : "bg-[#f0f9f6]"}`}><Check size={9} className="text-[#40b594]" /></div>
                                      <span className={`text-xs font-medium leading-tight ${isHighlight ? "text-gray-300" : "text-[#4a5a55]"}`}>{feat}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="px-6 pb-6">
                                {isCurrent ? (
                                  <div className="w-full py-2.5 rounded-xl text-center text-sm font-extrabold text-[#40b594] bg-[#f0f9f6] border border-[#d1e8e3]">Current Plan</div>
                                ) : isCancelTarget ? (
                                  <button onClick={() => openPlanModal("free")} className="w-full py-2.5 rounded-xl text-sm font-extrabold border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all">Cancel & Downgrade</button>
                                ) : isUpgrade ? (
                                  <button onClick={() => openPlanModal(plan.name)} disabled={!!processingPlan} className={`w-full py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 ${isHighlight ? "bg-[#40b594] text-[#051612] hover:bg-[#33997a]" : "bg-[#051612] text-white hover:bg-[#0d2a23]"}`}>
                                    <ArrowUpRight size={14} />Upgrade
                                  </button>
                                ) : isDowngrade ? (
                                  <button onClick={() => openPlanModal(plan.name)} disabled={!!processingPlan} className="w-full py-2.5 rounded-xl text-sm font-extrabold border border-gray-200 bg-[#f8faf9] text-[#4a5a55] hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60">
                                    <ArrowDown size={14} />Downgrade
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!subLoading && currentSub && currentSub.plan !== "free" && (
                      <div className="mt-5 flex items-center justify-between bg-[#f8faf9] border border-gray-100 rounded-xl px-5 py-4">
                        <p className="text-xs font-semibold text-[#6b7f79]">Want to stop your subscription entirely?</p>
                        <button onClick={() => setModal({ type: "cancel" })} className="text-xs font-extrabold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"><X size={12} /> Cancel subscription</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                      <div>
                        <label className="mb-2 block text-sm font-extrabold text-[#071a15]">Type <span className="font-black tracking-widest text-red-600">DELETE</span> to confirm</label>
                        <input type="text" placeholder="Type DELETE here" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} className="w-full max-w-sm rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-[#071a15] placeholder-red-200 transition-all focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300/40" />
                      </div>
                      <button type="button" onClick={handleDeleteAccount} disabled={deleteText !== "DELETE"} className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold transition-all ${deleteText === "DELETE" ? "bg-red-600 text-white hover:bg-red-700" : "cursor-not-allowed bg-red-100 text-red-300"}`}>
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