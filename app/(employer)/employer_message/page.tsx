"use client";

import React, { useState } from 'react';
import { Search, Paperclip, Send, Phone, Video, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(1);
  const [message, setMessage] = useState('');

  const chatList = [
    { id: 1, name: 'Marady', role: 'Engineering Manager', time: '10:30 PM', initial: 'M', unread: 2 },
    { id: 2, name: 'Mars', role: 'Recruiter at Stripe', time: 'Yesterday', initial: 'M', unread: 0 },
  ];

  const activeContact = chatList.find(c => c.id === activeChat);

  return (
    <div className="min-h-screen font-sans" style={{ background: '#f0f4f3' }}>

      {/* ── HEADER ── */}
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="/dashboard">
            <button className="text-gray-300 hover:text-white transition-colors">Dashboard</button>
          </Link>
          <Link href="/post_job">
            <button className="text-gray-300 hover:text-white transition-colors">Post Job</button>
          </Link>
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Messages</button>
          <Link href="/employer_notification">
            <button className="text-gray-300 hover:text-white transition-colors">Notification</button>
          </Link>
          <Link href="/subscription">
            <button className="text-gray-300 hover:text-white transition-colors">Subscription</button>
          </Link>
          <Link href="/setting">
            <button className="text-gray-300 hover:text-white transition-colors">Settings</button>
          </Link>
        </nav>

        <Link href="/emprofile">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Company</p>
              <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors">Profile</p>
            </div>
            <div className="w-10 h-10 bg-[#40b594] rounded-full flex items-center justify-center font-extrabold text-[#051612] text-sm">C</div>
          </div>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">

        {/* ── PAGE TITLE ── */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Inbox</p>
          <h1 className="text-4xl font-extrabold text-[#071a15]">Messages</h1>
          <p className="text-[#4a5a55] font-medium mt-1">Communicate with recruiters and hiring managers</p>
        </div>

        {/* ── CHAT CONTAINER ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden" style={{ height: '680px' }}>

          {/* ── SIDEBAR ── */}
          <div className="w-80 border-r border-gray-100 flex flex-col flex-shrink-0">

            <div className="p-5 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7f79]" size={16} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full bg-[#f0f4f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#071a15] placeholder-[#6b7f79] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 font-medium"
                />
              </div>
            </div>

            <div className="px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7f79]">Recent</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chatList.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all border-l-4 ${
                    activeChat === chat.id
                      ? 'bg-[#f0f9f6] border-l-[#40b594]'
                      : 'border-l-transparent hover:bg-[#f8faf9]'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-[#051612] flex items-center justify-center text-white font-extrabold text-base">
                      {chat.initial}
                    </div>
                    {chat.id === 1 && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#40b594] border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className={`font-extrabold text-sm truncate ${activeChat === chat.id ? 'text-[#071a15]' : 'text-[#1a2e29]'}`}>
                        {chat.name}
                      </h3>
                      <span className="text-[10px] text-[#6b7f79] font-semibold flex-shrink-0 ml-2">{chat.time}</span>
                    </div>
                    <p className="text-xs text-[#40b594] font-bold tracking-wide truncate">{chat.role}</p>
                  </div>

                  {chat.unread > 0 && (
                    <span className="w-5 h-5 bg-[#40b594] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center flex-shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── CHAT WINDOW ── */}
          <div className="flex-1 flex flex-col min-w-0">

            <div className="px-7 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-[#051612] rounded-full flex items-center justify-center font-extrabold text-white text-sm">
                    {activeContact?.initial}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#40b594] border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#071a15] text-sm">{activeContact?.name}</h3>
                  <p className="text-xs text-[#40b594] font-bold">{activeContact?.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2.5 rounded-xl text-[#6b7f79] hover:bg-[#f0f4f3] hover:text-[#071a15] transition-all">
                  <Phone size={18} />
                </button>
                <button className="p-2.5 rounded-xl text-[#6b7f79] hover:bg-[#f0f4f3] hover:text-[#071a15] transition-all">
                  <Video size={18} />
                </button>
                <button className="p-2.5 rounded-xl text-[#6b7f79] hover:bg-[#f0f4f3] hover:text-[#071a15] transition-all">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6" style={{ background: '#f8faf9' }}>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] font-bold text-[#6b7f79] uppercase tracking-widest">Today</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="flex items-end gap-3">
                <div className="w-8 h-8 rounded-full bg-[#051612] flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0">
                  {activeContact?.initial}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <div className="bg-[#051612] text-white px-5 py-3.5 rounded-2xl rounded-bl-md max-w-sm shadow-sm">
                    <p className="text-sm leading-relaxed">Hi! Are you still available for the interview on Monday at 4:30 PM?</p>
                  </div>
                  <span className="text-[10px] text-[#6b7f79] font-semibold ml-1">10:20 AM</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="bg-white border border-gray-200 px-5 py-3.5 rounded-2xl rounded-br-md max-w-sm shadow-sm">
                  <p className="text-sm text-[#071a15] leading-relaxed">Yes, absolutely! I have it on my calendar. Looking forward to it.</p>
                </div>
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="text-[10px] text-[#6b7f79] font-semibold">10:28 AM</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#40b594" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>

            </div>

            <div className="px-7 py-5 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-3 bg-[#f0f4f3] rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-[#40b594] focus-within:ring-2 focus-within:ring-[#40b594]/20 transition-all">
                <button className="text-[#6b7f79] hover:text-[#071a15] transition-colors flex-shrink-0">
                  <Paperclip size={19} />
                </button>
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[#071a15] placeholder-[#6b7f79] font-medium"
                />
                <button
                  className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                    message.trim()
                      ? 'bg-[#051612] text-white hover:bg-[#0d2a23] shadow-sm'
                      : 'bg-[#d1e8e3] text-[#6b7f79] cursor-not-allowed'
                  }`}
                >
                  <Send size={17} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;