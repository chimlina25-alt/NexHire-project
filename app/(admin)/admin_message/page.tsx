"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Send, Pencil, X, Archive, RotateCcw,
  MessageSquare, Users, Reply,
} from "lucide-react";
import AdminSidebar from "@/components/ui/AdminSidebar";
import {
  AttachmentBubble, AttachmentPreviewBar, ReplyBanner,
  UnsendDialog, PageFileViewer,
  fmt, fmtLastSeen, canEdit, useSmartScroll,
  type ReplyTo, type FileViewerState,
} from "@/components/ui/MessageShared";


function AdminAttachButton({ onImageSelect, onFileSelect, disabled }: {
  onImageSelect: (f: File) => void; onFileSelect: (f: File) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative flex-shrink-0">
      <input ref={imgRef} type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) onImageSelect(f); setOpen(false); e.target.value = ""; }} />
      <input ref={fileRef} type="file" className="hidden" accept="application/pdf,.doc,.docx,.txt,.zip,.rar,.csv,.xlsx,.json" onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelect(f); setOpen(false); e.target.value = ""; }} />
      <button type="button" onClick={() => !disabled && setOpen(v => !v)} disabled={disabled}
        className={`relative p-2 rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-50 ${open ? "bg-[#40b594]/20 text-[#40b594]" : "text-[#6b7f79] hover:text-[#071a15] hover:bg-gray-200"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
        {open && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#40b594]" />}
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 z-[200]">
          <div className="bg-white rounded-2xl overflow-hidden min-w-[210px]" style={{ boxShadow: "0 20px 60px rgba(5,22,18,0.18),0 4px 16px rgba(5,22,18,0.08)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3.5 pb-2"><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attach</p></div>
            <button type="button" onClick={() => imgRef.current?.click()} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#f0f9f6] transition-all group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div className="text-left"><p className="text-sm font-semibold text-[#071a15]">Photo / Image</p><p className="text-[10px] text-gray-400">JPG, PNG, GIF, WEBP</p></div>
            </button>
            <div className="mx-4 h-px bg-gray-100" />
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#f0f9f6] transition-all group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="text-left"><p className="text-sm font-semibold text-[#071a15]">Document / File</p><p className="text-[10px] text-gray-400">PDF, DOC, TXT, ZIP…</p></div>
            </button>
            <div className="h-2" />
          </div>
          <div className="w-3 h-3 bg-white rotate-45 mx-4 -mt-1.5" style={{ borderRight: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)", boxShadow: "2px 2px 4px rgba(0,0,0,0.04)" }} />
        </div>
      )}
    </div>
  );
}


function AdminAvatar({ name, image, size = "md" }: { name: string; image?: string | null; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const colors = ["bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500", "bg-violet-500", "bg-purple-500"];
  const ci = (name.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={`${sizes[size]} ${colors[ci]} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 overflow-hidden`}>
      {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : name[0]?.toUpperCase()}
    </div>
  );
}


function AdminReadReceipt({ isRead }: { isRead: boolean }) {
  if (isRead) return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#40b594" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" /><polyline points="20 6 9 17 4 12" style={{ transform: "translateX(-4px)" }} />
    </svg>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(107,127,121,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}


function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), dd = Math.floor(h / 24);
  if (dd > 0) return `${dd}d`; if (h > 0) return `${h}h`; if (m > 0) return `${m}m`; return "now";
}


async function sf(url: string, opts?: RequestInit) {
  const res = await fetch(url, opts);
  const t = await res.text();
  let d: any = null;
  try { d = t ? JSON.parse(t) : null; } catch { throw new Error("Invalid JSON"); }
  if (!res.ok) throw new Error(d?.error || `Error ${res.status}`);
  return d;
}


function dedup<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  return arr.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
}


export default function AdminMessages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [archivedConvs, setArchivedConvs] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherLastSeen, setOtherLastSeen] = useState<string | null>(null);
  const [unsendTarget, setUnsendTarget] = useState<string | null>(null);
  const [fileViewer, setFileViewer] = useState<FileViewerState>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const presencePollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useSmartScroll(bottomRef, messages, activeId ?? "");

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(dedup(data.filter((c: any) => !c.archived)));
        setArchivedConvs(dedup(data.filter((c: any) => c.archived)));
        setLoading(false);
      }
    } catch {}
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    if (!convId || convId.startsWith("new_")) return;
    try {
      const res = await fetch(`/api/admin/messages/${convId}`);
      if (res.ok) setMessages(await res.json());
    } catch {}
  }, []);

  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/messages/search-users?q=${encodeURIComponent(q)}`);
      if (res.ok) setSearchResults(dedup(await res.json()));
    } finally { setSearching(false); }
  }, []);

  const pollPresence = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/presence/${userId}`);
      if (res.ok) { const d = await res.json(); setOtherOnline(d.isOnline); setOtherLastSeen(d.lastSeenAt); }
    } catch {}
  }, []);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (!activeId || activeId.startsWith("new_")) return;
    setLoadingMsgs(true);
    fetchMessages(activeId).finally(() => setLoadingMsgs(false));
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(activeId), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeId]);

  useEffect(() => {
    if (presencePollRef.current) clearInterval(presencePollRef.current);
    const all = [...conversations, ...archivedConvs, ...searchResults];
    const active = all.find(c => c.id === activeId);
    if (!active || active.isNew) return;
    pollPresence(active.userId);
    presencePollRef.current = setInterval(() => pollPresence(active.userId), 15000);
    return () => { if (presencePollRef.current) clearInterval(presencePollRef.current); };
  }, [activeId]);

  useEffect(() => {
    const t = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const displayList = query.trim() ? searchResults : (showArchived ? archivedConvs : conversations);
  const allKnown = dedup([...conversations, ...archivedConvs, ...searchResults]);
  const active = allKnown.find(c => c.id === activeId);

  const openConversation = async (item: any) => {
    setEditingId(null); setInput(""); setMessages([]); setReplyTo(null);
    if (item.isNew) {
      setConversations(p => {
        if (p.find(c => c.id === item.id)) return p;
        return dedup([...p, item]);
      });
      setActiveId(item.id);
      setQuery(""); setSearchResults([]);
      try {
        const res = await fetch("/api/admin/messages", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: item.userId }),
        });
        if (res.ok) {
          const conv = await res.json();
          setConversations(p => {
            const without = p.filter(c => c.id !== item.id);
            if (without.find(c => c.id === conv.id)) return dedup(without);
            return dedup([...without, { ...item, ...conv, isNew: false }]);
          });
          setActiveId(conv.id);
          fetchConversations();
        }
      } catch {}
    } else {
      setConversations(p => {
        if (p.find(c => c.id === item.id)) return p;
        return dedup([...p, item]);
      });
      setActiveId(item.id);
      setQuery(""); setSearchResults([]);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() && !attachment) return;
    if (!activeId || activeId.startsWith("new_")) return;
    if (editingId) {
      if (!input.trim()) return;
      try {
        await sf(`/api/admin/messages/${activeId}/edit`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: editingId, text: input.trim() }),
        });
        setMessages(p => p.map(m => m.id === editingId ? { ...m, text: input.trim(), editedAt: new Date().toISOString() } : m));
      } catch (e: any) { alert(e.message || "Failed to edit"); }
      setEditingId(null); setInput(""); return;
    }
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("text", input.trim());
      if (attachment) fd.append("attachment", attachment);
      if (replyTo) fd.append("replyToId", replyTo.id);
      const res = await fetch(`/api/admin/messages/${activeId}`, { method: "POST", body: fd });
      if (res.ok) {
        setInput(""); setAttachment(null); setReplyTo(null);
        await fetchMessages(activeId);
        fetchConversations();
      }
    } finally { setSending(false); }
  };

  const startEdit = (msg: any) => {
    setEditingId(msg.id); setInput(msg.text || ""); setReplyTo(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  const cancelEdit = () => { setEditingId(null); setInput(""); };

  const unsendMsg = (msgId: string) => {
    setMessages(p => p.filter(m => m.id !== msgId));
  };

  const archiveConversation = async (convId: string, unarchive = false) => {
    setArchivingId(convId);
    try {
      await fetch(`/api/admin/messages/${convId}/archive`, { method: unarchive ? "DELETE" : "POST" });
      await fetchConversations();
      if (!unarchive && activeId === convId) setActiveId(null);
    } finally { setArchivingId(null); }
  };

  const Bubble = ({ msg }: { msg: any }) => {
    const isAdmin = msg.senderType === "admin";
    const isBeingEdited = editingId === msg.id;

    if (msg.deletedBySender && !msg.text && !msg.attachmentUrl) {
      return (
        <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
          <div className="px-4 py-2.5 rounded-2xl border border-dashed border-gray-200 text-xs italic text-gray-400">This message was unsent</div>
        </div>
      );
    }

    /* ── Admin bubble (right side) ── */
    if (isAdmin) {
      return (
        <div className={`group flex flex-col items-end gap-1 ${isBeingEdited ? "opacity-60" : ""}`}>
          {msg.replyTo && (
            <div className="max-w-sm mb-1 px-3 py-2 rounded-xl bg-gray-100 border-l-4 border-[#40b594] text-xs text-[#6b7f79]">
              <span className="font-bold text-[#40b594]">↩ </span>{msg.replyTo.text || msg.replyTo.attachmentName || "Attachment"}
            </div>
          )}
          <div className="flex items-end gap-2">
            {/* Action buttons — no delete icon for admin */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
              <button
                onClick={() => setReplyTo({ id: msg.id, text: msg.text, senderId: msg.senderId, attachmentName: msg.attachmentName })}
                className="p-1.5 rounded-lg text-[#6b7f79] hover:text-[#40b594] hover:bg-[#e8f5f1] transition-all"
              >
                <Reply size={13} />
              </button>
              {canEdit(msg.createdAt) && msg.text && (
                <button onClick={() => startEdit(msg)} className="p-1.5 rounded-lg text-[#6b7f79] hover:text-[#071a15] hover:bg-gray-100 transition-all">
                  <Pencil size={11} />
                </button>
              )}
              <button
                onClick={() => setUnsendTarget(msg.id)}
                className="p-1.5 rounded-lg text-[#6b7f79] hover:text-red-500 hover:bg-red-50 transition-all"
              >
                {/* Unsend only — no Trash/Delete icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>

            <div className={`max-w-sm rounded-2xl rounded-br-md border px-4 py-3 shadow-sm transition-all ${isBeingEdited ? "border-[#40b594] bg-[#f0f9f6]" : "border-gray-100 bg-white"}`}>
              {msg.text && <p className="text-sm leading-relaxed text-[#071a15] break-words">{msg.text}</p>}
              <AttachmentBubble url={msg.attachmentUrl} name={msg.attachmentName} type={msg.attachmentType} onOpenFile={setFileViewer} />
              {msg.editedAt && <p className="mt-1 text-[9px] text-[#6b7f79]">edited</p>}
            </div>
          </div>
          <div className="mr-1 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-[#6b7f79]">{fmt(msg.createdAt)}</span>
            <AdminReadReceipt isRead={msg.isRead} />
          </div>
        </div>
      );
    }

    /* ── User bubble (left side) ── */
    return (
      <div className="group flex items-end gap-2">
        <AdminAvatar name={active?.displayName || "U"} image={active?.profileImage} size="sm" />
        <div className="flex flex-col items-start gap-1">
          {msg.replyTo && (
            <div className="max-w-sm mb-1 px-3 py-2 rounded-xl bg-gray-200 border-l-4 border-gray-400 text-xs text-[#6b7f79]">
              <span className="font-bold">↩ </span>{msg.replyTo.text || msg.replyTo.attachmentName || "Attachment"}
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="max-w-sm rounded-2xl rounded-bl-md bg-[#051612] px-4 py-3 text-white shadow-sm">
              {msg.text && <p className="text-sm leading-relaxed break-words">{msg.text}</p>}
              <AttachmentBubble url={msg.attachmentUrl} name={msg.attachmentName} type={msg.attachmentType} dark onOpenFile={setFileViewer} />
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
              <button
                onClick={() => setReplyTo({ id: msg.id, text: msg.text, senderId: msg.senderId, attachmentName: msg.attachmentName })}
                className="p-1.5 rounded-lg text-[#6b7f79] hover:text-[#40b594] hover:bg-[#e8f5f1] transition-all"
              >
                <Reply size={13} />
              </button>
              <button onClick={() => setUnsendTarget(msg.id)} className="p-1.5 rounded-lg text-[#6b7f79] hover:text-red-500 hover:bg-red-50 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>
          </div>
          <span className="ml-1 text-[10px] font-semibold text-[#6b7f79]">{fmt(msg.createdAt)}</span>
        </div>
      </div>
    );
  };

  const inputPlaceholder = editingId ? "Edit message — press Enter to save, Esc to cancel" : active?.archived ? "Unarchive to send messages" : "Write a message…";

  return (
    <div className="flex h-screen bg-[#f0f4f3] font-sans overflow-hidden">
      <PageFileViewer viewer={fileViewer} onClose={() => setFileViewer(null)} />
      {unsendTarget && <UnsendDialog onConfirm={() => { unsendMsg(unsendTarget); setUnsendTarget(null); }} onCancel={() => setUnsendTarget(null)} />}

      <AdminSidebar />

      <div className="flex-1 ml-64 flex flex-col p-6 min-h-0">
        <div className="mb-5 flex-shrink-0">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#40b594]">Inbox</p>
          <h1 className="text-3xl font-extrabold text-[#071a15]">Messages</h1>
          <p className="text-[#4a5a55] text-sm font-medium mt-0.5">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>

        <div className="flex flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-0">
          {/* Sidebar */}
          <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0 min-h-0">
            <div className="p-4 border-b border-gray-100 flex-shrink-0 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7f79] pointer-events-none" size={15} />
                <input type="text" placeholder="Search users…" value={query} onChange={e => setQuery(e.target.value)}
                  className="w-full rounded-xl py-2.5 pl-10 pr-8 text-sm font-medium text-[#071a15] placeholder-[#6b7f79] outline-none border border-gray-200 bg-[#f0f4f3] focus:border-[#40b594] focus:ring-2 focus:ring-[#40b594]/20 transition-all" />
                {query && <button onClick={() => { setQuery(""); setSearchResults([]); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
              </div>
              {!query && (
                <div className="flex bg-[#f0f4f3] rounded-xl p-1 gap-1">
                  <button onClick={() => setShowArchived(false)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${!showArchived ? "bg-white text-[#071a15] shadow-sm" : "text-[#6b7f79] hover:text-[#071a15]"}`}>Active</button>
                  <button onClick={() => setShowArchived(true)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${showArchived ? "bg-white text-[#071a15] shadow-sm" : "text-[#6b7f79] hover:text-[#071a15]"}`}>
                    <Archive size={10} /> Archived
                    {archivedConvs.length > 0 && <span className="bg-[#051612] text-[#40b594] rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black">{archivedConvs.length}</span>}
                  </button>
                </div>
              )}
            </div>

            {query && (
              <div className="px-4 py-2 border-b border-gray-50 bg-[#f0f9f6]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#40b594]">{searching ? "Searching…" : `"${query}"`}</p>
              </div>
            )}
            {!query && (
              <div className="px-4 py-2.5 border-b border-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7f79]">{showArchived ? "Archived" : "Recent"}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {loading && !query ? (
                <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-[#40b594] border-t-transparent rounded-full animate-spin" /></div>
              ) : searching ? (
                <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-[#40b594] border-t-transparent rounded-full animate-spin" /></div>
              ) : displayList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                  {query ? <><Users size={28} className="text-gray-200 mb-2" /><p className="text-xs font-bold text-[#6b7f79]">No users found</p></> : showArchived ? <><Archive size={28} className="text-gray-200 mb-2" /><p className="text-xs font-bold text-[#6b7f79]">No archived chats</p></> : <><MessageSquare size={28} className="text-gray-200 mb-2" /><p className="text-xs font-bold text-[#6b7f79]">No conversations yet</p><p className="text-[10px] text-gray-400 mt-1">Search a user to start chatting</p></>}
                </div>
              ) : displayList.map((item: any) => (
                <div
                  key={item.id}
                  className={`group cursor-pointer border-l-4 px-4 py-3.5 transition-all ${item.id === activeId ? "border-l-[#40b594] bg-[#f0f9f6]" : "border-l-transparent hover:bg-[#f8faf9]"}`}
                  onClick={() => openConversation(item)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <AdminAvatar name={item.displayName || "U"} image={item.profileImage} />
                      {!item.isNew && (
                        <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${item.id === activeId && otherOnline ? "bg-emerald-400" : "bg-gray-300"}`} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="truncate text-sm font-extrabold text-[#1a2e29] pr-2">{item.displayName}</h3>
                        {item.lastMessageAt && !item.isNew && <span className="text-[10px] font-semibold text-[#6b7f79] flex-shrink-0">{timeAgo(item.lastMessageAt)}</span>}
                      </div>
                      <p className="text-xs font-medium text-[#6b7f79] truncate">
                        {item.isNew ? <span className="text-[#40b594] font-bold">✦ Start conversation</span> : (item.lastMessage || "No messages yet")}
                      </p>
                      <span className={`inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide ${item.userRole === "employer" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                        {item.userRole === "employer" ? "Employer" : "Job Seeker"}
                      </span>
                    </div>
                    {!item.isNew && (
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={e => { e.stopPropagation(); archiveConversation(item.id, item.archived); }}
                          disabled={archivingId === item.id}
                          className="p-1.5 rounded-lg text-[#6b7f79] hover:text-[#071a15] hover:bg-gray-100 transition-all"
                        >
                          {item.archived ? <RotateCcw size={12} /> : <Archive size={12} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {active ? (
              <>
                {/* Header */}
                <div className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <AdminAvatar name={active.displayName || "U"} image={active.profileImage} size="lg" />
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white transition-colors ${otherOnline ? "bg-emerald-400" : "bg-gray-300"}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#071a15]">{active.displayName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active.userRole === "employer" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                          {active.userRole === "employer" ? "Employer" : "Job Seeker"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                          {otherOnline
                            ? <span className="text-[#40b594]">Online</span>
                            : otherLastSeen
                              ? <span className="text-[#6b7f79]">Last seen {fmtLastSeen(otherLastSeen)}</span>
                              : <span className="text-[#6b7f79]">Offline</span>}
                        </span>
                        {active.archived && <span className="text-[10px] text-amber-500 font-bold">• Archived</span>}
                      </div>
                    </div>
                  </div>
                  {!active.isNew && (
                    <button
                      onClick={() => archiveConversation(active.id, active.archived)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-[#6b7f79] hover:text-[#071a15] hover:border-gray-300 transition-all"
                    >
                      {active.archived ? <><RotateCcw size={12} /> Unarchive</> : <><Archive size={12} /> Archive</>}
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8faf9] px-6 py-5">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-[#40b594] border-t-transparent rounded-full animate-spin" /></div>
                  ) : active.isNew ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-gray-100"><MessageSquare size={22} className="text-[#40b594]" /></div>
                      <p className="text-sm font-bold text-[#071a15]">Start the conversation</p>
                      <p className="text-xs text-[#6b7f79] mt-1">Send a message to {active.displayName}</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare size={32} className="text-gray-200 mb-3" />
                      <p className="text-sm font-medium text-[#6b7f79]">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] font-bold text-[#6b7f79] uppercase tracking-widest">Conversation Start</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      {messages.map((msg: any) => <Bubble key={msg.id} msg={msg} />)}
                    </>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-100 bg-white px-6 py-4 flex-shrink-0">
                  {editingId && (
                    <div className="mb-3 flex items-center gap-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-2.5">
                      <Pencil size={13} className="text-amber-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-0.5">Editing message</p>
                        <p className="text-xs text-amber-700">Press Enter to save · Esc to cancel</p>
                      </div>
                      <button onClick={cancelEdit} className="flex-shrink-0 text-amber-400 hover:text-red-500 p-1"><X size={13} /></button>
                    </div>
                  )}
                  {replyTo && !editingId && <ReplyBanner replyTo={replyTo} onClear={() => setReplyTo(null)} />}
                  {attachment && !editingId && <AttachmentPreviewBar file={attachment} onRemove={() => setAttachment(null)} />}
                  <div className={`flex items-center gap-2 rounded-2xl border bg-[#f0f4f3] px-3 py-2.5 transition-all ${editingId ? "border-amber-400 ring-2 ring-amber-400/20" : active.archived ? "opacity-60 border-gray-200" : "border-gray-200 focus-within:border-[#40b594] focus-within:ring-2 focus-within:ring-[#40b594]/20"}`}>
                    {!editingId && <AdminAttachButton onImageSelect={setAttachment} onFileSelect={setAttachment} disabled={active.archived} />}
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } if (e.key === "Escape" && editingId) cancelEdit(); }}
                      placeholder={inputPlaceholder}
                      disabled={active.archived && !editingId}
                      className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#071a15] placeholder-[#6b7f79] disabled:cursor-not-allowed py-1"
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={(!input.trim() && !attachment) || sending}
                      className={`flex-shrink-0 rounded-xl p-2 transition-all ${(input.trim() || attachment) ? editingId ? "bg-amber-500 text-white hover:bg-amber-600 active:scale-95" : "bg-[#051612] text-white hover:bg-[#0d2a23] active:scale-95" : "cursor-not-allowed bg-[#d1e8e3] text-[#6b7f79]"}`}
                    >
                      {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#f8faf9]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100"><MessageSquare size={28} className="text-[#40b594]" /></div>
                  <p className="font-bold text-[#071a15] text-base">Select a conversation</p>
                  <p className="text-sm text-[#6b7f79] mt-1">Or search for a user to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}