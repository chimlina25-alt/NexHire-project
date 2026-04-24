"use client";

import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Camera,
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
  EyeOff
} from 'lucide-react';
import Link from 'next/link';

const EmployerSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [deleteText, setDeleteText]   = useState('');

  const tabs = [
    { id: 'profile',  name: 'Company Profile', icon: Building2     },
    { id: 'security', name: 'Security',         icon: Shield        },
    { id: 'danger',   name: 'Danger Zone',      icon: AlertTriangle },
  ];

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium placeholder-[#9ab0aa] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594] transition-all';

  const labelClass = 'block text-sm font-extrabold text-[#071a15] mb-2';

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: '#f0f4f3' }}>

      {/* ── HEADER ── */}
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="/dashboard">
            <button className="text-gray-300 hover:text-white transition-colors">Dashboard</button>
          </Link>
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
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Settings</button>
        </nav>

        <Link href="/employer_profile">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Company</p>
              <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors">Profile</p>
            </div>
            <div className="w-10 h-10 bg-[#40b594] rounded-full flex items-center justify-center font-extrabold text-[#051612] text-sm">C</div>
          </div>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-10">

        {/* ── PAGE TITLE ── */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Account</p>
          <h1 className="text-4xl font-extrabold text-[#071a15]">Settings</h1>
          <p className="text-[#4a5a55] font-medium mt-1">Manage your company profile and account security</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── SIDEBAR TABS ── */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === 'danger';
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 text-sm font-bold transition-all
                      ${idx !== 0 ? 'border-t border-gray-100' : ''}
                      ${isActive
                        ? isDanger
                          ? 'bg-red-50 text-red-600'
                          : 'bg-[#f0f9f6] text-[#071a15]'
                        : isDanger
                          ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                          : 'text-[#4a5a55] hover:bg-[#f8faf9] hover:text-[#071a15]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive
                          ? isDanger ? 'bg-red-100' : 'bg-[#d1e8e3]'
                          : 'bg-[#f0f4f3]'
                      }`}>
                        <Icon size={16} className={
                          isActive
                            ? isDanger ? 'text-red-600' : 'text-[#40b594]'
                            : isDanger ? 'text-red-400' : 'text-[#6b7f79]'
                        } />
                      </div>
                      {tab.name}
                    </div>
                    {isActive && (
                      <ChevronRight size={16} className={isDanger ? 'text-red-400' : 'text-[#40b594]'} />
                    )}
                  </button>
                );
              })}
            </div>

            <button className="w-full mt-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-3 text-sm font-bold text-[#4a5a55] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#f0f4f3] flex items-center justify-center">
                <LogOut size={16} className="text-[#6b7f79]" />
              </div>
              Sign Out
            </button>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">

            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                <div className="px-8 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-extrabold text-[#071a15]">Company Profile</h2>
                  <p className="text-sm text-[#4a5a55] font-medium mt-0.5">Update your public company info and branding</p>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-[#f0f4f3] border-2 border-gray-100 flex items-center justify-center">
                        <Building2 size={36} className="text-[#051612]" />
                      </div>
                      <button className="absolute -bottom-2 -right-2 bg-[#051612] text-white p-2 rounded-xl border-2 border-white hover:bg-[#0d2a23] transition-all shadow-sm">
                        <Camera size={14} />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#071a15]">Company Logo</p>
                      <p className="text-xs text-[#6b7f79] font-medium mt-0.5">PNG or JPG, max 2MB recommended</p>
                      <button className="mt-2 text-xs font-bold text-[#40b594] hover:underline transition-colors">
                        Preview Public Profile →
                      </button>
                    </div>
                  </div>

                  <form className="space-y-6">
                    <div>
                      <label className={labelClass}>Company Name</label>
                      <input type="text" defaultValue="NexHire Solutions" className={inputClass} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Website</label>
                        <div className="relative">
                          <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                          <input type="text" defaultValue="www.nexhire.com" className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Headquarters</label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                          <input type="text" defaultValue="Phnom Penh, Cambodia" className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Admin Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input type="email" defaultValue="admin@nexhire.com" className={`${inputClass} pl-10`} />
                      </div>
                      <p className="text-xs text-[#6b7f79] font-semibold mt-2 ml-1">Used for billing and account alerts</p>
                    </div>

                    <div className="pt-2">
                      <button type="button" className="flex items-center gap-2 bg-[#051612] text-white px-6 py-3 rounded-xl font-extrabold text-sm hover:bg-[#0d2a23] transition-all shadow-sm">
                        <Save size={16} /> Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                <div className="px-8 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-extrabold text-[#071a15]">Security</h2>
                  <p className="text-sm text-[#4a5a55] font-medium mt-0.5">Update your account password</p>
                </div>

                <div className="p-8">
                  <form className="space-y-6 max-w-md">

                    <div>
                      <label className={labelClass}>Current Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          placeholder="Enter current password"
                          className={`${inputClass} pl-10 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] hover:text-[#071a15] transition-colors"
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
                          type={showNew ? 'text' : 'password'}
                          placeholder="Enter new password"
                          className={`${inputClass} pl-10 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] hover:text-[#071a15] transition-colors"
                        >
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#f0f9f6] border border-[#d1e8e3] rounded-xl p-4">
                      <p className="text-xs font-extrabold text-[#071a15] mb-2">Password requirements</p>
                      {['At least 8 characters', 'One uppercase letter', 'One number or symbol'].map((req) => (
                        <div key={req} className="flex items-center gap-2 mt-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#40b594]" />
                          <p className="text-xs text-[#4a5a55] font-medium">{req}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button type="button" className="flex items-center gap-2 bg-[#051612] text-white px-6 py-3 rounded-xl font-extrabold text-sm hover:bg-[#0d2a23] transition-all shadow-sm">
                        <Shield size={16} /> Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">

                <div className="px-8 py-6 border-b border-red-100 bg-red-50/50">
                  <h2 className="text-lg font-extrabold text-red-600">Danger Zone</h2>
                  <p className="text-sm text-red-400 font-medium mt-0.5">These actions are permanent and cannot be undone</p>
                </div>

                <div className="p-8">
                  <div className="border border-red-100 rounded-2xl p-7 bg-red-50/30">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Trash2 size={18} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#071a15]">Delete Company Workspace</h3>
                        <p className="text-sm text-[#4a5a55] font-medium mt-1 leading-relaxed">
                          This will permanently delete your company profile, all active job listings, and applicant history. This action cannot be reversed.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-extrabold text-[#071a15] mb-2">
                          Type <span className="font-black text-red-600 tracking-widest">DELETE</span> to confirm
                        </label>
                        <input
                          type="text"
                          placeholder="Type DELETE here"
                          value={deleteText}
                          onChange={(e) => setDeleteText(e.target.value)}
                          className="w-full max-w-sm px-4 py-3 border border-red-200 rounded-xl bg-white text-[#071a15] text-sm font-medium placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-300/40 focus:border-red-400 transition-all"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={deleteText !== 'DELETE'}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm transition-all ${
                          deleteText === 'DELETE'
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                            : 'bg-red-100 text-red-300 cursor-not-allowed'
                        }`}
                      >
                        <Trash2 size={16} /> Delete Company Account
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