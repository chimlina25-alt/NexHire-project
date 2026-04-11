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
  ListFilter
} from 'lucide-react';

const BroadcastPage = () => {
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

  const broadcastHistory = [
    { section: 'Today', items: [
      { text: 'Admin broadcast a new post .', time: '30 mn ago' },
      { text: 'Admin broadcast a new post .', time: '2 h ago' },
      { text: 'Admin broadcast a new post .', time: '4 h ago' },
    ]},
    { section: 'Yesterday', items: [
      { text: 'Admin broadcast a new post .', time: '1 day ago' },
    ]}
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
          <button className="w-full bg-[#ff4b4b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-12">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-1">Broadcast</h1>
            <p className="text-gray-400 font-bold tracking-wide text-sm">Apr 28, 2026</p>
          </div>
          <button className="bg-[#153a30] text-[#00ffa3] px-10 py-3 rounded-xl font-bold hover:bg-[#1a4a3d] transition-all shadow-md">
            Broadcast
          </button>
        </div>

        {/* BROADCAST LIST */}
        <div className="space-y-10 max-w-4xl">
          {broadcastHistory.map((group) => (
            <div key={group.section}>
              <h2 className="text-lg font-extrabold text-[#1a1a1a] mb-6">{group.section}</h2>
              <div className="space-y-4">
                {group.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-6 border-b border-gray-100 last:border-none group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-purple-100 shadow-inner">
                        {/* Placeholder for admin avatar */}
                        <img 
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" 
                          alt="Admin" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-[#1a1a1a] text-base">{item.text}</span>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <span className="text-sm font-bold text-gray-300">{item.time}</span>
                      <button className="text-gray-300 hover:text-[#153a30] transition-colors">
                        <ListFilter size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BroadcastPage;