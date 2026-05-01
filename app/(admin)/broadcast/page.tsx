"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Radio, MessageSquare, LogOut,
  Send, X, Globe, Bell
} from 'lucide-react';
import AdminSidebar from "@/components/ui/AdminSidebar";



const audienceOptions = [
  { label: 'All Users', icon: Globe, color: 'text-[#0d1f1a]', bg: 'bg-[#00ffa3]/15', count: 'All registered users' },
  { label: 'Job Seekers', icon: Users, color: 'text-blue-700', bg: 'bg-blue-50', count: 'All job seekers' },
  { label: 'Employers', icon: Building2, color: 'text-purple-700', bg: 'bg-purple-50', count: 'All employers' },
];

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<{ id: number; message: string; audience: string; time: string; sent: number }[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('All Users');
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setSending(true);
    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, audience }),
    });
    if (res.ok) {
      const data = await res.json();
      setBroadcasts(prev => [{ id: Date.now(), message, audience, time: 'Just now', sent: data.sent }, ...prev]);
      setMessage('');
      setShowCompose(false);
    }
    setSending(false);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0d1f1a]">Broadcast</h1>
            <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {broadcasts.length} messages sent this session</p>
          </div>
          <button onClick={() => setShowCompose(true)}
            className="bg-[#0d1f1a] text-[#00ffa3] font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#1a3028] transition-colors shadow-sm">
            <Radio size={16} />New Broadcast
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {audienceOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className={`w-10 h-10 ${opt.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={18} className={opt.color} />
                </div>
                <p className="text-xs font-bold text-gray-400 mb-1">{opt.label}</p>
                <p className="text-2xl font-black text-[#0d1f1a]">—</p>
                <p className="text-[10px] font-bold text-[#6b9e8a] mt-1">{opt.count}</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {broadcasts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-14 h-14 bg-[#f4f7f5] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell size={24} className="text-[#6b9e8a]" />
              </div>
              <p className="font-bold text-[#0d1f1a]">No broadcasts yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "New Broadcast" to send a message to users.</p>
            </div>
          ) : (
            broadcasts.map((b) => {
              const audOpt = audienceOptions.find(a => a.label === b.audience) || audienceOptions[0];
              const AudIcon = audOpt.icon;
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-[#0d1f1a] leading-relaxed mb-3">{b.message}</p>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${audOpt.bg} ${audOpt.color}`}>
                      <AudIcon size={10} />{b.audience}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">{b.time}</span>
                    <span className="text-[11px] text-gray-400 font-medium ml-auto">{b.sent} recipients</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showCompose && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-[#0d1f1a]">New Broadcast</h2>
                <button onClick={() => setShowCompose(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="mb-5">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Send to</p>
                <div className="flex gap-2">
                  {audienceOptions.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button key={opt.label} onClick={() => setAudience(opt.label)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-xs font-bold ${audience === opt.label ? 'border-[#0d1f1a] bg-[#0d1f1a] text-[#00ffa3]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                        <Icon size={16} />{opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Message</p>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your broadcast message..." rows={4}
                  className="w-full bg-[#f4f7f5] border-none rounded-2xl p-4 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30" />
                <p className="text-[11px] text-gray-400 mt-1.5 text-right">{message.length} characters</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowCompose(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold text-sm py-3 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleBroadcast} disabled={!message.trim() || sending}
                  className="flex-1 bg-[#0d1f1a] text-[#00ffa3] font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1a3028] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Send size={15} />{sending ? 'Sending...' : 'Broadcast'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}