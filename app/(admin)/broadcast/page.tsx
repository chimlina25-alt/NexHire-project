"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Radio, MessageSquare, LogOut,
  Send, Users2, X, Globe, Bell, Trash2
} from 'lucide-react';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin_dashboard' },
  { name: 'Manage Users', icon: Users, href: '/manage_user' },
  { name: 'Employers', icon: Building2, href: '/admin_employers' },
  { name: 'Job Posts', icon: FileText, href: '/job_station' },
  { name: 'Subscription', icon: CreditCard, href: '/admin_subscription' },
  { name: 'Broadcast', icon: Radio, href: '/broadcast' },
  { name: 'Messages', icon: MessageSquare, href: '/admin_message' },
];

function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-[#0d1f1a] flex flex-col py-8 px-5 fixed h-full z-10">
      <div className="flex items-center gap-2.5 mb-10 px-2">
        <div className="w-8 h-8 bg-[#00ffa3] rounded-lg flex items-center justify-center">
          <span className="text-[#0d1f1a] font-black text-xs">N</span>
        </div>
        <span className="text-white font-black text-lg tracking-tight">NexHire</span>
      </div>
      <p className="text-[#3a5a4f] text-[9px] font-black uppercase tracking-[0.2em] mb-3 px-2">Main Menu</p>
      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isActive ? 'bg-[#00ffa3] text-[#0d1f1a]' : 'text-[#6b9e8a] hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={17} />{item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/5 pt-5 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-[#00ffa3] rounded-lg flex items-center justify-center font-black text-[#0d1f1a] text-xs">A</div>
          <div>
            <p className="text-white font-bold text-xs">Admin</p>
            <p className="text-[#3a5a4f] text-[10px]">Admin67@example.com</p>
          </div>
        </div>
        <Link href="/log_in">
          <button className="w-full bg-red-500/10 text-red-400 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
            <LogOut size={15} />Sign Out
          </button>
        </Link>
      </div>
    </aside>
  );
}

const initialBroadcasts = [
  { id: 1, message: 'New job matching system is live! Check your dashboard to see better-matched opportunities.', audience: 'All Users', time: '30 min ago', reads: 4821, group: 'Today' },
  { id: 2, message: 'System maintenance scheduled for this weekend. Expect 2 hours of downtime on Saturday 2–4 AM.', audience: 'All Users', time: '2 hr ago', reads: 3904, group: 'Today' },
  { id: 3, message: 'Premium employers: Your monthly post credits have been reset. Happy hiring!', audience: 'Employers', time: '4 hr ago', reads: 348, group: 'Today' },
  { id: 4, message: 'New feature: Job seekers can now set availability status on their profile.', audience: 'Job Seekers', time: '1 day ago', reads: 2190, group: 'Yesterday' },
  { id: 5, message: 'Reminder: Please complete your profile for better job match results.', audience: 'Job Seekers', time: '2 days ago', reads: 1870, group: 'Earlier' },
];

const audienceOptions = [
  { label: 'All Users', icon: Globe, color: 'text-[#0d1f1a]', bg: 'bg-[#00ffa3]/15' },
  { label: 'Job Seekers', icon: Users2, color: 'text-blue-700', bg: 'bg-blue-50' },
  { label: 'Employers', icon: Building2, color: 'text-purple-700', bg: 'bg-purple-50' },
];

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState(initialBroadcasts);
  const [showCompose, setShowCompose] = useState(false);
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('All Users');

  const handleBroadcast = () => {
    if (!message.trim()) return;
    setBroadcasts(prev => [{
      id: Date.now(), message, audience, time: 'Just now', reads: 0, group: 'Today'
    }, ...prev]);
    setMessage('');
    setShowCompose(false);
  };

  const groups = [...new Set(broadcasts.map(b => b.group))];

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Broadcast</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">Apr 28, 2026 · {broadcasts.length} messages sent</p>
          </div>
          <button onClick={() => setShowCompose(true)}
            className="bg-[#0d1f1a] text-[#00ffa3] font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#1a3028] transition-colors shadow-sm">
            <Radio size={16} /> New Broadcast
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {audienceOptions.map((opt, i) => {
            const Icon = opt.icon;
            const count = opt.label === 'All Users' ? 5189 : opt.label === 'Job Seekers' ? 4841 : 348;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className={`w-10 h-10 ${opt.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={18} className={opt.color} />
                </div>
                <p className="text-xs font-bold text-gray-400 mb-1">{opt.label}</p>
                <p className="text-2xl font-black text-[#0d1f1a]">{count.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-[#6b9e8a] mt-1">Recipients</p>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gray-200" />

          <div className="space-y-8">
            {groups.map(group => (
              <div key={group}>
                {/* Group Label */}
                <div className="flex items-center gap-3 mb-4 relative">
                  <div className="w-12 h-12 bg-[#0d1f1a] rounded-xl flex items-center justify-center z-10 flex-shrink-0">
                    <Bell size={16} className="text-[#00ffa3]" />
                  </div>
                  <h2 className="font-black text-[#0d1f1a] text-sm uppercase tracking-wider">{group}</h2>
                </div>

                <div className="space-y-3 ml-16">
                  {broadcasts.filter(b => b.group === group).map((b) => {
                    const audOpt = audienceOptions.find(a => a.label === b.audience) || audienceOptions[0];
                    const AudIcon = audOpt.icon;
                    return (
                      <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#0d1f1a] leading-relaxed">{b.message}</p>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all flex-shrink-0">
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${audOpt.bg} ${audOpt.color}`}>
                            <AudIcon size={10} />{b.audience}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">{b.time}</span>
                          {b.reads > 0 && (
                            <span className="text-[11px] text-gray-400 font-medium ml-auto">
                              {b.reads.toLocaleString()} reads
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-[#0d1f1a]">New Broadcast</h2>
                <button onClick={() => setShowCompose(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Audience */}
              <div className="mb-5">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Send to</p>
                <div className="flex gap-2">
                  {audienceOptions.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button key={opt.label} onClick={() => setAudience(opt.label)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-xs font-bold ${
                          audience === opt.label ? 'border-[#0d1f1a] bg-[#0d1f1a] text-[#00ffa3]' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}>
                        <Icon size={16} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Message</p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write your broadcast message..."
                  rows={4}
                  className="w-full bg-[#f4f7f5] border-none rounded-2xl p-4 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30"
                />
                <p className="text-[11px] text-gray-400 mt-1.5 text-right">{message.length} characters</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowCompose(false)}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold text-sm py-3 rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleBroadcast} disabled={!message.trim()}
                  className="flex-1 bg-[#0d1f1a] text-[#00ffa3] font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1a3028] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Send size={15} /> Broadcast
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}