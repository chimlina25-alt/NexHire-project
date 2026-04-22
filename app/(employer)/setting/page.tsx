"use client";
import React, { useState } from 'react';
import { 
  Settings,
  User, 
  Shield, 
  AlertTriangle, 
  Camera, 
  Mail, 
  Save, 
  Building2, 
  Globe, 
  MapPin, 
  Trash2, 
  LogOut 
} from 'lucide-react';
import Link from 'next/link';

const EmployerSettingsCombined = () => {
  // Use state to manage which "page" is visible
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Company Profile', icon: <Building2 size={18} /> },
    { id: 'security', name: 'Security', icon: <Shield size={18} /> },
    { id: 'danger', name: 'Danger Zone', icon: <AlertTriangle size={18} /> },
  ];


  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      {/* HEADER NAVIGATION - UNCHANGED */}
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/dashboard">
            <button className="hover:text-gray-300 transition-colors">Dashboard</button>
          </Link>
          <Link href="/post_job">
            <button className="hover:text-gray-300 transition-colors">Post Job</button>
          </Link>
          <Link href="/employer_message">
            <button className="hover:text-gray-300 transition-colors">Messages</button>
          </Link>
          <Link href="/subscription">
            <button className="hover:text-gray-300 transition-colors">Subscription</button>
          </Link>
          <Link href="/employer_notification">
            <button className="hover:text-gray-300 transition-colors">Notification</button>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <Link href="/employer_profile">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">User name</p>
              <p className="text-sm font-bold">Profile</p>
            </Link>
          </div>
          <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold">U</div>
          <Settings className="text-gray-400 cursor-pointer" size={24} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-12">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-[#1a1a1a] mb-2">Settings</h1>
          <p className="text-gray-500 font-medium text-lg">Manage your company branding and account security.</p>
        </div>

        {/* SETTINGS TABS (State Switcher) */}
        <div className="flex gap-4 mb-10">
          {tabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-[#153a30] text-white shadow-lg shadow-[#153a30]/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* RENDER CONTENT BASED ON TAB */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-[35px] border border-gray-100 shadow-sm p-10 animate-in fade-in duration-300">
            {/* PROFILE HEADER */}
            <div className="flex items-center gap-6 mb-12 w-full">
              <div className="relative">
                <div className="w-24 h-24 rounded-[30px] border-4 border-gray-50 bg-[#f1fcf9] flex items-center justify-center text-[#153a30]">
                  <Building2 size={48} />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-[#153a30] text-white p-2.5 rounded-xl border-4 border-white hover:scale-110 transition-transform">
                  <Camera size={16} />
                </button>
              </div>

              <div className="flex justify-between items-start w-full">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1a1a1a]">NexHire Solutions</h2>
                  <p className="text-gray-400 font-medium">Update your company branding and public info.</p>
                  <button className="text-[#40b594] hover:text-[#153a30] font-bold text-sm transition-colors">
                    Preview Public Profile
                  </button>
                </div>
                <button className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-100 transition-all">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>

            {/* COMPANY FORM */}
            <form className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">Company Name</label>
                <input 
                  type="text" 
                  defaultValue="NexHire Solutions"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40b594]/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" defaultValue="www.nexhire.com" className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-5 py-4 font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">Headquarters</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" defaultValue="Phnom Penh" className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-5 py-4 font-medium" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">Admin Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" defaultValue="admin@nexhire.com" className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-5 py-4 font-medium text-gray-700" />
                </div>
                <p className="text-[11px] text-gray-400 font-bold italic ml-1">For billing and account alerts</p>
              </div>

              <button type="button" className="bg-[#153a30] text-white px-8 py-4 rounded-xl font-extrabold flex items-center gap-2 hover:bg-[#0d2a23] transition-all shadow-md shadow-[#153a30]/20">
                <Save size={20} /> Save Changes
              </button>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-[35px] border border-gray-100 shadow-sm p-12 animate-in fade-in duration-300">
            <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-10">Change Password</h2>
            <form className="max-w-2xl space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">Current Password</label>
                <input type="password" placeholder="Enter current password" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40b594]/20 transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">New Password</label>
                <input type="password" placeholder="Enter new password" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40b594]/20 transition-all" />
              </div>
              <button type="button" className="bg-[#153a30] text-white px-10 py-4 rounded-xl font-extrabold hover:bg-[#0d2a23] transition-all shadow-md shadow-[#153a30]/20">
                Update Security
              </button>
            </form>
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="bg-white rounded-[35px] border border-red-100 shadow-sm p-10 animate-in fade-in duration-300">
            <div className="bg-red-50/50 border border-red-100 rounded-[25px] p-8">
              <h2 className="text-xl font-extrabold text-red-600 mb-2">Delete Company Workspace</h2>
              <p className="text-gray-500 text-sm font-medium mb-6">
                This will delete your company profile, all active job listings, and applicant history. This is permanent.
              </p>
              <div className="space-y-4">
                <label className="text-sm font-extrabold text-[#1a1a1a] block">Type "DELETE" to confirm</label>
                <input type="text" placeholder="Type DELETE" className="w-full max-w-lg bg-white border border-red-100 rounded-xl px-5 py-4 font-medium" />
                <button type="button" className="bg-red-600 text-white px-8 py-3 rounded-xl font-extrabold flex items-center gap-2 hover:bg-red-700 transition-all shadow-md">
                  <Trash2 size={18} /> Delete Company Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployerSettingsCombined;