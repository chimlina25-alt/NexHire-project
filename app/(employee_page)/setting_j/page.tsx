"use client";
import React from 'react';
import { User, Shield, AlertTriangle, Camera, Mail, Save } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const Settings = () => {
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

        {/* PROFILE FORM CARD */}
       <div className="bg-white rounded-[35px] border border-gray-100 shadow-sm p-10">
  
  {/* HEADER */}
  <div className="flex items-center gap-6 mb-12 w-full">
    
    {/* AVATAR */}
    <div className="relative">
      <div className="w-24 h-24 rounded-full border-4 border-gray-50 bg-[#f1fcf9] flex items-center justify-center text-[#153a30]">
        <User size={48} />
      </div>
      <button className="absolute bottom-0 right-0 bg-[#153a30] text-white p-2 rounded-full border-4 border-white hover:scale-110 transition-transform">
        <Camera size={16} />
      </button>
    </div>

    {/* TEXT + SIGN OUT */}
    <div className="flex justify-between items-start w-full">
      
      {/* LEFT SIDE */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#1a1a1a]">
          Marsslu SMC
        </h2>
        <p className="text-gray-400 font-medium">
          Update your photo and personal details.
        </p>

        <button className="text-[#40b594] hover:text-[#153a30] font-bold text-sm transition-colors">
          Edit Profile
        </button>
      </div>

      {/* RIGHT SIDE */}
      <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold transition self-start">
        Sign Out
      </button>

    </div>
  </div>

  {/* FORM */}
  <form className="space-y-8">
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-2">
        <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">
          First Name
        </label>
        <input 
          type="text" 
          defaultValue="Marsslu"
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40b594]/20 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">
          Last Name
        </label>
        <input 
          type="text" 
          defaultValue="SMC"
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40b594]/20 transition-all"
        />
      </div>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-extrabold text-[#1a1a1a] ml-1">
        Email Address
      </label>

      <div className="relative">
        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="email" 
          defaultValue="marsslu@gmail.com"
          className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-5 py-4 font-medium text-gray-700 focus:outline-none"
        />
      </div>

      <p className="text-[11px] text-gray-400 font-bold italic ml-1">
        Email cannot be changed
      </p>
    </div>

    <button 
      type="button"
      className="bg-[#153a30] text-white px-8 py-4 rounded-xl font-extrabold flex items-center gap-2 hover:bg-[#0d2a23] transition-all shadow-md shadow-[#153a30]/20 mt-4"
    >
      <Save size={20} />
      Save Changed
    </button>

  </form>
</div>
      </main>
    </div>
  );
};

export default Settings;