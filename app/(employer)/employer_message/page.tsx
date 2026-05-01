"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Paperclip, Send, Pencil, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import EmployerNavProfile from '@/components/ui/EmployerNavProfile';

const Messages = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchMe(); fetchConversations(); }, []);
  useEffect(() => { if (activeConvId) fetchMessages(activeConvId); }, [activeConvId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function fetchMe() {
    const res = await fetch("/api/auth/me");
    if (res.ok) { const data = await res.json(); setCurrentUserId(data.user?.id); }
  }

  async function fetchConversations() {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !activeConvId) setActiveConvId(data[0].id);
      }
    } finally { setLoading(false); }
  }

  async function fetchMessages(convId: string) {
    const res = await fetch(`/api/conversations/${convId}/messages`);
    if (res.ok) setMessages(await res.json());
  }

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleSend = async () => {
    if (!message.trim() || !activeConvId) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${activeConvId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: message.trim() }) });
    if (res.ok) { const msg = await res.json(); setMessages(prev => [...prev, msg]); setMessage(''); }
    setSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvId) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/conversations/${activeConvId}/messages`, { method: "POST", body: formData });
    if (res.ok) { const msg = await res.json(); setMessages(prev => [...prev, msg]); }
    e.target.value = "";
  };

  const handleEdit = async (msgId: string) => {
    if (!editText.trim()) return;
    const res = await fetch(`/api/messages/${msgId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: editText }) });
    if (res.ok) { const updated = await res.json(); setMessages(prev => prev.map(m => m.id === msgId ? updated : m)); }
    else { const data = await res.json(); alert(data.error || "Cannot edit message"); }
    setEditingId(null); setEditText('');
  };

  const handleDelete = async (msgId: string) => {
    const res = await fetch(`/api/messages/${msgId}`, { method: "DELETE" });
    if (res.ok) setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f3] font-sans">
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="/dashboard"><button className="text-gray-300 hover:text-white transition-colors">Dashboard</button></Link>
          <Link href="/post_job"><button className="text-gray-300 hover:text-white transition-colors">Post Job</button></Link>
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Messages</button>
          <Link href="/employer_notification"><button className="text-gray-300 hover:text-white transition-colors">Notification</button></Link>
          <Link href="/subscription"><button className="text-gray-300 hover:text-white transition-colors">Subscription</button></Link>
          <Link href="/employer_setting"><button className="text-gray-300 hover:text-white transition-colors">Settings</button></Link>
        </nav>
        <EmployerNavProfile />
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-8">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#40b594]">Inbox</p>
          <h1 className="text-4xl font-extrabold text-[#071a15]">Messages</h1>
          <p className="mt-1 font-medium text-[#4a5a55]">Communicate with job seekers and team members</p>
        </div>

        <div className="flex h-[680px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex w-80 flex-shrink-0 flex-col border-r border-gray-100">
            <div className="border-b border-gray-100 p-5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7f79]" size={16} />
                <input type="text" placeholder="Search conversations..." className="w-full rounded-xl bg-[#f0f4f3] py-2.5 pl-10 pr-4 text-sm font-medium text-[#071a15] placeholder-[#6b7f79] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30" />
              </div>
            </div>
            <div className="px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7f79]">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading && <div className="px-5 py-4 text-sm text-[#6b7f79]">Loading...</div>}
              {!loading && conversations.length === 0 && <div className="px-5 py-4 text-sm text-[#6b7f79]">No conversations yet</div>}
              {conversations.map((conv) => (
                <div key={conv.id} onClick={() => setActiveConvId(conv.id)}
                  className={`cursor-pointer border-l-4 px-5 py-4 transition-all ${activeConvId === conv.id ? 'border-l-[#40b594] bg-[#f0f9f6]' : 'border-l-transparent hover:bg-[#f8faf9]'}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#051612] text-base font-extrabold text-white flex-shrink-0">{conv.otherName?.charAt(0) || "?"}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-extrabold text-[#1a2e29]">{conv.otherName}</h3>
                      <p className="mt-0.5 truncate text-xs text-[#6b7f79]">{conv.lastMessage?.text || "No messages yet"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            {activeConv ? (
              <>
                <div className="border-b border-gray-100 bg-white px-7 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#051612] text-sm font-extrabold text-white">{activeConv.otherName?.charAt(0) || "?"}</div>
                    <div><h3 className="text-base font-extrabold text-[#071a15]">{activeConv.otherName}</h3></div>
                  </div>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8faf9] px-7 py-6">
                  {messages.map((msg) => {
                    const isMine = msg.senderId === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "items-end gap-3"}`}>
                        {!isMine && (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#051612] text-xs font-extrabold text-white">{activeConv.otherName?.charAt(0)}</div>
                        )}
                        <div className="group relative max-w-sm">
                          {editingId === msg.id ? (
                            <div className="flex items-center gap-2">
                              <input value={editText} onChange={(e) => setEditText(e.target.value)} className="rounded-xl border border-[#40b594] px-3 py-2 text-sm focus:outline-none" autoFocus />
                              <button onClick={() => handleEdit(msg.id)} className="text-[#40b594] font-bold text-xs">Save</button>
                              <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs">Cancel</button>
                            </div>
                          ) : (
                            <>
                              {msg.attachmentUrl ? (
                                <div className={`rounded-2xl ${isMine ? 'rounded-br-md bg-[#051612]' : 'rounded-bl-md bg-white border border-gray-200'} px-4 py-3 shadow-sm`}>
                                  {msg.attachmentType?.startsWith("image/") ? (
                                    <img src={msg.attachmentUrl} alt={msg.attachmentName} className="max-w-xs rounded-lg" />
                                  ) : (
                                    <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className={`text-sm font-bold ${isMine ? 'text-[#40b594]' : 'text-[#071a15]'} flex items-center gap-2`}>
                                      📎 {msg.attachmentName}
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <div className={`rounded-2xl ${isMine ? 'rounded-br-md bg-[#051612] text-white' : 'rounded-bl-md bg-white border border-gray-200 text-[#071a15]'} px-5 py-3.5 shadow-sm`}>
                                  <p className="text-sm leading-relaxed">{msg.text}</p>
                                </div>
                              )}
                              <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                                <span className="text-[10px] text-[#6b7f79]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {msg.editedAt && <span className="text-[10px] text-[#6b7f79]">(edited)</span>}
                              </div>
                              {isMine && (
                                <div className="absolute -top-6 right-0 hidden group-hover:flex items-center gap-1 bg-white border border-gray-100 rounded-lg px-2 py-1 shadow-sm">
                                  <button onClick={() => { setEditingId(msg.id); setEditText(msg.text || ''); }} className="text-[#6b7f79] hover:text-[#40b594]" title="Edit"><Pencil size={13} /></button>
                                  <button onClick={() => handleDelete(msg.id)} className="text-[#6b7f79] hover:text-red-500" title="Delete"><Trash2 size={13} /></button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-gray-100 bg-white px-7 py-5">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#f0f4f3] px-4 py-3 transition-all focus-within:border-[#40b594] focus-within:ring-2 focus-within:ring-[#40b594]/20">
                    <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 text-[#6b7f79] hover:text-[#071a15]"><Paperclip size={19} /></button>
                    <input type="text" placeholder="Write a message..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 border-none bg-transparent text-sm font-medium text-[#071a15] placeholder-[#6b7f79] outline-none" />
                    <button onClick={handleSend} disabled={!message.trim() || sending}
                      className={`flex-shrink-0 rounded-xl p-2 transition-all ${message.trim() ? 'bg-[#051612] text-white hover:bg-[#0d2a23]' : 'cursor-not-allowed bg-[#d1e8e3] text-[#6b7f79]'}`}>
                      <Send size={17} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#6b7f79]">
                <p className="font-medium">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;