"use client";

import React, { useState, useEffect } from 'react';
import { Check, Layers, FileText, Briefcase, Zap, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import EmployerNavProfile from '@/components/ui/EmployerNavProfile';

const SubscriptionPlans = () => {
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subscription").then(r => r.ok ? r.json() : null).then(d => { if (d) setCurrentSub(d); }).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (plan: string) => {
    if (plan === currentSub?.plan) return;
    setUpgrading(plan);
    const res = await fetch("/api/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
    if (res.ok) { setCurrentSub((p: any) => ({ ...p, plan, jobsPostedThisMonth: 0 })); alert(`Successfully subscribed to ${plan} plan!`); }
    setUpgrading(null);
  };

  const plans = [
    { name: 'free', displayName: 'Free', badge: 'Normal', price: '0', description: 'One job post per month. Perfect for casual hiring.', icon: Layers, iconBg: 'bg-[#0d2a23]', iconColor: 'text-[#40b594]', jobSlots: '1 job slot / month', features: ['Basic job listing', 'Standard visibility', 'Applicant dashboard'] },
    { name: 'standard', displayName: 'Standard', badge: 'Popular', price: '4.99', description: 'Post up to 3 jobs per month. Best for growing teams.', icon: FileText, iconBg: 'bg-[#133228]', iconColor: 'text-[#40b594]', highlight: true, jobSlots: '3 job slots / month', features: ['Everything in Free', 'Standard visibility boost', 'Email support', 'Applicant filtering'] },
    { name: 'premium', displayName: 'Premium', badge: 'Best Value', price: '10.99', description: 'Post up to 7 jobs per month. For high-volume hiring.', icon: Briefcase, iconBg: 'bg-[#40b594]', iconColor: 'text-[#051612]', jobSlots: '7 job slots / month', features: ['Everything in Standard', 'Featured job placement', 'Priority support', 'Candidate analytics', 'Advanced reporting'] },
  ];

  const planLimits: Record<string, number> = { free: 1, standard: 3, premium: 7 };

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: '#f0f4f3' }}>
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

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Plans & Billing</p>
            <h1 className="text-4xl font-extrabold text-[#071a15] leading-tight">Subscription Plans</h1>
            <p className="text-[#4a5a55] font-medium mt-1">Select the plan that fits your hiring needs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isHighlight = plan.highlight;
            const isCurrent = currentSub?.plan === plan.name;
            return (
              <div key={plan.name} className={`relative rounded-2xl border flex flex-col overflow-hidden transition-all shadow-sm hover:shadow-md ${isHighlight ? 'bg-[#051612] border-[#0d2a23]' : 'bg-white border-gray-100'}`}>
                <div className="px-7 pt-7 pb-0 flex items-start justify-between">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${isHighlight ? 'bg-[#133228] text-[#40b594]' : isCurrent ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-[#6b7f79]'}`}>
                    {isCurrent ? "Current Plan" : plan.badge}
                  </span>
                  <ArrowUpRight size={18} className={isHighlight ? 'text-[#40b594] opacity-60' : 'text-[#6b7f79] opacity-40'} />
                </div>
                <div className="px-7 pt-6 pb-0 flex items-center gap-4">
                  <div className={`${plan.iconBg} p-3 rounded-xl`}><Icon size={22} className={plan.iconColor} /></div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${isHighlight ? 'text-[#40b594]' : 'text-[#6b7f79]'}`}>{plan.displayName}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${isHighlight ? 'text-gray-400' : 'text-[#9ab0aa]'}`}>{plan.jobSlots}</p>
                  </div>
                </div>
                <div className="px-7 pt-5 pb-0">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-extrabold leading-none ${isHighlight ? 'text-white' : 'text-[#071a15]'}`}>${plan.price}</span>
                    <span className={`text-sm font-semibold ${isHighlight ? 'text-gray-400' : 'text-[#6b7f79]'}`}>/mo</span>
                  </div>
                  <p className={`text-sm font-medium mt-3 leading-relaxed ${isHighlight ? 'text-gray-300' : 'text-[#4a5a55]'}`}>{plan.description}</p>
                </div>
                <div className={`mx-7 my-6 h-px ${isHighlight ? 'bg-[#0d2a23]' : 'bg-gray-100'}`} />
                <div className="px-7 pb-0 flex-1 space-y-3">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isHighlight ? 'bg-[#133228]' : 'bg-[#f0f9f6]'}`}><Check size={11} className="text-[#40b594]" /></div>
                      <span className={`text-sm font-medium ${isHighlight ? 'text-gray-300' : 'text-[#4a5a55]'}`}>{feat}</span>
                    </div>
                  ))}
                </div>
                <div className="p-7">
                  <button onClick={() => handleSubscribe(plan.name)} disabled={isCurrent || upgrading === plan.name}
                    className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-sm ${isCurrent ? 'bg-gray-100 text-[#6b7f79] cursor-default' : isHighlight ? 'bg-[#40b594] text-[#051612] hover:bg-[#33997a]' : 'bg-[#051612] text-white hover:bg-[#0d2a23]'} disabled:opacity-60`}>
                    {upgrading === plan.name ? "Processing..." : isCurrent ? "Current Plan" : `Subscribe ${plan.displayName}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><Zap size={18} className="text-[#6b7f79]" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#6b7f79]">Current Plan</p>
              <p className="text-base font-extrabold text-[#071a15] mt-0.5 capitalize">
                {loading ? "Loading..." : `${currentSub?.plan || "free"} — ${planLimits[currentSub?.plan || "free"]} active job slot${planLimits[currentSub?.plan || "free"] > 1 ? "s" : ""} / month`}
              </p>
              {currentSub && <p className="text-xs text-[#6b7f79] mt-1">Used this month: {currentSub.jobsPostedThisMonth} / {planLimits[currentSub.plan]}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#6b7f79]">Renews automatically · Cancel anytime</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPlans;