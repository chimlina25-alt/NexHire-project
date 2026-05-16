"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Send, Pencil, Trash2, X, Archive, RotateCcw,
  MessageSquare, Users, Reply,
} from "lucide-react";
import Link from "next/link";
import EmployerNavProfile from "@/components/ui/EmployerNavProfile";
import {
  Avatar, OnlineDot, AttachButton, AttachmentBubble, AttachmentPreviewBar,
  ReplyBanner, ReadReceipt, UnsendDialog, DeleteConvDialog, PageFileViewer,
  fmt, fmtConv, fmtLastSeen, canEdit, useSmartScroll,
  type ReplyTo, type MsgBase, type FileViewerState,
} from "@/components/ui/MessageShared";

type Conversation = {
  id: string; employerId: string; jobSeekerId: string; jobId: string | null;
  lastMessageAt: string; employerName: string; seekerFirstName: string;
  seekerLastName: string; seekerImage: string | null; archived: boolean; isNew?: boolean;
  isAdminConv?: boolean; adminId?: string; displayName?: string;
};
type Message = MsgBase & { conversationId: string; senderType?: string; };
type Me = { userId: string; role: string; email: string };

async function sf(url: string, opts?: RequestInit) {
  const res = await fetch(url, opts);
  const t = await res.text();
  let d: any = null;
  try { d = t ? JSON.parse(t) : null; } catch { throw new Error("Invalid JSON"); }
  if (!res.ok) throw new Error(d?.error || `Error ${res.status}`);
  return d;
}

export default function EmployerMessages() {
  const [me, setMe] = useState<Me | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [searching, setSearching] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherLastSeen, setOtherLastSeen] = useState<string | null>(null);
  const [unsendTarget, setUnsendTarget] = useState<string | null>(null);
  const [deleteConvTarget, setDeleteConvTarget] = useState<string | null>(null);
  const [fileViewer, setFileViewer] = useState<FileViewerState>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const presenceRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const presencePollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const adminConvIdRef = useRef<string | null>(null);
  const isAdminConvRef = useRef(false);

  useSmartScroll(endRef, messages, activeConvId ?? "");

  useEffect(() => {
    const ping = () => fetch("/api/presence", { method: "POST" });
    ping();
    presenceRef.current = setInterval(ping, 25000);
    window.addEventListener("beforeunload", () => fetch("/api/presence", { method: "DELETE", keepalive: true }));
    return () => { if (presenceRef.current) clearInterval(presenceRef.current); };
  }, []);

  useEffect(() => {
    sf("/api/auth/me").then(setMe).catch(() => {});
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const [data, adminData] = await Promise.all([
        sf("/api/conversations").catch(() => []),
        sf("/api/conversations/search-admin").catch(() => []),
      ]);

      const regularConvs: Conversation[] = data || [];

      const adminConvs: Conversation[] = (adminData || [])
        .filter((a: any) => !a.isNew)
        .map((a: any) => ({
          id: a.id,
          employerId: "",
          jobSeekerId: "",
          jobId: null,
          lastMessageAt: a.lastMessageAt || new Date().toISOString(),
          employerName: "",
          seekerFirstName: "",
          seekerLastName: "",
          seekerImage: null,
          archived: a.archived || false,
          isAdminConv: true,
          adminId: a.adminId,
          displayName: a.displayName || "Support",
          isNew: false,
        }));

      if (adminConvs.length > 0) {
        adminConvIdRef.current = adminConvs[0].id;
      }

      const merged = [...regularConvs, ...adminConvs];
      const seen = new Set<string>();
      const deduped = merged.filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });

      // Sort by most recent message first so admin conv appears in correct position
      const sorted = deduped.sort((a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );

      setConversations(sorted);

      if (!activeConvId) {
        const f = sorted.find(c => !c.archived);
        if (f) setActiveConvId(f.id);
      }
    } catch {} finally { setLoading(false); }
  };

  const fetchMessages = useCallback(async (convId: string, isAdmin: boolean) => {
    if (!convId) return;
    try {
      if (isAdmin) {
        const d = await sf("/api/user/messages");
        setMessages(d?.messages || []);
        if (d?.conversation?.id) adminConvIdRef.current = d.conversation.id;
      } else {
        const d = await sf(`/api/conversations/${convId}/messages`);
        setMessages(d || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const [seekers, admins] = await Promise.all([
          sf(`/api/conversations/search-seekers?q=${encodeURIComponent(search)}`).catch(() => []),
          sf("/api/conversations/search-admin").catch(() => []),
        ]);
        const q = search.toLowerCase();
        const adminMatch = (admins || []).filter((a: any) =>
          a.displayName?.toLowerCase().includes(q) || "admin support".includes(q)
        );
        const normalizedAdmins: Conversation[] = adminMatch.map((a: any) => ({
          id: a.id,
          employerId: "",
          jobSeekerId: "",
          jobId: null,
          lastMessageAt: a.lastMessageAt || new Date().toISOString(),
          employerName: "",
          seekerFirstName: "",
          seekerLastName: "",
          seekerImage: null,
          archived: a.archived || false,
          isAdminConv: true,
          adminId: a.adminId,
          displayName: a.displayName || "Support",
          isNew: a.isNew || false,
        }));
        setSearchResults([...(seekers || []), ...normalizedAdmins]);
      } catch { setSearchResults([]); } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!activeConvId) return;

    // FIX: check all known convs including searchResults, and also match by adminConvIdRef
    const allKnown = [...conversations, ...searchResults];
    const conv = allKnown.find(c => c.id === activeConvId);
    const isAdmin = conv?.isAdminConv
      || isAdminConvRef.current
      || activeConvId === adminConvIdRef.current;

    // FIX: clear messages first so useSmartScroll sees the new batch arrive fresh
    setMessages([]);

    setLoadingMsgs(true);
    fetchMessages(activeConvId, isAdmin).finally(() => setLoadingMsgs(false));
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(activeConvId, isAdmin), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConvId]);

  const pollPresence = useCallback(async (userId: string) => {
    try { const d = await sf(`/api/presence/${userId}`); setOtherOnline(d.isOnline); setOtherLastSeen(d.lastSeenAt); } catch {}
  }, []);

  useEffect(() => {
    if (presencePollRef.current) clearInterval(presencePollRef.current);
    const conv = conversations.find(c => c.id === activeConvId);
    if (!conv || conv.isNew || conv.isAdminConv) return;
    pollPresence(conv.jobSeekerId);
    presencePollRef.current = setInterval(() => pollPresence(conv.jobSeekerId), 15000);
    return () => { if (presencePollRef.current) clearInterval(presencePollRef.current); };
  }, [activeConvId]);

  const displayList = search.trim() ? searchResults : conversations.filter(c => c.archived === showArchived);
  const archivedCount = conversations.filter(c => c.archived).length;
  const activeConv = conversations.find(c => c.id === activeConvId) ?? searchResults.find(c => c.id === activeConvId);
  const getName = (c: Conversation) => c.isAdminConv ? (c.displayName || "Support") : (`${c.seekerFirstName} ${c.seekerLastName}`.trim() || "Job Seeker");
  const getImg = (c: Conversation) => c.isAdminConv ? null : c.seekerImage;

  const openConversation = async (item: Conversation) => {
    setEditingId(null); setInput(""); setMessages([]); setReplyTo(null);

    if (item.isAdminConv) {
      isAdminConvRef.current = true;

      if (!item.isNew && item.id && !item.id.startsWith("admin_")) {
        if (!conversations.find(c => c.id === item.id)) {
          setConversations(p => {
            const seen = new Set<string>();
            return [...p.filter(c => c.id !== item.id), item].filter(c => {
              if (seen.has(c.id)) return false;
              seen.add(c.id);
              return true;
            });
          });
        }
        setActiveConvId(item.id);
        setSearch(""); setSearchResults([]);
        return;
      }

      setSearch(""); setSearchResults([]);
      try {
        const d = await sf("/api/user/messages");
        setMessages(d?.messages || []);
        if (d?.conversation?.id) {
          adminConvIdRef.current = d.conversation.id;
          const adminItem: Conversation = { ...item, id: d.conversation.id, isNew: false };
          setConversations(p => {
            const without = p.filter(c => !c.isAdminConv);
            const seen = new Set<string>();
            return [...without, adminItem].filter(c => {
              if (seen.has(c.id)) return false;
              seen.add(c.id);
              return true;
            });
          });
          setActiveConvId(d.conversation.id);
        } else {
          const tempItem: Conversation = { ...item, isNew: true };
          setConversations(p => {
            if (p.find(c => c.isAdminConv)) return p;
            return [...p, tempItem];
          });
          setActiveConvId(item.id);
        }
      } catch {}
      return;
    }

    isAdminConvRef.current = false;

    if (item.isNew) {
      setConversations(p => {
        if (p.find(c => c.id === item.id)) return p;
        return [...p, item];
      });
      setActiveConvId(item.id);
      setSearch(""); setSearchResults([]);
      try {
        const conv = await sf("/api/conversations/start", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employerId: item.employerId, jobSeekerId: item.jobSeekerId }),
        });
        setConversations(p => {
          const without = p.filter(c => c.id !== item.id);
          if (without.find(c => c.id === conv.id)) return without;
          return [...without, { ...item, id: conv.id, isNew: false }];
        });
        setActiveConvId(conv.id);
        await fetchConversations();
      } catch (e: any) { setChatError(e.message); }
    } else {
      setConversations(p => {
        if (p.find(c => c.id === item.id)) return p;
        return [...p, item];
      });
      setActiveConvId(item.id);
      setSearch(""); setSearchResults([]);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() && !attachment) return;
    if (!activeConvId) return;
    if (editingId) {
      if (!input.trim()) return;
      try {
        await sf(`/api/messages/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: input.trim() }) });
        setMessages(p => p.map(m => m.id === editingId ? { ...m, text: input.trim(), editedAt: new Date().toISOString() } : m));
      } catch (e: any) { alert(e.message); }
      setEditingId(null); setInput(""); return;
    }
    const isAdmin = activeConv?.isAdminConv || isAdminConvRef.current;
    try {
      setSending(true); setChatError(null);
      const fd = new FormData();
      fd.append("text", input.trim());
      if (attachment) fd.append("attachment", attachment);
      if (replyTo) fd.append("replyToId", replyTo.id);
      if (isAdmin) {
        await sf("/api/user/messages", { method: "POST", body: fd });
        const d = await sf("/api/user/messages");
        setMessages(d?.messages || []);
        if (d?.conversation?.id) {
          adminConvIdRef.current = d.conversation.id;
          const adminItem: Conversation = {
            ...(activeConv as Conversation),
            id: d.conversation.id,
            isNew: false,
          };
          setConversations(p => {
            const without = p.filter(c => !c.isAdminConv);
            const seen = new Set<string>();
            return [...without, adminItem].filter(c => {
              if (seen.has(c.id)) return false;
              seen.add(c.id);
              return true;
            });
          });
          setActiveConvId(d.conversation.id);
          isAdminConvRef.current = true;
          await fetchConversations();
        }
      } else {
        await sf(`/api/conversations/${activeConvId}/messages`, { method: "POST", body: fd });
        await fetchMessages(activeConvId, false);
        await fetchConversations();
      }
      setInput(""); setAttachment(null); setReplyTo(null);
    } catch (e: any) { setChatError(e.message || "Failed to send"); } finally { setSending(false); }
  };

  const startEdit = (msg: Message) => {
    setEditingId(msg.id); setInput(msg.text || ""); setReplyTo(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  const cancelEdit = () => { setEditingId(null); setInput(""); };

  const unsendMsg = async (id: string) => {
    try {
      await sf(`/api/messages/${id}`, { method: "DELETE" });
      setMessages(p => p.filter(m => m.id !== id));
    } catch (e: any) { alert(e.message || "Failed"); }
  };

  const deleteConversation = async (convId: string) => {
    try {
      await sf(`/api/conversations/${convId}/delete`, { method: "POST" });
      setConversations(p => p.filter(c => c.id !== convId));
      setMessages([]);
      if (activeConvId === convId) setActiveConvId(null);
    } catch (e: any) { alert(e.message || "Failed to delete"); }
  };

  const archiveConv = async (convId: string, unarchive: boolean) => {
    try {
      await sf(`/api/conversations/${convId}/archive`, { method: unarchive ? "DELETE" : "POST" });
      await fetchConversations();
      if (!unarchive && activeConvId === convId) setActiveConvId(null);
    } catch (e: any) { alert(e.message); }
  };

  const Bubble = ({ msg }: { msg: Message }) => {
    const mine = me?.userId === msg.senderId;
    const isBeingEdited = editingId === msg.id;
    if (msg.deletedBySender && !msg.text && !msg.attachmentUrl) {
      return (
        <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
          <div className="px-4 py-2.5 rounded-2xl border border-dashed border-gray-200 text-xs italic text-gray-400">This message was unsent</div>
        </div>
      );
    }
    if (mine) {
      return (
        <div className={`group flex flex-col items-end gap-1 ${isBeingEdited ? "opacity-60" : ""}`}>
          {msg.replyTo && (
            <div className="max-w-sm mb-1 px-3 py-2 rounded-xl bg-gray-100 border-l-4 border-[#40b594] text-xs text-[#6b7f79]">
              <span className="font-bold text-[#40b594]">↩ </span>{msg.replyTo.text || msg.replyTo.attachmentName || "Attachment"}
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
              <button onClick={() => setReplyTo({ id: msg.id, text: msg.text, senderId: msg.senderId, attachmentName: msg.attachmentName })} className="p-1.5 rounded-lg text-[#6b7f79] hover:text-[#40b594] hover:bg-[#e8f5f1] transition-all"><Reply size={13} /></button>
              {canEdit(msg.createdAt) && msg.text && <button onClick={() => startEdit(msg)} className="p-1.5 rounded-lg text-[#6b7f79] hover:text-[#071a15] hover:bg-gray-100 transition-all"><Pencil size={11} /></button>}
              <button onClick={() => setUnsendTarget(msg.id)} className="p-1.5 rounded-lg text-[#6b7f79] hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={11} /></button>
            </div>
            <div className={`max-w-sm rounded-2xl rounded-br-md border px-4 py-3 shadow-sm transition-all ${isBeingEdited ? "border-[#40b594] bg-[#f0f9f6]" : "border-gray-100 bg-white"}`}>
              {msg.text && <p className="text-sm leading-relaxed text-[#071a15] break-words">{msg.text}</p>}
              <AttachmentBubble url={msg.attachmentUrl} name={msg.attachmentName} type={msg.attachmentType} onOpenFile={setFileViewer} />
              {msg.editedAt && <p className="mt-1 text-[9px] text-[#6b7f79]">edited</p>}
            </div>
          </div>
          <div className="mr-1 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-[#6b7f79]">{fmt(msg.createdAt)}</span>
            <ReadReceipt isRead={msg.isRead} />
          </div>
        </div>
      );
    }
    return (
      <div className="group flex items-end gap-2">
        {activeConv && <Avatar name={getName(activeConv)} image={getImg(activeConv)} size="sm" />}
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
              <button onClick={() => setReplyTo({ id: msg.id, text: msg.text, senderId: msg.senderId, attachmentName: msg.attachmentName })} className="p-1.5 rounded-lg text-[#6b7f79] hover:text-[#40b594] hover:bg-[#e8f5f1] transition-all"><Reply size={13} /></button>
              <button onClick={() => setUnsendTarget(msg.id)} className="p-1.5 rounded-lg text-[#6b7f79] hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={11} /></button>
            </div>
          </div>
          <span className="ml-1 text-[10px] font-semibold text-[#6b7f79]">{fmt(msg.createdAt)}</span>
        </div>
      </div>
    );
  };

  const inputPlaceholder = editingId ? "Edit message — press Enter to save, Esc to cancel" : activeConv?.archived ? "Unarchive to send messages" : "Write a message…";

  return (
    <div className="min-h-screen bg-[#f0f4f3] font-sans">
      <PageFileViewer viewer={fileViewer} onClose={() => setFileViewer(null)} />
      {unsendTarget && <UnsendDialog onConfirm={() => { unsendMsg(unsendTarget); setUnsendTarget(null); }} onCancel={() => setUnsendTarget(null)} />}
      {deleteConvTarget && <DeleteConvDialog onConfirm={() => { deleteConversation(deleteConvTarget); setDeleteConvTarget(null); }} onCancel={() => setDeleteConvTarget(null)} />}

      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5"><img src="/logo.png" alt="NexHire" className="w-8 h-8" /><span className="text-xl font-extrabold tracking-tight">NexHire</span></div>
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

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="mb-6">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#40b594]">Inbox</p>
          <h1 className="text-3xl font-extrabold text-[#071a15]">Messages</h1>
          <p className="mt-1 text-sm font-medium text-[#4a5a55]">Communicate with job seekers & support</p>
        </div>
        {chatError && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600 flex items-center justify-between">
            {chatError}<button onClick={() => setChatError(null)}><X size={14} /></button>
          </div>
        )}
        <div className="flex h-[680px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Sidebar */}
          <div className="flex w-72 flex-shrink-0 flex-col border-r border-gray-100">
            <div className="border-b border-gray-100 p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7f79]" size={15} />
                <input type="text" placeholder="Search job seekers or support…" value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl bg-[#f0f4f3] py-2.5 pl-10 pr-9 text-sm font-medium text-[#071a15] placeholder-[#6b7f79] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 transition-all" />
                {search && <button onClick={() => { setSearch(""); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
              </div>
              {!search && (
                <div className="flex bg-[#f0f4f3] rounded-xl p-1 gap-1">
                  <button onClick={() => setShowArchived(false)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${!showArchived ? "bg-white text-[#071a15] shadow-sm" : "text-[#6b7f79]"}`}>Active</button>
                  <button onClick={() => setShowArchived(true)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${showArchived ? "bg-white text-[#071a15] shadow-sm" : "text-[#6b7f79]"}`}>
                    <Archive size={10} /> Archived
                    {archivedCount > 0 && <span className="bg-[#051612] text-[#40b594] rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black">{archivedCount}</span>}
                  </button>
                </div>
              )}
            </div>
            {search && <div className="px-4 py-2 border-b border-gray-50 bg-[#f0f9f6]"><p className="text-[10px] font-bold uppercase tracking-widest text-[#40b594]">{searching ? "Searching…" : `"${search}"`}</p></div>}
            {!search && <div className="px-4 py-2.5 border-b border-gray-50"><p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7f79]">{showArchived ? "Archived" : "Conversations"}</p></div>}
            <div className="flex-1 overflow-y-auto">
              {(loading && !search) || searching ? (
                <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-[#40b594] border-t-transparent rounded-full animate-spin" /></div>
              ) : displayList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                  {search ? <><Users size={28} className="text-gray-200 mb-2" /><p className="text-xs font-bold text-[#6b7f79]">No results</p></> : showArchived ? <><Archive size={28} className="text-gray-200 mb-2" /><p className="text-xs font-bold text-[#6b7f79]">No archived chats</p></> : <><MessageSquare size={28} className="text-gray-200 mb-2" /><p className="text-xs font-bold text-[#6b7f79]">No conversations yet</p><p className="text-[10px] text-gray-400 mt-1">Search to start chatting</p></>}
                </div>
              ) : displayList.map(conv => (
                <div key={conv.id} onClick={() => openConversation(conv)} className={`group cursor-pointer border-l-4 px-4 py-3.5 transition-all ${activeConvId === conv.id ? "border-l-[#40b594] bg-[#f0f9f6]" : "border-l-transparent hover:bg-[#f8faf9]"}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar name={getName(conv)} image={getImg(conv)} />
                      {!conv.isNew && <OnlineDot online={conv.id === activeConvId ? otherOnline : false} size="sm" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="truncate text-sm font-extrabold text-[#1a2e29]">{getName(conv)}</h3>
                        {!conv.isNew && <span className="ml-2 flex-shrink-0 text-[10px] font-semibold text-[#6b7f79]">{fmtConv(conv.lastMessageAt)}</span>}
                      </div>
                      <p className="text-xs font-medium text-[#6b7f79]">
                        {conv.isNew ? <span className="text-[#40b594] font-bold">✦ Start conversation</span> : conv.isAdminConv ? "Support" : "Job Seeker"}
                      </p>
                    </div>
                    {!conv.isNew && !conv.isAdminConv && (
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={e => { e.stopPropagation(); archiveConv(conv.id, showArchived); }} className="p-1.5 rounded-lg text-[#6b7f79] hover:text-[#071a15] hover:bg-gray-100 transition-all">{showArchived ? <RotateCcw size={12} /> : <Archive size={12} />}</button>
                        <button onClick={e => { e.stopPropagation(); setDeleteConvTarget(conv.id); }} className="p-1.5 rounded-lg text-[#6b7f79] hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat panel */}
          <div className="flex min-w-0 flex-1 flex-col">
            {activeConv ? (
              <>
                <div className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0"><Avatar name={getName(activeConv)} image={getImg(activeConv)} size="lg" /><OnlineDot online={otherOnline} /></div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#071a15]">{getName(activeConv)}</h3>
                      <p className="text-xs font-bold uppercase tracking-wide">{otherOnline ? <span className="text-[#40b594]">Online</span> : otherLastSeen ? <span className="text-[#6b7f79]">Last seen {fmtLastSeen(otherLastSeen)}</span> : <span className="text-[#6b7f79]">Offline</span>}</p>
                      {activeConv.archived && <p className="text-[10px] text-amber-500 font-bold">Archived</p>}
                    </div>
                  </div>
                  {!activeConv.isNew && !activeConv.isAdminConv && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => archiveConv(activeConv.id, activeConv.archived)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-[#6b7f79] hover:text-[#071a15] hover:border-gray-300 transition-all">{activeConv.archived ? <><RotateCcw size={12} /> Unarchive</> : <><Archive size={12} /> Archive</>}</button>
                      <button onClick={() => setDeleteConvTarget(activeConv.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-100 text-xs font-bold text-red-400 hover:text-red-600 hover:border-red-300 transition-all"><Trash2 size={12} /> Delete Chat</button>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8faf9] px-6 py-5">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-[#40b594] border-t-transparent rounded-full animate-spin" /></div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center"><MessageSquare size={32} className="text-gray-200 mb-3" /><p className="text-sm font-medium text-[#6b7f79]">No messages yet. Say hello!</p></div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3"><div className="h-px flex-1 bg-gray-200" /><span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7f79]">Conversation Start</span><div className="h-px flex-1 bg-gray-200" /></div>
                      {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
                      <div ref={endRef} />
                    </>
                  )}
                </div>
                <div className="border-t border-gray-100 bg-white px-6 py-4 flex-shrink-0">
                  {editingId && (
                    <div className="mb-3 flex items-center gap-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-2.5">
                      <Pencil size={13} className="text-amber-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1"><p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-0.5">Editing message</p><p className="text-xs text-amber-700">Press Enter to save · Esc to cancel</p></div>
                      <button onClick={cancelEdit} className="flex-shrink-0 text-amber-400 hover:text-red-500 p-1"><X size={13} /></button>
                    </div>
                  )}
                  {replyTo && !editingId && <ReplyBanner replyTo={replyTo} onClear={() => setReplyTo(null)} />}
                  {attachment && !editingId && <AttachmentPreviewBar file={attachment} onRemove={() => setAttachment(null)} />}
                  <div className={`flex items-center gap-2 rounded-2xl border bg-[#f0f4f3] px-3 py-2.5 transition-all ${editingId ? "border-amber-400 ring-2 ring-amber-400/20" : activeConv.archived ? "opacity-60" : "border-gray-200 focus-within:border-[#40b594] focus-within:ring-2 focus-within:ring-[#40b594]/20"}`}>
                    {!editingId && <AttachButton onImageSelect={setAttachment} onFileSelect={setAttachment} disabled={activeConv.archived} />}
                    <input ref={inputRef} type="text" placeholder={inputPlaceholder} value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } if (e.key === "Escape" && editingId) cancelEdit(); }}
                      disabled={activeConv.archived && !editingId} className="flex-1 border-none bg-transparent text-sm font-medium text-[#071a15] placeholder-[#6b7f79] outline-none disabled:cursor-not-allowed py-1" />
                    <button onClick={handleSubmit} disabled={sending || (!input.trim() && !attachment)} className={`flex-shrink-0 rounded-xl p-2 transition-all ${(input.trim() || attachment) ? editingId ? "bg-amber-500 text-white hover:bg-amber-600 active:scale-95" : "bg-[#051612] text-white hover:bg-[#0d2a23] active:scale-95" : "cursor-not-allowed bg-[#d1e8e3] text-[#6b7f79]"}`}>
                      {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#f8faf9]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100"><MessageSquare size={26} className="text-[#40b594]" /></div>
                  <p className="font-bold text-[#071a15]">Select a conversation</p>
                  <p className="text-sm text-[#6b7f79] mt-1">Or search to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}