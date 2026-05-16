"use client";

import React, { useState, useEffect } from "react";
import {
  Check, Layers, FileText, Briefcase, Zap,
  ChevronRight, ChevronLeft, CheckCircle2, Clock,
  AlertTriangle, Download, Copy, CheckCheck, X,
  CreditCard, Calendar, Hash,
} from "lucide-react";
import Link from "next/link";
import EmployerNavProfile from "@/components/ui/EmployerNavProfile";

const plans = [
  {
    name: "standard", displayName: "Standard", price: "4.99",
    icon: FileText, highlight: true, jobSlots: "3 job slots / month",
    features: ["3 job slots / month", "Everything in Free", "Visibility boost", "Email support", "Applicant filtering"],
  },
  {
    name: "premium", displayName: "Premium", price: "10.99",
    icon: Briefcase, highlight: false, jobSlots: "7 job slots / month",
    features: ["7 job slots / month", "Everything in Standard", "Featured job placement", "Priority support", "Candidate analytics"],
  },
];

const planLimits: Record<string, number> = { free: 1, standard: 3, premium: 7 };

const banks = [
  {
    id: "aba",
    name: "ABA Bank",
    accountName: "CHANKHEMARA SRUN",
    usdAccount: "005 014 865",
    khrAccount: "005 014 867",
    qr: "/qr-aba.jpg",
    logo: "/aba-logo.png",
    color: "#003087",
    logoText: "ABA",
  },
  {
    id: "acleda",
    name: "ACLEDA Bank",
    accountName: "SRUN CHANKHEMARA",
    phoneAccount: "090 333 775",
    qr: "/qr-acleda.jpg",
    logo: "/acleda-logo.png",
    color: "#cc0000",
    logoText: "ACLEDA",
  },
];

