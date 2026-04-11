"use client";
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  href: string;
}
import { 
  LayoutDashboard, Users, Building2, FileText, 
  CreditCard, Radio, MessageSquare, LogOut,
  Search, Paperclip, Send
} from 'lucide-react';

const AdminMessages = () => {
  const pathname = usePathname();

  const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard_ad' },
    { name: 'Manage Users', icon: <Users size={20} />, href: '/manage_user' },
    { name: 'Employers', icon: <Building2 size={20} />, href: '/employer_ad' },
    { name: 'Job Posts', icon: <FileText size={20} />, href: '/job_station' },
    { name: 'Subscription', icon: <CreditCard size={20} />, href: '/subscription_ad' },
    { name: 'Broadcast', icon: <Radio size={20} />, href: '/broadcast' },
    { name: 'Messages', icon: <MessageSquare size={20} />, href: '/message_ad' },
  ];

  const chatList = [
    { name: 'Marady', role: 'Employer', time: '10:30 PM', active: true },
    { name: 'Mars', role: 'Job Seeker', time: 'Yesterday', active: false },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#f1fcf9] border-r border-gray-100 flex flex-col p-8 fixed h-full">
        <div className="flex items-center gap-3 mb-12 ml-2">
          <div className="w-10 h-10  rounded-full flex items-center justify-center">
             <img src="/logo.png" alt="NexHire" />
          </div>
          <span className="text-2xl font-black text-[#153a30] tracking-tight">NexHire</span>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all ${
                  isActive 
                  ? 'bg-[#dcfce7] text-[#16a34a]' 
                  : 'text-[#153a30]/70 hover:bg-white hover:shadow-sm'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-[#dcfce7] p-4 rounded-2xl flex items-center gap-3 border border-green-100">
            <div className="w-10 h-10 bg-[#00ffa3] rounded-xl flex items-center justify-center font-black text-[#153a30]">A</div>
            <div>
              <p className="font-bold text-sm text-[#153a30]">Admin</p>
              <p className="text-[10px] text-gray-500 truncate">Admin67@example.com</p>
            </div>
          </div>
          <Link href="/log_in">
          <button className="w-full bg-[#ff4b4b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
            <LogOut size={20} />
            Sign Out
          </button>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-12 flex flex-col h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-1">Messages</h1>
          <p className="text-gray-400 font-bold tracking-wide text-sm">Apr 28, 2026</p>
        </div>

        {/* MESSAGING INTERFACE */}
        <div className="bg-white rounded-[35px] border border-gray-100 shadow-sm flex flex-1 overflow-hidden">
          {/* CHAT LIST */}
          <div className="w-80 border-r border-gray-50 flex flex-col">
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 text-xs font-medium"
                  placeholder="search chats..."
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chatList.map((chat, i) => (
                <div key={i} className={`p-6 flex items-center gap-4 cursor-pointer transition-colors ${chat.active ? 'bg-[#f1fcf9]' : 'hover:bg-gray-50'}`}>
                  <div className="w-12 h-12 bg-[#153a30] rounded-full flex items-center justify-center text-white font-black">M</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-extrabold text-sm text-[#1a1a1a]">{chat.name}</p>
                      <span className="text-[10px] font-bold text-gray-300">{chat.time}</span>
                    </div>
                    <p className={`text-[10px] font-black uppercase ${chat.active ? 'text-[#16a34a]' : 'text-gray-400'}`}>
                      {chat.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-6 border-b border-gray-50 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#153a30] rounded-full flex items-center justify-center text-white font-black text-xs">U</div>
              <div>
                <p className="font-bold text-sm text-[#1a1a1a]">User name</p>
                <p className="text-[10px] font-black text-[#16a34a]">online</p>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto space-y-6">
              <div className="flex justify-start">
                <div className="max-w-[70%] bg-gray-50 rounded-2xl rounded-tl-none p-5 shadow-sm">
                  <p className="text-sm font-medium text-[#1a1a1a]">Hi, why my subscription is not working?</p>
                  <p className="text-[9px] font-bold text-gray-300 mt-2">10:28</p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[70%] bg-[#153a30] rounded-2xl rounded-tr-none p-5 shadow-sm">
                  <p className="text-sm font-medium text-white">Sorry For that, We will check your subscription now.</p>
                  <div className="flex justify-end items-center gap-1 mt-2">
                    <p className="text-[9px] font-bold text-white/50">10:28</p>
                    <div className="text-[#00ffa3]">✓✓</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50">
              <div className="relative flex items-center gap-4 bg-gray-100 rounded-2xl px-6 py-4">
                <Paperclip className="text-gray-400 cursor-pointer" size={20} />
                <input 
                  type="text" 
                  className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0" 
                  placeholder="Write a message..."
                />
                <button className="bg-[#153a30] text-white p-2 rounded-xl">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminMessages;