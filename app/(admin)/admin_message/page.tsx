"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Send, Pencil, MessageSquare, Archive,
  RotateCcw, X, ChevronDown, Users
} from 'lucide-react';
import AdminSidebar from "@/components/ui/AdminSidebar";

function canEdit(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() <= 15 * 60 * 1000;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d`;
  if (hrs > 0) return `${hrs}h`;
  if (mins > 0) return `${mins}m`;
  return "now";
}

export default function AdminMessages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [archivedConvs, setArchivedConvs] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active conversations
  const fetchConversations = useCallback(async () => {
    const res = await fetch('/api/admin/messages');
    if (res.ok) {
      const data = await res.json();
      const active = data.filter((c: any) => !c.archived && !c.isNew);
      const archived = data.filter((c: any) => c.archived);
      setConversations(active);
      setArchivedConvs(archived);
      if (!activeId && active.length > 0) setActiveId(active[0].id);
    }
    setLoading(false);
  }, [activeId]);

  // Search users by name
  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    const res = await fetch(`/api/admin/messages/search-users?q=${encodeURIComponent(q)}`);
    if (res.ok) setSearchResults(await res.json());
    setSearching(false);
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    if (convId.startsWith('new_')) return; // no messages yet
    const res = await fetch(`/api/admin/messages/${convId}`);
    if (res.ok) setMessages(await res.json());
  }, []);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (activeId && !activeId.startsWith('new_')) {
      fetchMessages(activeId);
      // Poll every 3 seconds for new messages
      pollRef.current = setInterval(() => fetchMessages(activeId), 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeId, fetchMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchUsers]);

  const displayList = query.trim()
    ? searchResults
    : (showArchived ? archivedConvs : conversations);

  const active = [...conversations, ...archivedConvs, ...searchResults]
    .find(c => c.id === activeId);

  // Start or open conversation
  const openConversation = async (item: any) => {
    if (item.isNew) {
      // Create conversation first
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: item.userId }),
      });
      if (res.ok) {
        const conv = await res.json();
        setActiveId(conv.id);
        setQuery('');
        setSearchResults([]);
        fetchConversations();
      }
    } else {
      setActiveId(item.id);
      setQuery('');
      setSearchResults([]);
    }
  };

  const send = async () => {
    if (!input.trim() || !activeId || activeId.startsWith('new_')) return;
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
    if (!editingId || !editText.trim() || !activeId) return;
    await fetch(`/api/admin/messages/${activeId}/edit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: editingId, text: editText }),
    });
    setEditingId(null);
    setEditText('');
    fetchMessages(activeId);
  };

  const archiveConversation = async (convId: string, unarchive = false) => {
    setArchivingId(convId);
    await fetch(`/api/admin/messages/${convId}/archive`, {
      method: unarchive ? 'DELETE' : 'POST',
    });
    await fetchConversations();
    if (!unarchive && activeId === convId) setActiveId(null);
    setArchivingId(null);
  };

  return (
    <div className="flex h-screen bg-[#f4f7f5] font-sans overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 ml-64 flex flex-col p-8 min-h-0">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl font-black text-[#0d1f1a]">Messages</h1>
          <p className="text-[#6b9e8a] text-sm font-medium mt-0.5">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-0">

          {/* ── Sidebar ── */}
          <div className="w-72 border-r border-gray-50 flex flex-col flex-shrink-0 min-h-0">

            {/* Search */}
            <div className="p-4 border-b border-gray-50 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b9e8a] pointer-events-none" size={14} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search users by name..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full rounded-xl py-2.5 pl-9 pr-8 text-xs font-medium text-[#0d1f1a] placeholder-[#9ab0a8] outline-none border border-gray-200 bg-[#f4f7f5] focus:border-[#00ffa3] focus:ring-2 focus:ring-[#00ffa3]/20 transition-all"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); setSearchResults([]); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Active / Archived toggle */}
              {!query && (
                <div className="flex mt-3 bg-[#f4f7f5] rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setShowArchived(false)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${!showArchived ? 'bg-white text-[#0d1f1a] shadow-sm' : 'text-gray-400 hover:text-[#0d1f1a]'}`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setShowArchived(true)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${showArchived ? 'bg-white text-[#0d1f1a] shadow-sm' : 'text-gray-400 hover:text-[#0d1f1a]'}`}
                  >
                    <Archive size={10} />
                    Archived
                    {archivedConvs.length > 0 && (
                      <span className="bg-[#0d1f1a] text-[#00ffa3] rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black">
                        {archivedConvs.length}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {loading && !query ? (
                <div className="p-4 text-sm text-gray-400 text-center mt-8">Loading...</div>
              ) : searching ? (
                <div className="p-4 text-sm text-gray-400 text-center mt-8">Searching...</div>
              ) : displayList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                  {query ? (
                    <>
                      <Users size={28} className="text-gray-200 mb-2" />
                      <p className="text-xs font-bold text-gray-400">No users found</p>
                      <p className="text-[10px] text-gray-300 mt-1">Try a different name</p>
                    </>
                  ) : showArchived ? (
                    <>
                      <Archive size={28} className="text-gray-200 mb-2" />
                      <p className="text-xs font-bold text-gray-400">No archived chats</p>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={28} className="text-gray-200 mb-2" />
                      <p className="text-xs font-bold text-gray-400">No conversations yet</p>
                      <p className="text-[10px] text-gray-300 mt-1">Search a user to start chatting</p>
                    </>
                  )}
                </div>
              ) : (
                displayList.map((item: any) => (
                  <div
                    key={item.id}
                    className={`group relative flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors border-l-2 ${
                      item.id === activeId
                        ? 'bg-[#f9fffe] border-[#00ffa3]'
                        : 'border-transparent hover:bg-[#f9fafb]'
                    }`}
                    onClick={() => openConversation(item)}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a] bg-[#f4f7f5] flex-shrink-0 overflow-hidden">
                      {item.profileImage
                        ? <img src={item.profileImage} alt={item.displayName} className="w-full h-full object-cover" />
                        : (item.displayName || 'U')[0]?.toUpperCase()
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="font-bold text-xs text-[#0d1f1a] truncate pr-2">{item.displayName}</p>
                        {item.lastMessageAt && !item.isNew && (
                          <span className="text-[9px] text-gray-400 flex-shrink-0">
                            {timeAgo(item.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">
                        {item.isNew ? '✦ Start a conversation' : (item.lastMessage || 'No messages yet')}
                      </p>
                      <span className={`inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                        item.userRole === 'employer' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {item.userRole === 'employer' ? 'Employer' : 'Job Seeker'}
                      </span>
                    </div>

                    {/* Archive / Unarchive button */}
                    {!item.isNew && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveConversation(item.id, item.archived);
                        }}
                        disabled={archivingId === item.id}
                        title={item.archived ? "Unarchive" : "Archive"}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-[#0d1f1a] hover:bg-gray-100 transition-all"
                      >
                        {item.archived
                          ? <RotateCcw size={12} />
                          : <Archive size={12} />
                        }
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Chat panel ── */}
          <div className="flex-1 flex flex-col min-w-0">
            {active ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-[#0d1f1a] bg-[#f4f7f5] overflow-hidden flex-shrink-0">
                      {active.profileImage
                        ? <img src={active.profileImage} alt={active.displayName} className="w-full h-full object-cover" />
                        : (active.displayName || 'U')[0]?.toUpperCase()
                      }
                    </div>
                    <div>
                      <p className="font-black text-sm text-[#0d1f1a]">{active.displayName}</p>
                      <p className="text-[10px] font-bold text-gray-400">
                        {active.userRole === 'employer' ? 'Employer' : 'Job Seeker'}
                        {active.archived && <span className="ml-2 text-amber-500">• Archived</span>}
                      </p>
                    </div>
                  </div>

                  {/* Archive/Unarchive from header */}
                  {!active.isNew && (
                    <button
                      onClick={() => archiveConversation(active.id, active.archived)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-400 hover:border-gray-300 hover:text-[#0d1f1a] transition-all"
                    >
                      {active.archived ? <><RotateCcw size={12} /> Unarchive</> : <><Archive size={12} /> Archive</>}
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 px-6 py-3 flex-shrink-0">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Conversation</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
                  {active.isNew ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-12 h-12 bg-[#f4f7f5] rounded-2xl flex items-center justify-center mb-3">
                        <MessageSquare size={20} className="text-[#6b9e8a]" />
                      </div>
                      <p className="text-sm font-bold text-[#0d1f1a]">Start the conversation</p>
                      <p className="text-xs text-gray-400 mt-1">Send a message to {active.displayName}</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-xs text-gray-400">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isAdmin = msg.senderType === 'admin';
                      if (editingId === msg.id) {
                        return (
                          <div key={msg.id} className="flex justify-end">
                            <div className="max-w-[65%] bg-white border border-gray-200 rounded-2xl p-3 shadow-sm w-full">
                              <input
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                className="w-full text-sm border-none outline-none text-[#0d1f1a]"
                                autoFocus
                              />
                              <div className="flex gap-2 mt-2 justify-end">
                                <button onClick={() => { setEditingId(null); setEditText(''); }} className="text-xs text-gray-400 font-bold px-2 py-1 rounded hover:bg-gray-100">Cancel</button>
                                <button onClick={saveEdit} className="text-xs text-[#00ffa3] font-bold bg-[#0d1f1a] px-3 py-1 rounded-lg">Save</button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          {!isAdmin && (
                            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black text-[#0d1f1a] bg-[#f4f7f5] overflow-hidden">
                              {active.profileImage
                                ? <img src={active.profileImage} alt="" className="w-full h-full object-cover" />
                                : (active.displayName || 'U')[0]?.toUpperCase()
                              }
                            </div>
                          )}
                          <div className="max-w-[65%] group relative">
                            <div className={`px-4 py-3 rounded-2xl ${isAdmin ? 'bg-[#0d1f1a] text-white rounded-br-sm' : 'bg-[#f4f7f5] text-[#0d1f1a] rounded-bl-sm border border-gray-100'}`}>
                              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                              <div className={`flex items-center gap-1 mt-1.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-[9px] font-bold ${isAdmin ? 'text-white/40' : 'text-gray-400'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {msg.editedAt && <span className="text-[9px] text-gray-400 ml-1">(edited)</span>}
                              </div>
                            </div>
                            {isAdmin && canEdit(msg.createdAt) && (
                              <button
                                onClick={() => { setEditingId(msg.id); setEditText(msg.text); }}
                                className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-[#0d1f1a] transition-all"
                              >
                                <Pencil size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-6 py-4 border-t border-gray-50 flex-shrink-0">
                  <div className="flex items-center gap-3 bg-[#f4f7f5] rounded-xl px-4 py-3 border border-gray-200 focus-within:border-[#00ffa3] focus-within:ring-2 focus-within:ring-[#00ffa3]/20 transition-all">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                      placeholder={active.archived ? "Unarchive to send messages" : "Write a message..."}
                      disabled={active.archived}
                      className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#0d1f1a] placeholder-[#9ab0a8] disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={send}
                      disabled={!input.trim() || sending || active.archived}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${input.trim() && !active.archived ? 'bg-[#0d1f1a] text-[#00ffa3] hover:bg-[#1a3a2e]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
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
                  <p className="font-bold text-[#0d1f1a]">Select a conversation</p>
                  <p className="text-sm text-gray-400 mt-1">Or search for a user to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}