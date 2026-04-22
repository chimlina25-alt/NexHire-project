import React from 'react';
import { Settings, Search, Paperclip, Send, User } from 'lucide-react';
import Link from 'next/link';

const Messages = () => {
  const chatList = [
    { id: 1, name: 'Marady', role: 'ENGINEERING MANAGER', time: '10:30 PM', active: true, initial: 'M' },
    { id: 2, name: 'Mars', role: 'RECRUITER AT STRIPE', time: 'Yesterday', active: false, initial: 'M' },
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
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Messages</button>
          <Link href="/subscription">
            <button className="hover:text-gray-300 transition-colors">Subscription</button>
          </Link>
          <Link href="/employer_notification">
            <button className="hover:text-gray-300 transition-colors">Notification</button>
          </Link>
        </nav>


        <div className="flex items-center gap-4">
          <div className="text-right">
            <Link href="/emprofile">
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

      <main className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">Messages</h1>
        <p className="text-gray-500 mb-8">Communicate with recruiters and hiring managers</p>

        {/* MAIN CHAT CONTAINER */}
        <div className="bg-white rounded-[35px] shadow-sm border border-gray-100 flex h-[700px] overflow-hidden">
          
          {/* SIDEBAR: CHAT LIST */}
          <div className="w-1/3 border-r border-gray-100 flex flex-col">
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="search chats..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#40b594]/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chatList.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`flex items-center gap-4 p-6 cursor-pointer transition-colors ${chat.active ? 'bg-[#f1fcf9]' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#153a30] flex items-center justify-center text-white font-bold text-lg">
                    {chat.initial}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold ${chat.active ? 'text-[#153a30]' : 'text-gray-800'}`}>{chat.name}</h3>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">{chat.time}</span>
                    </div>
                    <p className="text-[10px] text-[#00a37b] font-bold tracking-wider mt-0.5">{chat.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className="flex-1 flex flex-col bg-white">
            {/* CHAT HEADER */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold text-white text-sm">U</div>
              <div>
                <h3 className="font-bold text-gray-800">User name</h3>
                <span className="text-[10px] text-[#00a37b] font-bold">online</span>
              </div>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-white">
              {/* Recipient Message */}
              <div className="flex flex-col items-start">
                <div className="bg-[#153a30] text-white p-4 rounded-2xl rounded-tl-none max-w-md shadow-sm">
                  <p className="text-sm">Hi! Are you still available for the interview on Monday at 4:30 PM?</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-2 font-medium">10:20 AM</span>
              </div>

              {/* User Message */}
              <div className="flex flex-col items-end">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tr-none max-w-md shadow-sm">
                  <p className="text-sm text-gray-700">Yes, absolutely! I have it on my calendar. Looking forward to it.</p>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[10px] text-gray-400 font-medium">10:28 AM</span>
                  <div className="text-[#00a37b]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* MESSAGE INPUT */}
            <div className="p-6">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-2 flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Paperclip size={20} />
                </button>
                <input 
                  type="text" 
                  placeholder="Write a message..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
                />
                <button className="bg-[#153a30] text-white p-2 rounded-xl hover:bg-[#0d2a23] transition-all">
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

export default Messages;