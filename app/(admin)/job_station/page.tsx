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
  Search, ListFilter
} from 'lucide-react';

const JobStation = () => {
  const pathname = usePathname();

  const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin_dashboard' },
    { name: 'Manage Users', icon: <Users size={20} />, href: '/admin_users' },
    { name: 'Employers', icon: <Building2 size={20} />, href: '/admin_employers' },
    { name: 'Job Posts', icon: <FileText size={20} />, href: '/admin_job_posts' },
    { name: 'Subscription', icon: <CreditCard size={20} />, href: '/admin_subscription' },
    { name: 'Broadcast', icon: <Radio size={20} />, href: '/admin_broadcast' },
    { name: 'Messages', icon: <MessageSquare size={20} />, href: '/admin_message' },
  ];

  const jobPosts = [
    { title: 'Cashier', status: 'Active', postedBy: 'Coffee Corner', date: 'Jan 14,2026' },
    { title: 'Baker', status: 'Active', postedBy: "Mike's Bakery", date: 'Jan 5,2026' },
    { title: 'IT', status: 'Active', postedBy: 'Spendly', date: 'Jan 2,2026' },
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
      <main className="flex-1 ml-72 p-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-1">Job Station</h1>
          <p className="text-gray-400 font-bold tracking-wide text-sm">Apr 28, 2026</p>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[35px] border border-gray-100 shadow-sm p-8">
          {/* SEARCH BAR */}
          <div className="relative mb-10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              className="w-full bg-[#f1fcf9] border-none rounded-full py-4 pl-16 pr-6 text-sm font-medium focus:ring-2 focus:ring-[#00ffa3]/20 transition-all"
              placeholder="Search..."
            />
          </div>

          {/* JOBS TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-6">
              <thead>
                <tr className="text-left text-[10px] font-black text-[#1a1a1a] uppercase tracking-[0.2em]">
                  <th className="px-6 pb-2">Management</th>
                  <th className="px-6 pb-2">Job</th>
                  <th className="px-6 pb-2 text-center">Status</th>
                  <th className="px-6 pb-2 text-center">By</th>
                  <th className="px-6 pb-2 text-right">Posted</th>
                </tr>
              </thead>
              <tbody>
                {jobPosts.map((job, index) => (
                  <tr key={index} className="group">
                    <td className="px-6 py-4">
                      <button className="p-2 text-gray-400 hover:text-[#153a30] transition-colors">
                        <ListFilter size={20} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-[#1a1a1a] text-sm">{job.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00ffa3]" />
                        <span className="text-[10px] font-bold text-gray-600">{job.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold text-gray-400">{job.postedBy}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-bold text-gray-400">{job.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobStation;