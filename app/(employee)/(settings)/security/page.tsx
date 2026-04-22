"use client";
import React from 'react';
import { User, Shield, AlertTriangle, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const SettingsSecurity = () => {
  const pathname = usePathname();

  const tabs = [
  { id: 'profile', name: 'My Profile', path: '/my_profile', icon: <User size={18} /> },
  { id: 'security', name: 'Security', path: '/security', icon: <Shield size={18} /> },
  { id: 'danger', name: 'Danger Zone', path: '/danger', icon: <AlertTriangle size={18} /> },
];

 return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      {/* HEADER NAVIGATION */}
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">NexHire</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/home_page">
            <button className="hover:text-gray-300 transition-colors">
              Home
            </button>
          </Link>
          <Link href="/saved">
             <button className="hover:text-gray-300 transition-colors">My Jobs</button>
           </Link> 
           <Link href="/message">
          <button className="hover:text-gray-300 transition-colors">Messages</button>
          </Link>
          <Link href="/notification">
            <button className="hover:text-gray-300 transition-colors">Notification</button>
          </Link>
          <Link href="/my_profile">
            <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Settings</button>
          </Link>
        </nav>

        <Link href="/profile">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">User name</p>
            <p className="text-sm font-bold">Profile</p>
          </div>
          <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold text-white">U</div>
        </div>
      </Link>
      </header>

      <main className="max-w-4xl mx-auto p-12">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-[#1a1a1a] mb-2">Settings</h1>
          <p className="text-gray-500 font-medium text-lg">Manage your account preferences and profile settings.</p>
        </div>

        {/* SETTINGS TABS */}
        <div className="flex gap-4 mb-10">
  {tabs.map((tab) => {
    const isActive = pathname === tab.path;

    return (
      <Link key={tab.id} href={tab.path}>
        <div
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer ${
            isActive 
              ? 'bg-[#153a30] text-white shadow-lg shadow-[#153a30]/20' 
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
          }`}
        >
          {tab.icon}
          {tab.name}
        </div>
      </Link>
    );
  })}
</div>

        {/* CHANGE PASSWORD CARD */}
        <div className="bg-white rounded-[35px] border border-gray-100 shadow-sm p-12">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-2">Change Password</h2>
          </div>

          <form className="max-w-2xl space-y-8">
            {/* Current Password */}
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">Current Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Enter current password"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40b594]/20 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Enter new password"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40b594]/20 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">Confirm New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Confirm new password"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40b594]/20 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="button"
              className="bg-[#153a30] text-white px-10 py-4 rounded-xl font-extrabold hover:bg-[#0d2a23] transition-all shadow-md shadow-[#153a30]/20 mt-4"
            >
              Changed Password
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SettingsSecurity;