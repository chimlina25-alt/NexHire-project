"use client";
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Radio, MessageSquare, LogOut,
  Search, Send, Paperclip, Phone, Video, MoreVertical
} from 'lucide-react';

const sidebarItems = [
  { name: 'Dashboard',    icon: LayoutDashboard, href: '/admin_dashboard' },
  { name: 'Manage Users', icon: Users,           href: '/manage_user' },
  { name: 'Employers',    icon: Building2,        href: '/admin_emplyer' },
  { name: 'Job Posts',    icon: FileText,         href: '/job_station' },
  { name: 'Subscription', icon: CreditCard,       href: '/admin_subscription' },
  { name: 'Broadcast',    icon: Radio,            href: '/broadcast' },
  { name: 'Messages',     icon: MessageSquare,    href: '/admin_message' },
];

interface Message {
  id: number;
  text: string;
  from: 'user' | 'admin';
  time: string;
}

interface Chat {
  id: number;
  name: string;
  role: 'Employer' | 'Job Seeker';
  initials: string;
  color: string;
  time: string;
  lastMsg: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const initialChats: Chat[] = [
  {
    id: 1, name: 'Marady', role: 'Employer', initials: 'MA', color: '#fff3e0',
    time: '10:30 PM', lastMsg: 'Hi, why my subscription is not working?', unread: 1, online: true,
    messages: [
      { id: 1, text: 'Hi, why my subscription is not working?', from: 'user', time: '10:28 PM' },
      { id: 2, text: 'Sorry for that, we will check your subscription now.', from: 'admin', time: '10:29 PM' },
      { id: 3, text: 'Thank you! Please let me know as soon as possible.', from: 'user', time: '10:30 PM' },
    ],
  },
  {
    id: 2, name: 'Mars', role: 'Job Seeker', initials: 'MS', color: '#e3f2fd',
    time: 'Yesterday', lastMsg: 'When will my profile be reviewed?', unread: 0, online: false,
    messages: [
      { id: 1, text: 'Hello! When will my profile be reviewed?', from: 'user', time: '9:00 AM' },
      { id: 2, text: 'Hi Mars! We typically review profiles within 24–48 hours.', from: 'admin', time: '9:15 AM' },
    ],
  },
  {
    id: 3, name: 'Jana Lim', role: 'Employer', initials: 'JL', color: '#e8f5e9',
    time: 'Mon', lastMsg: 'Is the Premium plan worth it?', unread: 2, online: true,
    messages: [
      { id: 1, text: 'Is the Premium plan worth it for a small business?', from: 'user', time: 'Mon 2:10 PM' },
      { id: 2, text: 'Absolutely! Premium gives you 5 active job posts and priority placement.', from: 'admin', time: 'Mon 2:20 PM' },
      { id: 3, text: 'Great, how do I upgrade?', from: 'user', time: 'Mon 2:21 PM' },
    ],
  },
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
            <LogOut size={15} /> Sign Out
          </button>
        </Link>
      </div>
    </aside>
  );
}

export default function AdminMessages() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = chats.find(c => c.id === activeId)!;

  const selectChat = (id: number) => {
    setActiveId(id);
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const send = () => {
    if (!input.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg: Message = { id: Date.now(), text: input.trim(), from: 'admin', time };
    setChats(prev => prev.map(c =>
      c.id === activeId ? { ...c, messages: [...c.messages, msg], lastMsg: input.trim(), time } : c
    ));
    setInput('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length]);

  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const roleStyle = (role: string) =>
    role === 'Employer'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-blue-50 text-blue-700';

  return (
    <div className="flex h-screen bg-[#f4f7f5] font-sans overflow-hidden">
      <Sidebar />

      {/* Page area */}
      <div className="flex-1 ml-64 flex flex-col p-8 min-h-0">

        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl font-black text-[#0d1f1a]">Messages</h1>
          <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">Apr 28, 2026</p>
        </div>

        {/* Chat container */}
        <div className="flex flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-0">

          {/* ── Chat List Panel ── */}
          <div className="w-72 border-r border-gray-50 flex flex-col flex-shrink-0">

            {/* Search */}
            <div className="p-4 border-b border-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full bg-[#f4f7f5] border-none rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-l-2 ${
                    chat.id === activeId
                      ? 'bg-[#f9fffe] border-[#00ffa3]'
                      : 'border-transparent hover:bg-[#f9fafb]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a]"
                      style={{ backgroundColor: chat.color }}
                    >
                      {chat.initials}
                    </div>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold text-sm text-[#0d1f1a] truncate">{chat.name}</p>
                      <span className="text-[9px] font-bold text-gray-400 ml-2 flex-shrink-0">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-gray-400 truncate">{chat.lastMsg}</p>
                      {chat.unread > 0 && (
                        <span className="flex-shrink-0 w-4 h-4 bg-[#0d1f1a] text-[#00ffa3] rounded-full text-[9px] font-black flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                    <span className={`inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide ${roleStyle(chat.role)}`}>
                      {chat.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Chat Window ── */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Chat header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a]"
                    style={{ backgroundColor: active.color }}
                  >
                    {active.initials}
                  </div>
                  {active.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="font-black text-sm text-[#0d1f1a]">{active.name}</p>
                  <p className={`text-[10px] font-bold ${active.online ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {active.online ? '● Online' : 'Offline'} · {active.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {[Phone, Video, MoreVertical].map((Icon, i) => (
                  <button key={i} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors">
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Date separator */}
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Today</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
              {active.messages.map(msg => (
                <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  {msg.from === 'user' && (
                    <div
                      className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black text-[#0d1f1a]"
                      style={{ backgroundColor: active.color }}
                    >
                      {active.initials}
                    </div>
                  )}
                  <div className={`max-w-[65%] px-4 py-3 rounded-2xl ${
                    msg.from === 'admin'
                      ? 'bg-[#0d1f1a] text-white rounded-br-sm'
                      : 'bg-[#f4f7f5] text-[#0d1f1a] rounded-bl-sm border border-gray-100'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1.5 ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[9px] font-bold ${msg.from === 'admin' ? 'text-white/40' : 'text-gray-400'}`}>{msg.time}</span>
                      {msg.from === 'admin' && <span className="text-[10px] text-[#00ffa3]">✓✓</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="px-6 py-4 border-t border-gray-50 flex-shrink-0">
              <div className="flex items-center gap-3 bg-[#f4f7f5] rounded-xl px-4 py-3 border border-gray-100">
                <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                  <Paperclip size={17} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Write a message..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#0d1f1a] placeholder-gray-400"
                />
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                    input.trim()
                      ? 'bg-[#0d1f1a] text-[#00ffa3] hover:bg-[#1a3a2e]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}