type Step = "plans" | "bank" | "qr" | "pending";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${copied ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}
    >
      {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function SubscriptionPage() {
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [step, setStep] = useState<Step>("plans");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [txnNumber, setTxnNumber] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetch("/api/payments/check-expiry").catch(() => {});
    Promise.all([
      fetch("/api/subscription").then(r => r.ok ? r.json() : null),
      fetch("/api/payments/request").then(r => r.ok ? r.json() : null),
    ]).then(([sub, pending]) => {
      if (sub) setCurrentSub(sub);
      if (pending) { setPendingRequest(pending); setStep("pending"); }
      setLoading(false);
    });
  }, []);

  const daysLeft = currentSub?.billingCycleEnd
    ? Math.ceil((new Date(currentSub.billingCycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const showExpiryWarning = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && currentSub?.plan !== "free";

  const selectedBankData = banks.find(b => b.id === selectedBank);
  const selectedPlanData = plans.find(p => p.name === selectedPlan);

  const handleConfirmPaid = async () => {
    if (!selectedPlan || !selectedBank) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, bank: selectedBank }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTxnNumber(data.transactionNumber);
      setPendingRequest({ ...data, plan: selectedPlan, bank: selectedBank, amount: selectedPlanData?.price, createdAt: new Date().toISOString() });
      setStep("pending");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await fetch("/api/payments/cancel", { method: "POST" });
      setCurrentSub((p: any) => ({ ...p, plan: "free", billingCycleEnd: null }));
      setShowCancelConfirm(false);
    } catch (e) { console.error(e); }
    setCancelling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f3] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#40b594] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f3] font-sans pb-16">
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="/dashboard"><button className="text-gray-300 hover:text-white transition-colors">Dashboard</button></Link>
          <Link href="/post_job"><button className="text-gray-300 hover:text-white transition-colors">Post Job</button></Link>
          <Link href="/employer_message"><button className="text-gray-300 hover:text-white transition-colors">Messages</button></Link>
          <Link href="/employer_notification"><button className="text-gray-300 hover:text-white transition-colors">Notification</button></Link>
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Subscription</button>
          <Link href="/employer_setting"><button className="text-gray-300 hover:text-white transition-colors">Settings</button></Link>
        </nav>
        <EmployerNavProfile />
      </header>

      {/* Cancel confirm modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(5,22,18,0.7)", backdropFilter: "blur(2px)" }} onClick={() => setShowCancelConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <X size={22} className="text-red-600" />
            </div>
            <h3 className="text-lg font-extrabold text-[#071a15] text-center mb-2">Cancel Membership?</h3>
            <p className="text-sm font-medium text-[#6b7f79] text-center mb-6 leading-relaxed">
              You'll be immediately moved to the Free plan (1 job slot/month). Your current plan benefits end now.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#6b7f79] hover:bg-gray-50">Keep Plan</button>
              <button onClick={handleCancel} disabled={cancelling} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-extrabold disabled:opacity-60">
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Plans & Billing</p>
          <h1 className="text-4xl font-extrabold text-[#071a15]">Subscription</h1>
          <p className="text-[#4a5a55] font-medium mt-1">Choose a plan and pay via bank transfer to activate.</p>
        </div>

        {/* Expiry warning */}
        {showExpiryWarning && step === "plans" && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-amber-800">Your subscription expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}</p>
              <p className="text-xs font-medium text-amber-600 mt-0.5">
                Expires {new Date(currentSub.billingCycleEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <button onClick={() => setStep("plans")} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl transition-all">
              Renew Now
            </button>
          </div>
        )}

        {/* Current plan card */}
        {currentSub && step === "plans" && currentSub.plan !== "free" && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black uppercase tracking-widest text-[#6b7f79]">Active Membership</p>
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#40b594]">
                <span className="w-2 h-2 rounded-full bg-[#40b594] animate-pulse" /> Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0f9f6] rounded-2xl flex items-center justify-center border border-[#d1e8e3]">
                  <Zap size={20} className="text-[#40b594]" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-[#071a15] capitalize">{currentSub.plan} Plan</p>
                  <p className="text-sm font-medium text-[#6b7f79]">{planLimits[currentSub.plan]} job slots/month</p>
                </div>
              </div>
              <div className="text-right">
                {currentSub.billingCycleEnd && (
                  <>
                    <p className="text-xs font-bold text-[#6b7f79]">Expires on</p>
                    <p className="text-sm font-extrabold text-[#071a15]">
                      {new Date(currentSub.billingCycleEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    {daysLeft !== null && daysLeft > 0 && (
                      <p className="text-xs font-bold text-[#40b594] mt-0.5">{daysLeft} days remaining</p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#6b7f79]">Jobs used this month</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#40b594] rounded-full" style={{ width: `${Math.min((currentSub.jobsPostedThisMonth / planLimits[currentSub.plan]) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs font-extrabold text-[#071a15]">{currentSub.jobsPostedThisMonth}/{planLimits[currentSub.plan]}</span>
                </div>
              </div>
              <button onClick={() => setShowCancelConfirm(true)} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-xl">
                Cancel Membership
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Plans ── */}
        {step === "plans" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrent = currentSub?.plan === plan.name;
                return (
                  <div
                    key={plan.name}
                    onClick={() => { if (!isCurrent) { setSelectedPlan(plan.name); setStep("bank"); } }}
                    className={`relative rounded-2xl border-2 p-7 transition-all ${isCurrent ? "border-[#40b594] bg-white cursor-default" : plan.highlight ? "border-[#0d2a23] bg-[#051612] cursor-pointer hover:border-[#40b594]" : "border-gray-100 bg-white cursor-pointer hover:border-[#40b594] hover:shadow-md"}`}
                  >
                    {isCurrent && <div className="absolute top-4 right-4 bg-[#40b594] text-white text-[10px] font-extrabold px-3 py-1 rounded-full">Current</div>}
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`p-3 rounded-xl ${plan.highlight ? "bg-[#133228]" : "bg-[#f0f9f6]"}`}><Icon size={22} className="text-[#40b594]" /></div>
                      <div>
                        <p className={`text-lg font-extrabold ${plan.highlight ? "text-white" : "text-[#071a15]"}`}>{plan.displayName}</p>
                        <p className={`text-xs font-semibold ${plan.highlight ? "text-gray-400" : "text-[#6b7f79]"}`}>{plan.jobSlots}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 mb-5">
                      <span className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-[#071a15]"}`}>${plan.price}</span>
                      <span className={`text-sm font-semibold ${plan.highlight ? "text-gray-400" : "text-[#6b7f79]"}`}>/month</span>
                    </div>
                    <div className="space-y-2.5 mb-6">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? "bg-[#133228]" : "bg-[#f0f9f6]"}`}><Check size={11} className="text-[#40b594]" /></div>
                          <span className={`text-sm font-medium ${plan.highlight ? "text-gray-300" : "text-[#4a5a55]"}`}>{f}</span>
                        </div>
                      ))}
                    </div>
                    {isCurrent ? (
                      <div className="w-full py-3 rounded-xl text-center text-sm font-extrabold text-[#40b594] bg-[#f0f9f6] border border-[#d1e8e3]">Current Plan</div>
                    ) : (
                      <div className={`w-full py-3 rounded-xl text-center text-sm font-extrabold flex items-center justify-center gap-2 ${plan.highlight ? "bg-[#40b594] text-[#051612]" : "bg-[#051612] text-white"}`}>
                        Select {plan.displayName} <ChevronRight size={15} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Free plan */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Layers size={16} className="text-[#6b7f79]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-extrabold text-[#071a15]">Free Plan</p>
                <p className="text-xs font-medium text-[#6b7f79]">1 job slot / month — always free, no payment needed</p>
              </div>
              {currentSub?.plan === "free" && <span className="text-xs font-extrabold text-[#40b594] bg-[#f0f9f6] px-3 py-1 rounded-full border border-[#d1e8e3]">Current</span>}
            </div>
          </div>
        )}

        {/* ── STEP: Bank ── */}
        {step === "bank" && (
          <div className="max-w-lg mx-auto">
            <button onClick={() => setStep("plans")} className="flex items-center gap-2 text-sm font-bold text-[#6b7f79] hover:text-[#071a15] mb-6 transition-colors">
              <ChevronLeft size={16} /> Back to Plans
            </button>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Step 1 of 2</p>
                <h2 className="text-xl font-extrabold text-[#071a15]">Choose Your Bank</h2>
                <p className="text-sm font-medium text-[#6b7f79] mt-1">
                  Subscribing to <span className="font-extrabold text-[#071a15] capitalize">{selectedPlan}</span> —{" "}
                  <span className="font-extrabold text-[#40b594]">${selectedPlanData?.price}/month</span>
                </p>
              </div>
              <div className="p-6 space-y-3">
                {banks.map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => { setSelectedBank(bank.id); setStep("qr"); }}
                    className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 hover:border-[#40b594] hover:bg-[#f0f9f6] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Logo placeholder — replace src with real logo */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <img
                          src={bank.logo}
                          alt={bank.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).parentElement!.style.background = bank.color;
                            (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="color:white;font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;height:100%">${bank.logoText}</span>`;
                          }}
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-extrabold text-[#071a15]">{bank.name}</p>
                        <p className="text-xs font-medium text-[#6b7f79] mt-0.5">KHQR / Bank Transfer</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-[#40b594] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: QR ── */}
        {step === "qr" && selectedBankData && (
          <div className="max-w-lg mx-auto">
            <button onClick={() => setStep("bank")} className="flex items-center gap-2 text-sm font-bold text-[#6b7f79] hover:text-[#071a15] mb-6 transition-colors">
              <ChevronLeft size={16} /> Back
            </button>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Step 2 of 2</p>
                <h2 className="text-xl font-extrabold text-[#071a15]">Scan & Pay</h2>
                <p className="text-sm font-medium text-[#6b7f79] mt-1">
                  Pay <span className="font-extrabold text-[#40b594]">${selectedPlanData?.price}</span> via {selectedBankData.name}
                </p>
              </div>
              <div className="p-8">
                {/* Bank header */}
                <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl border border-gray-100 bg-[#f8faf9]">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={selectedBankData.logo} alt={selectedBankData.name} className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).parentElement!.style.background = selectedBankData.color;
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="color:white;font-weight:800;font-size:9px;display:flex;align-items:center;justify-content:center;height:100%">${selectedBankData.logoText}</span>`;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-[#071a15] text-sm">{selectedBankData.name}</p>
                    <p className="text-xs font-medium text-[#6b7f79]">{selectedBankData.accountName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#6b7f79]">Amount</p>
                    <p className="text-xl font-extrabold text-[#40b594]">${selectedPlanData?.price}</p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm mb-4">
                    <img src={selectedBankData.qr} alt="QR Code" className="w-56 h-56 object-contain" />
                  </div>
                  <p className="text-xs font-medium text-[#6b7f79] text-center mb-4">Scan with any KHQR-supported banking app</p>

                  {/* Download + options */}
                  <div className="flex gap-2">
                    <a
                      href={selectedBankData.qr}
                      download={`nexhire-${selectedBankData.id}-qr.jpg`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#6b7f79] hover:bg-gray-50 hover:text-[#071a15] transition-all"
                    >
                      <Download size={13} /> Download QR
                    </a>
                    <CopyButton text={selectedBankData.qr} label="Copy QR Link" />
                  </div>
                </div>

                {/* Account details with copy */}
                <div className="bg-[#f8faf9] rounded-2xl border border-gray-100 p-5 mb-6">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#6b7f79] mb-4">Account Details</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#6b7f79]">Account Name</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#071a15]">{selectedBankData.accountName}</span>
                        <CopyButton text={selectedBankData.accountName} label="Copy" />
                      </div>
                    </div>

                    {/* ABA specific */}
                    {selectedBankData.id === "aba" && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#6b7f79]">USD Account</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#071a15]">{(selectedBankData as any).usdAccount}</span>
                            <CopyButton text={(selectedBankData as any).usdAccount} label="Copy" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#6b7f79]">KHR Account</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#071a15]">{(selectedBankData as any).khrAccount}</span>
                            <CopyButton text={(selectedBankData as any).khrAccount} label="Copy" />
                          </div>
                        </div>
                      </>
                    )}

                    {/* ACLEDA specific */}
                    {selectedBankData.id === "acleda" && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#6b7f79]">Phone / Account</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#071a15]">{(selectedBankData as any).phoneAccount}</span>
                          <CopyButton text={(selectedBankData as any).phoneAccount} label="Copy" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xs font-semibold text-[#6b7f79]">Amount to Pay</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#40b594]">${selectedPlanData?.price} USD</span>
                        <CopyButton text={selectedPlanData?.price || ""} label="Copy" />
                      </div>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600">{submitError}</div>
                )}

                <button
                  onClick={handleConfirmPaid}
                  disabled={submitting}
                  className="w-full py-4 bg-[#40b594] hover:bg-[#33997a] text-[#051612] font-extrabold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-[#051612] border-t-transparent rounded-full animate-spin" /> Submitting…</>
                  ) : (
                    <><CheckCircle2 size={18} /> I Have Paid — Confirm</>
                  )}
                </button>
                <p className="text-center text-xs font-medium text-[#6b7f79] mt-3">Only click after completing payment in your bank app</p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: Pending ── */}
        {step === "pending" && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-5 border border-amber-100">
                  <Clock size={28} className="text-amber-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#071a15] mb-2">Awaiting Confirmation</h2>
                <p className="text-sm font-medium text-[#6b7f79] max-w-sm leading-relaxed mb-6">
                  Your payment has been recorded. Our team will verify and activate your subscription shortly.
                </p>

                {(pendingRequest || txnNumber) && (
                  <div className="w-full bg-[#f8faf9] rounded-2xl border border-gray-100 p-5 mb-6 text-left space-y-3">
                    {/* Transaction number highlighted */}
                    <div className="bg-[#051612] rounded-xl px-4 py-3 mb-1">
                      <p className="text-[10px] font-bold text-[#40b594] uppercase tracking-widest mb-1">Transaction Number</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-white font-mono">{pendingRequest?.transactionNumber || txnNumber}</span>
                        <CopyButton text={pendingRequest?.transactionNumber || txnNumber} label="Copy" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#6b7f79]">Plan</span>
                      <span className="text-xs font-extrabold text-[#071a15] capitalize">{pendingRequest?.plan}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#6b7f79]">Amount</span>
                      <span className="text-xs font-extrabold text-[#40b594]">${pendingRequest?.amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#6b7f79]">Bank</span>
                      <span className="text-xs font-extrabold text-[#071a15] uppercase">{pendingRequest?.bank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#6b7f79]">Submitted</span>
                      <span className="text-xs font-extrabold text-[#071a15]">
                        {new Date(pendingRequest?.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-xl mb-4 w-full justify-center">
                  <Clock size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-600">Pending admin confirmation</span>
                </div>
                <p className="text-xs font-medium text-[#6b7f79]">You'll receive a notification and email once approved.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}