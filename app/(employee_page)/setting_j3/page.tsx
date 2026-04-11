"use client";
import React from 'react';
import { User, Shield, AlertTriangle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const SettingsDangerZone = () => {
  const pathname = usePathname();
  const tabs = [
    { id: 'profile', name: 'My Profile', path: '/setting_j', icon: <User size={18} /> },
    { id: 'security', name: 'Security', path: '/setting_j2', icon: <Shield size={18} /> },
    { id: 'danger', name: 'Danger Zone', path: '/setting_j3', icon: <AlertTriangle size={18} /> },
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
          <Link href="/my_job">
             <button className="hover:text-gray-300 transition-colors">My Jobs</button>
           </Link> 
           <Link href="/message_j">
          <button className="hover:text-gray-300 transition-colors">Messages</button>
          </Link>
          <Link href="/notification_j">
            <button className="hover:text-gray-300 transition-colors">Notification</button>
          </Link>
          <Link href="/setting_j">
            <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Settings</button>
          </Link>
        </nav>
        <Link href="/profile_j">
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

        {/* DANGER ZONE CARD */}
        <div className="bg-white rounded-[35px] border border-red-100 shadow-sm p-10">
          <div className="bg-red-50/50 border border-red-100 rounded-[25px] p-8">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-red-600 mb-2">Delete Account</h2>
              <p className="text-gray-500 text-sm font-medium">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-extrabold text-[#1a1a1a] block">
                Type "DELETE" to confirm
              </label>
              <input 
                type="text" 
                placeholder="Type DELETE"
                className="w-full max-w-lg bg-blue-50/30 border border-blue-100 rounded-xl px-5 py-4 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-300"
              />
              
              <button 
                type="button"
                className="bg-red-600 text-white px-8 py-3 rounded-xl font-extrabold flex items-center gap-2 hover:bg-red-700 transition-all shadow-md shadow-red-200 mt-2"
              >
                <Trash2 size={18} />
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsDangerZone;