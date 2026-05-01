"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Paperclip, Send, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import UserNavProfile from "@/components/ui/UserNavProfile";

type Conversation = {
  id: string;
  employerId: string;
  jobSeekerId: string;
  jobId: string | null;
  lastMessageAt: string;
  employerName: string;
  employerImage: string | null;
  seekerFirstName: string;
  seekerLastName: string;
  seekerImage: string | null;
};
type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  editedAt: string | null;
  createdAt: string;
};
type Me = { userId: string; role: "employer" | "job_seeker"; email: string };

async function safeFetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Invalid JSON response from ${url}`);
  }
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data;
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
function formatConversationTime(dateString: string) {
  const date = new Date(dateString),
    now = new Date();
  if (date.toDateString() === now.toDateString()) return formatTime(dateString);
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}
function canEdit(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() <= 15 * 60 * 1000;
}

export default function Messages() {
  const [me, setMe] = useState<Me | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const data = await safeFetchJson("/api/auth/me");
        setMe(data);
      } catch {
        setChatError("Failed to load user info");
      }
    };
    loadMe();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoadingChats(true);
      const data = await safeFetchJson("/api/conversations");
      setConversations(data || []);
      if (!activeChat && data?.length) setActiveChat(data[0].id);
    } catch {
      setConversations([]);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const data = await safeFetchJson(
        `/api/conversations/${conversationId}/messages`
      );
      setMessages(data || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeChat) fetchMessages(activeChat);
  }, [activeChat]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter conversations by employer name (search field)
  // Works for both job-seeker view (searches employerName)
  // and employer view (searches seeker name via otherName)
  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => {
      const nameToSearch =
        me?.role === "employer"
          ? `${conv.seekerFirstName} ${conv.seekerLastName}`.toLowerCase()
          : (conv.employerName || "").toLowerCase();
      return nameToSearch.includes(q);
    });
  }, [conversations, search, me?.role]);

  const activeConversation = conversations.find((c) => c.id === activeChat);

  const sendMessage = async () => {
    if (!activeChat || (!message.trim() && !attachment)) return;
    try {
      setSending(true);
      setChatError(null);
      const formData = new FormData();
      formData.append("text", message.trim());
      if (attachment) formData.append("attachment", attachment); // field name matches backend
      await safeFetchJson(`/api/conversations/${activeChat}/messages`, {
        method: "POST",
        body: formData,
      });
      setMessage("");
      setAttachment(null);
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
      await fetchMessages(activeChat);
      await fetchConversations();
    } catch (err: any) {
      setChatError(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await safeFetchJson(`/api/messages/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingText }),
      });
      setEditingId(null);
      setEditingText("");
      await fetchMessages(activeChat);
    } catch (err: any) {
      alert(err.message || "Failed to edit");
    }
  };

  const deleteForMe = async (messageId: string) => {
    try {
      await safeFetchJson(`/api/messages/${messageId}`, { method: "DELETE" });
      await fetchMessages(activeChat);
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  // Display name helper
  const getConvDisplayName = (conv: Conversation) => {
    if (me?.role === "employer") {
      return `${conv.seekerFirstName} ${conv.seekerLastName}`.trim() || "Job Seeker";
    }
    return conv.employerName || "Employer";
  };

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
        <UserNavProfile />
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-8">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#40b594]">Inbox</p>
          <h1 className="text-4xl font-extrabold text-[#071a15]">Messages</h1>
          <p className="mt-1 font-medium text-[#4a5a55]">Communicate with employers directly</p>
        </div>

        {chatError && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
            {chatError}
          </div>
        )}

        <div className="flex h-[680px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* ── Sidebar ── */}
          <div className="flex w-80 flex-shrink-0 flex-col border-r border-gray-100">
            {/* Search */}
            <div className="border-b border-gray-100 p-5">
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7f79]"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
              {loadingChats ? (
                <div className="px-5 py-4 text-sm text-[#6b7f79]">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="px-5 py-4 text-sm text-[#6b7f79]">
                  {search ? "No conversations match your search." : "No conversations yet."}
                </div>
              ) : (
                filteredConversations.map((chat) => {
                  const isActive = activeChat === chat.id;
                  const displayName = getConvDisplayName(chat);
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={`cursor-pointer border-l-4 px-5 py-4 transition-all ${
                        isActive
                          ? "border-l-[#40b594] bg-[#f0f9f6]"
                          : "border-l-transparent hover:bg-[#f8faf9]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#051612] text-base font-extrabold text-white">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#40b594]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center justify-between">
                            <h3
                              className={`truncate text-sm font-extrabold ${
                                isActive ? "text-[#071a15]" : "text-[#1a2e29]"
                              }`}
                            >
                              {displayName}
                            </h3>
                            <span className="ml-2 flex-shrink-0 text-[10px] font-semibold text-[#6b7f79]">
                              {formatConversationTime(chat.lastMessageAt)}
                            </span>
                          </div>
                          <p className="truncate text-xs font-bold tracking-wide text-[#40b594]">
                            {me?.role === "employer" ? "Job Seeker" : "Employer"}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold text-[#7a8b86]">Active</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Chat panel ── */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Chat header */}
            <div className="border-b border-gray-100 bg-white px-7 py-5">
              {activeConversation ? (
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#051612] text-sm font-extrabold text-white">
                      {getConvDisplayName(activeConversation).charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#40b594]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-extrabold text-[#071a15]">
                      {getConvDisplayName(activeConversation)}
                    </h3>
                    <p className="truncate text-sm font-medium text-[#4f655f]">
                      {me?.role === "employer" ? "Job Seeker" : "Employer"}
                    </p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#40b594]">
                      Active
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#6b7f79]">Select a conversation</p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-6 overflow-y-auto bg-[#f8faf9] px-7 py-6">
              {loadingMessages ? (
                <div className="text-sm text-[#6b7f79]">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-sm text-[#6b7f79]">No messages yet.</div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7f79]">
                      Conversation
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  {messages.map((msg) => {
                    const mine = me?.userId === msg.senderId;

                    if (editingId === msg.id) {
                      return (
                        <div key={msg.id} className="flex flex-col items-end gap-2">
                          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              rows={3}
                              className="w-full resize-none bg-transparent text-sm text-[#071a15] outline-none"
                            />
                            <div className="mt-3 flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingText("");
                                }}
                                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-[#6b7f79]"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveEdit}
                                className="rounded-xl bg-[#051612] px-3 py-2 text-xs font-bold text-white"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (mine) {
                      return (
                        <div key={msg.id} className="flex flex-col items-end gap-1">
                          <div className="max-w-sm rounded-2xl rounded-br-md border border-gray-200 bg-white px-5 py-3.5 shadow-sm">
                            {msg.text && (
                              <p className="text-sm leading-relaxed text-[#071a15]">{msg.text}</p>
                            )}
                            {msg.attachmentUrl && (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 block text-xs font-bold text-[#40b594] underline"
                              >
                                {msg.attachmentName || "Open attachment"}
                              </a>
                            )}
                            {msg.editedAt && (
                              <p className="mt-2 text-[10px] font-semibold text-[#6b7f79]">
                                Edited
                              </p>
                            )}
                          </div>
                          <div className="mr-1 flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-[#6b7f79]">
                              {formatTime(msg.createdAt)}
                            </span>
                            {canEdit(msg.createdAt) && (
                              <button
                                onClick={() => {
                                  setEditingId(msg.id);
                                  setEditingText(msg.text || "");
                                }}
                                className="text-[#6b7f79] hover:text-[#071a15]"
                              >
                                <Pencil size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteForMe(msg.id)}
                              className="text-[#6b7f79] hover:text-red-500"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className="flex items-end gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#051612] text-xs font-extrabold text-white">
                          {activeConversation
                            ? getConvDisplayName(activeConversation).charAt(0).toUpperCase()
                            : "?"}
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <div className="max-w-sm rounded-2xl rounded-bl-md bg-[#051612] px-5 py-3.5 text-white shadow-sm">
                            {msg.text && (
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                            )}
                            {msg.attachmentUrl && (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 block text-xs font-bold text-[#40b594] underline"
                              >
                                {msg.attachmentName || "Open attachment"}
                              </a>
                            )}
                          </div>
                          <span className="ml-1 text-[10px] font-semibold text-[#6b7f79]">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input bar */}
            <div className="border-t border-gray-100 bg-white px-7 py-5">
              {attachment && (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-[#f8faf9] px-4 py-2">
                  <p className="truncate text-xs font-semibold text-[#071a15]">{attachment.name}</p>
                  <button
                    onClick={() => {
                      setAttachment(null);
                      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
                    }}
                    className="text-[#6b7f79] hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#f0f4f3] px-4 py-3 transition-all focus-within:border-[#40b594] focus-within:ring-2 focus-within:ring-[#40b594]/20">
                <button
                  className="flex-shrink-0 text-[#6b7f79] transition-colors hover:text-[#071a15]"
                  onClick={() => attachmentInputRef.current?.click()}
                >
                  <Paperclip size={19} />
                </button>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                />
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1 border-none bg-transparent text-sm font-medium text-[#071a15] placeholder-[#6b7f79] outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || (!message.trim() && !attachment)}
                  className={`flex-shrink-0 rounded-xl p-2 transition-all ${
                    message.trim() || attachment
                      ? "bg-[#051612] text-white shadow-sm hover:bg-[#0d2a23]"
                      : "cursor-not-allowed bg-[#d1e8e3] text-[#6b7f79]"
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
}