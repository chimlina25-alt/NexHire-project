"use client";
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Radio, MessageSquare, LogOut,
  Search, Send, Pencil, X, Check
} from 'lucide-react';
import AdminSidebar from "@/components/ui/AdminSidebar";




function canEdit(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() <= 15 * 60 * 1000;
}

export default function AdminMessages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/messages');
    if (res.ok) {
      const data = await res.json();
      setConversations(data);
      if (data.length > 0 && !activeId) setActiveId(data[0].id);
    }
    setLoading(false);
  };

  const fetchMessages = async (convId: string) => {
    const res = await fetch(`/api/admin/messages/${convId}`);
    if (res.ok) setMessages(await res.json());
  };

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { if (activeId) fetchMessages(activeId); }, [activeId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !activeId) return;
    setSending(true);
    const res = await fetch(`/api/admin/messages/${activeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input.trim() }),
    });
    if (res.ok) {
      setInput('');
      fetchMessages(activeId);
      fetchConversations();
    }
    setSending(false);
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    await fetch(`/api/admin/messages/${activeId}/edit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: editingId, text: editText }),
    });
    setEditingId(null);
    setEditText('');
    if (activeId) fetchMessages(activeId);
  };

  const active = conversations.find(c => c.id === activeId);
  const filteredConvs = conversations.filter(c =>
    c.displayName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f4f7f5] font-sans overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 ml-64 flex flex-col p-8 min-h-0">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl font-black text-[#0d1f1a]">Messages</h1>
          <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="flex flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-0">
          <div className="w-72 border-r border-gray-50 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input type="text" placeholder="Search chats..." value={query} onChange={e => setQuery(e.target.value)}
                  className="w-full bg-[#f4f7f5] border-none rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00ffa3]/30" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm text-gray-400">Loading conversations...</div>
              ) : filteredConvs.length === 0 ? (
                <div className="p-4 text-sm text-gray-400">No conversations yet.</div>
              ) : (
                filteredConvs.map(chat => (
                  <button key={chat.id} onClick={() => setActiveId(chat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-l-2 ${chat.id === activeId ? 'bg-[#f9fffe] border-[#00ffa3]' : 'border-transparent hover:bg-[#f9fafb]'}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a] bg-[#f4f7f5] flex-shrink-0">
                      {(chat.displayName || 'U')[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="font-bold text-sm text-[#0d1f1a] truncate">{chat.displayName}</p>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{chat.lastMessage || 'No messages yet'}</p>
                      <span className={`inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide ${chat.userRole === 'employer' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                        {chat.userRole === 'employer' ? 'Employer' : 'Job Seeker'}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            {active ? (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a] bg-[#f4f7f5]">
                      {(active.displayName || 'U')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-sm text-[#0d1f1a]">{active.displayName}</p>
                      <p className="text-[10px] font-bold text-gray-400 capitalize">{active.userRole === 'employer' ? 'Employer' : 'Job Seeker'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-6 py-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Conversation</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
                  {messages.map(msg => {
                    const isAdmin = msg.senderType === 'admin';
                    if (editingId === msg.id) {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div className="max-w-[65%] bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                            <input value={editText} onChange={e => setEditText(e.target.value)} className="w-full text-sm border-none outline-none" autoFocus />
                            <div className="flex gap-2 mt-2 justify-end">
                              <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 font-bold">Cancel</button>
                              <button onClick={saveEdit} className="text-xs text-[#00ffa3] font-bold bg-[#0d1f1a] px-2 py-1 rounded-lg">Save</button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        {!isAdmin && (
                          <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black text-[#0d1f1a] bg-[#f4f7f5]">
                            {(active.displayName || 'U')[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className={`max-w-[65%] group relative`}>
                          <div className={`px-4 py-3 rounded-2xl ${isAdmin ? 'bg-[#0d1f1a] text-white rounded-br-sm' : 'bg-[#f4f7f5] text-[#0d1f1a] rounded-bl-sm border border-gray-100'}`}>
                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                            <div className={`flex items-center gap-1 mt-1.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <span className={`text-[9px] font-bold ${isAdmin ? 'text-white/40' : 'text-gray-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {msg.editedAt && <span className="text-[9px] text-gray-400">(edited)</span>}
                            </div>
                          </div>
                          {isAdmin && canEdit(msg.createdAt) && (
                            <button onClick={() => { setEditingId(msg.id); setEditText(msg.text); }}
                              className="absolute -top-5 right-0 opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-[#0d1f1a] transition-all">
                              <Pencil size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <div className="px-6 py-4 border-t border-gray-50 flex-shrink-0">
                  <div className="flex items-center gap-3 bg-[#f4f7f5] rounded-xl px-4 py-3 border border-gray-100">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                      placeholder="Write a message..." className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#0d1f1a] placeholder-gray-400" />
                    <button onClick={send} disabled={!input.trim() || sending}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${input.trim() ? 'bg-[#0d1f1a] text-[#00ffa3] hover:bg-[#1a3a2e]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 bg-[#f4f7f5] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={24} className="text-[#6b9e8a]" />
                  </div>
                  <p className="font-bold text-[#0d1f1a]">No conversations yet</p>
                  <p className="text-sm text-gray-400 mt-1">Users will appear here when they message support.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}