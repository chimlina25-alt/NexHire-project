"use client";

import React, { useRef } from "react";
import {
  Users,
  Plus,
  Eye,
  FileText,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import EmployerNavProfile from "@/components/ui/EmployerNavProfile";

const EmployerDashboard = () => {
  const applicantsRef = useRef<HTMLDivElement | null>(null);

  const handleScrollToApplicants = () => {
    applicantsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: "#f0f4f3" }}>
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Dashboard</button>
          <Link href="/post_job">
            <button className="text-gray-300 hover:text-white transition-colors">Post Job</button>
          </Link>
          <Link href="/employer_message">
            <button className="text-gray-300 hover:text-white transition-colors">Messages</button>
          </Link>
          <Link href="/employer_notification">
            <button className="text-gray-300 hover:text-white transition-colors">Notification</button>
          </Link>
          <Link href="/subscription">
            <button className="text-gray-300 hover:text-white transition-colors">Subscription</button>
          </Link>
          <Link href="/employer_setting">
            <button className="text-gray-300 hover:text-white transition-colors">Settings</button>
          </Link>
        </nav>

        <EmployerNavProfile />
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">
              Dashboard Overview
            </p>
            <h1 className="text-4xl font-extrabold text-[#071a15] leading-tight">
              Welcome back
            </h1>
          </div>
          <Link href="/post_job">
            <button className="flex items-center gap-2 bg-[#051612] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all shadow-md">
              <Plus size={18} /> Post New Job
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            {
              label: "Total Jobs Posted",
              value: "0",
              icon: FileText,
              bg: "bg-[#051612]",
              iconBg: "bg-[#0d2a23]",
              trend: "0 total listings",
            },
            {
              label: "Total Applicants",
              value: "0",
              icon: Users,
              bg: "bg-[#133228]",
              iconBg: "bg-[#1a4035]",
              trend: "0 received",
            },
            {
              label: "Active Jobs",
              value: "0",
              icon: TrendingUp,
              bg: "bg-[#40b594]",
              iconBg: "bg-[#33997a]",
              trend: "0 open roles",
              dark: true,
            },
          ].map(({ label, value, icon: Icon, bg, iconBg, trend, dark }) => (
            <div key={label} className={`${bg} rounded-2xl p-7 flex flex-col gap-5 shadow-sm`}>
              <div className="flex items-start justify-between">
                <div className={`${iconBg} p-3 rounded-xl`}>
                  <Icon className={dark ? "text-[#051612]" : "text-[#40b594]"} size={24} />
                </div>
                <ArrowUpRight className={dark ? "text-[#051612] opacity-60" : "text-[#40b594] opacity-60"} size={18} />
              </div>
              <div>
                <p className={`text-5xl font-extrabold ${dark ? "text-[#051612]" : "text-white"} leading-none mb-1`}>
                  {value}
                </p>
                <p className={`text-sm font-semibold ${dark ? "text-[#071a15]" : "text-gray-300"}`}>
                  {label}
                </p>
                <p className={`text-xs mt-1 ${dark ? "text-[#133228]" : "text-[#40b594]"} font-medium`}>
                  {trend}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-[#071a15]">Recent Jobs</h2>
              <span className="text-xs font-bold text-[#40b594] bg-emerald-50 px-3 py-1 rounded-full">
                0 listings
              </span>
            </div>
            <div className="px-8 py-6 text-sm text-[#6b7f79]">
              No jobs posted yet.
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 h-fit sticky top-24">
            <h2 className="text-lg font-extrabold text-[#071a15] mb-2">Quick Actions</h2>

            <Link href="/post_job" className="block">
              <button className="w-full bg-[#051612] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#0d2a23] transition-all shadow-sm">
                <Plus size={18} /> Post a New Job
              </button>
            </Link>

            <button
              onClick={handleScrollToApplicants}
              className="w-full border-2 border-[#d1e8e3] text-[#071a15] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#f0f9f6] hover:border-[#40b594] transition-all"
            >
              <Eye size={18} /> View Applicants
            </button>

            <Link href="/post_job">
              <button className="w-full border-2 border-[#d1e8e3] text-[#071a15] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-[#f0f9f6] hover:border-[#40b594] transition-all">
                <FileText size={18} /> Drafts
              </button>
            </Link>
          </div>
        </div>

        <section ref={applicantsRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-extrabold text-[#071a15]">Recent Applicants</h2>
            <span className="text-xs font-bold text-[#40b594] bg-emerald-50 px-3 py-1 rounded-full">
              0 total
            </span>
          </div>
          <div className="px-8 py-6 text-sm text-[#6b7f79]">
            No applicants yet.
          </div>
        </section>
      </main>
    </div>
  );
};

export default EmployerDashboard;
