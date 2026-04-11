import React from 'react';
import { Search, Paperclip, Send, Settings, MoreVertical } from 'lucide-react';
import Link from 'next/link';

const Messages = () => {
  const chats = [
    {
      id: 1,
      name: 'Marady',
      role: 'ENGINEERING MANAGER',
      lastMsg: '10:30 PM',
      initial: 'M',
      active: true,
    },
    {
      id: 2,
      name: 'Mars',
      role: 'RECRUITER AT STRIPE',
      lastMsg: 'Yesterday',
      initial: 'M',
      active: false,
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
          <Link href="/home_page">
            <button className="hover:text-gray-300 transition-colors">
              Home
            </button>
          </Link>
          <Link href="/my_job">
             <button className="hover:text-gray-300 transition-colors">My Jobs</button>
           </Link> 
           <Link href="/message_j">
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Messages</button>
          </Link>
          <Link href="/notification_j">
            <button className="hover:text-gray-300 transition-colors">Notification</button>
          </Link>
          <Link href="/setting_j">
          <button className="hover:text-gray-300 transition-colors">Settings</button>
          </Link>
        </nav>

        <Link href="/profile_j">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">User name</p>
            <p className="text-sm font-bold">Profile</p>
          </div>
          <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold text-white">U</div>
        </div>
      </Link>
      </header>

      <main className="max-w-6xl mx-auto p-12">
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold text-[#1a1a1a] mb-2">Messages</h1>
          <p className="text-gray-500 font-medium text-lg">Communicate with recruiters and hiring managers</p>
        </div>

        {/* CHAT CONTAINER */}
        <div className="bg-white rounded-[35px] border border-gray-100 shadow-sm overflow-hidden flex h-[700px]">
          
          {/* SIDEBAR - CHAT LIST */}
          <div className="w-1/3 border-r border-gray-100 flex flex-col">
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="search chats..." 
                  className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-0"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`px-6 py-5 flex items-center gap-4 cursor-pointer border-l-4 transition-all ${
                    chat.active ? 'bg-[#f1fcf9] border-[#153a30]' : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="w-12 h-12 bg-[#153a30] rounded-full flex items-center justify-center text-white font-bold">
                    {chat.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-extrabold text-[#1a1a1a] truncate">{chat.name}</h3>
                      <span className="text-[10px] font-bold text-gray-400">{chat.lastMsg}</span>
                    </div>
                    <p className="text-[10px] font-extrabold text-[#40b594] uppercase tracking-wider">{chat.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className="flex-1 flex flex-col bg-white">
            {/* CHAT HEADER */}
            <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#153a30] rounded-full flex items-center justify-center text-white font-bold">U</div>
                <div>
                  <h3 className="font-extrabold text-sm">User name</h3>
                  <p className="text-[10px] text-[#40b594] font-bold">online</p>
                </div>
              </div>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6 flex flex-col">
              {/* Recipient Message */}
              <div className="max-w-[70%] self-start">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <p className="text-sm font-medium text-[#1a1a1a]">Hi! Are you still available for the interview on Monday at 4:30 PM?</p>
                </div>
                <span className="text-[10px] text-gray-400 font-bold mt-2 block ml-1">10:28 AM</span>
              </div>

              {/* User Message */}
              <div className="max-w-[70%] self-end">
                <div className="bg-[#153a30] p-4 rounded-2xl rounded-tr-none shadow-md">
                  <p className="text-sm font-medium text-white">Yes, absolutely! I have it on my calendar. Looking forward to it.</p>
                </div>
                <div className="flex items-center justify-end gap-1 mt-2 mr-1">
                  <span className="text-[10px] text-gray-400 font-bold">10:28 AM</span>
                  <div className="w-3 h-3 text-[#40b594]">✓✓</div>
                </div>
              </div>
            </div>

            {/* INPUT AREA */}
            <div className="p-8">
              <div className="bg-gray-50 rounded-2xl p-2 flex items-center gap-2 border border-gray-100">
                <button className="p-3 text-gray-400 hover:text-[#153a30] transition-colors">
                  <Paperclip size={20} />
                </button>
                <input 
                  type="text" 
                  placeholder="Write a message..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-3 px-2"
                />
                <button className="bg-[#153a30] text-white p-3 rounded-xl hover:bg-[#0d2a23] transition-all shadow-md">
                  <Send size={20} />
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