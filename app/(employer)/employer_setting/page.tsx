"use client";

import React, { useState } from "react";
import {
  Shield,
  AlertTriangle,
  Mail,
  Save,
  Building2,
  Globe,
  MapPin,
  Trash2,
  LogOut,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ExternalLink,
  UserCog,
  Phone,
} from "lucide-react";
import Link from "next/link";

const EmployerSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  const [settings, setSettings] = useState({
    adminEmail: "admin@nexhire.com",
    billingEmail: "billing@nexhire.com",
  });

  const tabs = [
    { id: "general", name: "General", icon: UserCog },
    { id: "security", name: "Security", icon: Shield },
    { id: "danger", name: "Danger Zone", icon: AlertTriangle },
  ];

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-[#f8faf9] px-4 py-3 text-sm font-medium text-[#071a15] placeholder-[#9ab0aa] transition-all focus:border-[#40b594] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30";

  const labelClass = "mb-2 block text-sm font-extrabold text-[#071a15]";

  return (
    <div className="min-h-screen bg-[#f0f4f3] pb-16 font-sans">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-[#051612] px-8 py-4 text-white shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="h-8 w-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <Link href="/dashboard">
            <button className="text-gray-300 transition-colors hover:text-white">Dashboard</button>
          </Link>
          <Link href="/post_job">
            <button className="text-gray-300 transition-colors hover:text-white">Post Job</button>
          </Link>
          <Link href="/employer_message">
            <button className="text-gray-300 transition-colors hover:text-white">Messages</button>
          </Link>
          <Link href="/employer_notification">
            <button className="text-gray-300 transition-colors hover:text-white">Notification</button>
          </Link>
          <Link href="/subscription">
            <button className="text-gray-300 transition-colors hover:text-white">Subscription</button>
          </Link>
          <button className="border-b-2 border-[#40b594] pb-1 text-[#40b594]">Settings</button>
        </nav>

        <Link href="/employer_profile">
          <div className="group flex cursor-pointer items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Company</p>
              <p className="text-sm font-bold text-white transition-colors group-hover:text-[#40b594]">
                Profile
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#40b594] text-sm font-extrabold text-[#051612]">
              C
            </div>
          </div>
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="mb-8">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#40b594]">Account</p>
          <h1 className="text-4xl font-extrabold text-[#071a15]">Settings</h1>
          <p className="mt-1 font-medium text-[#4a5a55]">
            Manage account controls, security, and workspace preferences
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="flex-shrink-0 lg:w-72">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === "danger";

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-5 py-4 text-sm font-bold transition-all ${
                      idx !== 0 ? "border-t border-gray-100" : ""
                    } ${
                      isActive
                        ? isDanger
                          ? "bg-red-50 text-red-600"
                          : "bg-[#f0f9f6] text-[#071a15]"
                        : isDanger
                          ? "text-red-400 hover:bg-red-50 hover:text-red-600"
                          : "text-[#4a5a55] hover:bg-[#f8faf9] hover:text-[#071a15]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isActive
                              ? isDanger
                                ? "bg-red-100"
                                : "bg-[#d1e8e3]"
                              : "bg-[#f0f4f3]"
                          }`}
                        >
                          <Icon
                            size={16}
                            className={
                              isActive
                                ? isDanger
                                  ? "text-red-600"
                                  : "text-[#40b594]"
                                : isDanger
                                  ? "text-red-400"
                                  : "text-[#6b7f79]"
                            }
                          />
                        </div>
                        {tab.name}
                      </div>

                      {isActive && (
                        <ChevronRight
                          size={16}
                          className={isDanger ? "text-red-400" : "text-[#40b594]"}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 text-sm font-bold text-[#4a5a55] shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f4f3]">
                <LogOut size={16} className="text-[#6b7f79]" />
              </div>
              Sign Out
            </button>
          </aside>

          <div className="min-w-0 flex-1">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-8 py-6">
                    <h2 className="text-lg font-extrabold text-[#071a15]">Workspace Overview</h2>
                    <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">
                      Company information is managed from the public employer profile page
                    </p>
                  </div>

                  <div className="p-8">
                    <div className="grid gap-4 md:grid-cols-2">
                      <SummaryCard icon={Building2} label="Company Name" value="NexHire Solutions" />
                      <SummaryCard icon={Globe} label="Website" value="www.nexhire.com" />
                      <SummaryCard icon={MapPin} label="Location" value="Phnom Penh, Cambodia" />
                      <SummaryCard icon={Briefcase} label="Active Jobs" value="12 Open Positions" />
                    </div>

                    <div className="mt-6 rounded-2xl border border-[#d1e8e3] bg-[#f0f9f6] p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-[#071a15]">
                            Edit company profile from the real profile page
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#4a5a55]">
                            Keep branding, company details, photo, and files in one place instead of duplicating forms here.
                          </p>
                        </div>
                        <Link href="/employer_profile">
                          <button className="inline-flex items-center gap-2 rounded-xl bg-[#051612] px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23]">
                            Open Profile
                            <ExternalLink size={16} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-8 py-6">
                    <h2 className="text-lg font-extrabold text-[#071a15]">Account Emails</h2>
                    <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">
                      Separate internal contact emails from public company profile information
                    </p>
                  </div>

                  <div className="p-8">
                    <form className="space-y-6">
                      <div>
                        <label className={labelClass}>Admin Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                          <input
                            type="email"
                            value={settings.adminEmail}
                            onChange={(e) =>
                              setSettings((prev) => ({ ...prev, adminEmail: e.target.value }))
                            }
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                        <p className="ml-1 mt-2 text-xs font-semibold text-[#6b7f79]">
                          Used for login, security, and workspace management
                        </p>
                      </div>

                      <div>
                        <label className={labelClass}>Billing Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                          <input
                            type="email"
                            value={settings.billingEmail}
                            onChange={(e) =>
                              setSettings((prev) => ({ ...prev, billingEmail: e.target.value }))
                            }
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                        <p className="ml-1 mt-2 text-xs font-semibold text-[#6b7f79]">
                          Used for invoices and subscription communication
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-xl bg-[#051612] px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23]"
                        >
                          <Save size={16} />
                          Save Changes
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
                  <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">
                    Update your account password
                  </p>
                </div>

                <div className="p-8">
                  <form className="max-w-md space-y-6">
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input
                          type={showCurrent ? "text" : "password"}
                          placeholder="Enter current password"
                          className={`${inputClass} pl-10 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] transition-colors hover:text-[#071a15]"
                        >
                          {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input
                          type={showNew ? "text" : "password"}
                          placeholder="Enter new password"
                          className={`${inputClass} pl-10 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] transition-colors hover:text-[#071a15]"
                        >
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#d1e8e3] bg-[#f0f9f6] p-4">
                      <p className="mb-2 text-xs font-extrabold text-[#071a15]">Password requirements</p>
                      {["At least 8 characters", "One uppercase letter", "One number or symbol"].map((req) => (
                        <div key={req} className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#40b594]" />
                          <p className="text-xs font-medium text-[#4a5a55]">{req}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-xl bg-[#051612] px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23]"
                      >
                        <Shield size={16} />
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "danger" && (
              <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
                <div className="border-b border-red-100 bg-red-50/50 px-8 py-6">
                  <h2 className="text-lg font-extrabold text-red-600">Danger Zone</h2>
                  <p className="mt-0.5 text-sm font-medium text-red-400">
                    These actions are permanent and cannot be undone
                  </p>
                </div>

                <div className="p-8">
                  <div className="rounded-2xl border border-red-100 bg-red-50/30 p-7">
                    <div className="mb-6 flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100">
                        <Trash2 size={18} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#071a15]">
                          Delete Company Workspace
                        </h3>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-[#4a5a55]">
                          This will permanently delete your company profile, all active job listings,
                          and applicant history. This action cannot be reversed.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-extrabold text-[#071a15]">
                          Type <span className="font-black tracking-widest text-red-600">DELETE</span> to confirm
                        </label>
                        <input
                          type="text"
                          placeholder="Type DELETE here"
                          value={deleteText}
                          onChange={(e) => setDeleteText(e.target.value)}
                          className="w-full max-w-sm rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-[#071a15] placeholder-red-200 transition-all focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300/40"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={deleteText !== "DELETE"}
                        className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold transition-all ${
                          deleteText === "DELETE"
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "cursor-not-allowed bg-red-100 text-red-300"
                        }`}
                      >
                        <Trash2 size={16} />
                        Delete Company Account
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

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-[#f8faf9] p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5f1]">
        <Icon size={18} className="text-[#40b594]" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-wider text-[#6b7f79]">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-[#071a15]">{value}</p>
    </div>
  );
}

export default EmployerSettings;
