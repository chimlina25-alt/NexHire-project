import React from 'react';
import { Settings, CheckCircle, Clock, MoreVertical, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const Notifications = () => {
  const notificationData = [
    {
      id: 1,
      type: 'Applicant',
      title: 'Sok Rathana applied for Frontend Developer',
      description: 'New applicant profile ready.',
      time: '20m ago',
      actionText: 'View Profile',
    },
    {
      id: 2,
      type: 'NexHire',
      title: 'Your Standard Plan has been acticated!',
      description: 'You now have 3 jobs per month.',
      time: '1h ago',
      actionText: 'View Billing',
    },
    {
      id: 3,
      type: 'Applicant',
      title: 'Pi Sari applied for Data Analyst',
      description: 'New applicant profile ready.',
      time: '2h ago',
      actionText: 'View Profile',
    }
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
            <Link href="/dashboard">
          <button className="hover:text-gray-300 transition-colors">
            Dashboard
          </button>
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
            <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Notification</button>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <Link href="/employer_profile">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">User name</p>
              <p className="text-sm font-bold">Profile</p>
            </Link>
          </div>
          <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold text-white">U</div>
          <Link href="/setting">
            <Settings className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={24} />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 pt-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-2">Notifications</h1>
            <p className="text-gray-500 font-medium">Keep track of your professional journey.</p>
          </div>
          <button className="flex items-center gap-2 text-gray-500 hover:text-black font-bold transition-colors mb-1">
            <CheckCircle size={20} className="text-gray-400" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* NOTIFICATION LIST */}
        <div className="space-y-6">
          {notificationData.map((notif) => (
            <div 
              key={notif.id} 
              className="bg-white p-8 rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative group hover:border-[#40b594]/30 transition-all"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-bold text-gray-800">{notif.type}</span>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={14} />
                  <span className="text-xs font-medium">{notif.time}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-[#1a1a1a]">{notif.title}</h3>
                  <p className="text-gray-400 text-sm font-medium">{notif.description}</p>
                </div>
                <button className="p-1 text-gray-400 hover:text-black transition-colors">
                  <MoreVertical size={24} />
                </button>
              </div>

              <button className="mt-6 flex items-center gap-2 bg-[#153a30] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0d2a23] transition-all shadow-md shadow-[#153a30]/20">
                {notif.actionText}
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Notifications;