"use client";

import React, { useState } from 'react';
import { Search, Paperclip, Send } from 'lucide-react';
import Link from 'next/link';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(1);
  const [message, setMessage] = useState('');

  const chatList = [
    {
      id: 1,
      name: 'Marady',
      role: 'Engineering Manager',
      time: '10:30 PM',
      initial: 'M',
      unread: 2,
      status: 'Online',
    },
    {
      id: 2,
      name: 'Mars',
      role: 'Recruiter at Stripe',
      time: 'Yesterday',
      initial: 'M',
      unread: 0,
      status: 'Away',
    },
  ];

  const activeContact = chatList.find((c) => c.id === activeChat);

  return (
    <div className="min-h-screen bg-[#f0f4f3] font-sans">
      <header className="flex items-center justify-between bg-[#051612] px-8 py-4 text-white">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NexHire" className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/home_page">
            <button className="transition-colors hover:text-gray-300">Home</button>
          </Link>
          <Link href="/saved">
            <button className="transition-colors hover:text-gray-300">My Jobs</button>
          </Link>
          <Link href="/message">
            <button className="border-b-2 border-[#40b594] pb-1 text-[#40b594]">Messages</button>
          </Link>
          <Link href="/notification">
            <button className="transition-colors hover:text-gray-300">Notification</button>
          </Link>
          <Link href="/setting">
            <button className="transition-colors hover:text-gray-300">Settings</button>
          </Link>
        </nav>

        <Link href="/profile">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">User name</p>
              <p className="text-sm font-bold">Profile</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d4f45] font-bold text-white">
              U
            </div>
          </div>
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-8">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#40b594]">Inbox</p>
          <h1 className="text-4xl font-extrabold text-[#071a15]">Messages</h1>
          <p className="mt-1 font-medium text-[#4a5a55]">
            Communicate with recruiters and hiring managers
          </p>
        </div>

        <div className="flex h-[680px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex w-80 flex-shrink-0 flex-col border-r border-gray-100">
            <div className="border-b border-gray-100 p-5">
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7f79]"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full rounded-xl bg-[#f0f4f3] py-2.5 pl-10 pr-4 text-sm font-medium text-[#071a15] placeholder-[#6b7f79] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30"
                />
              </div>
            </div>

            <div className="px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7f79]">
                Recent
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chatList.map((chat) => {
                const isActive = activeChat === chat.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className={`cursor-pointer border-l-4 px-5 py-4 transition-all ${
                      isActive
                        ? 'border-l-[#40b594] bg-[#f0f9f6]'
                        : 'border-l-transparent hover:bg-[#f8faf9]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#051612] text-base font-extrabold text-white">
                          {chat.initial}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                            chat.status === 'Online' ? 'bg-[#40b594]' : 'bg-[#d7b14a]'
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between">
                          <h3
                            className={`truncate text-sm font-extrabold ${
                              isActive ? 'text-[#071a15]' : 'text-[#1a2e29]'
                            }`}
                          >
                            {chat.name}
                          </h3>
                          <span className="ml-2 flex-shrink-0 text-[10px] font-semibold text-[#6b7f79]">
                            {chat.time}
                          </span>
                        </div>

                        <p className="truncate text-xs font-bold tracking-wide text-[#40b594]">
                          {chat.role}
                        </p>

                        <p className="mt-1 text-[11px] font-semibold text-[#7a8b86]">
                          {chat.status}
                        </p>
                      </div>

                      {chat.unread > 0 && (
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#40b594] text-[10px] font-extrabold text-white">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-gray-100 bg-white px-7 py-5">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#051612] text-sm font-extrabold text-white">
                    {activeContact?.initial}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                      activeContact?.status === 'Online' ? 'bg-[#40b594]' : 'bg-[#d7b14a]'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-base font-extrabold text-[#071a15]">
                    {activeContact?.name}
                  </h3>
                  <p className="truncate text-sm font-medium text-[#4f655f]">
                    {activeContact?.role}
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#40b594]">
                    {activeContact?.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto bg-[#f8faf9] px-7 py-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7f79]">
                  Today
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="flex items-end gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#051612] text-xs font-extrabold text-white">
                  {activeContact?.initial}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <div className="max-w-sm rounded-2xl rounded-bl-md bg-[#051612] px-5 py-3.5 text-white shadow-sm">
                    <p className="text-sm leading-relaxed">
                      Hi! Are you still available for the interview on Monday at 4:30 PM?
                    </p>
                  </div>
                  <span className="ml-1 text-[10px] font-semibold text-[#6b7f79]">10:20 AM</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="max-w-sm rounded-2xl rounded-br-md border border-gray-200 bg-white px-5 py-3.5 shadow-sm">
                  <p className="text-sm leading-relaxed text-[#071a15]">
                    Yes, absolutely! I have it on my calendar. Looking forward to it.
                  </p>
                </div>
                <div className="mr-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-[#6b7f79]">10:28 AM</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#40b594"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white px-7 py-5">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#f0f4f3] px-4 py-3 transition-all focus-within:border-[#40b594] focus-within:ring-2 focus-within:ring-[#40b594]/20">
                <button className="flex-shrink-0 text-[#6b7f79] transition-colors hover:text-[#071a15]">
                  <Paperclip size={19} />
                </button>
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 border-none bg-transparent text-sm font-medium text-[#071a15] placeholder-[#6b7f79] outline-none"
                />
                <button
                  className={`flex-shrink-0 rounded-xl p-2 transition-all ${
                    message.trim()
                      ? 'bg-[#051612] text-white shadow-sm hover:bg-[#0d2a23]'
                      : 'cursor-not-allowed bg-[#d1e8e3] text-[#6b7f79]'
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
