"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip, ImageIcon, FileText, Download, X,
  CheckCheck, Check, Reply, File,
} from "lucide-react";

export type ReplyTo = {
  id: string; text: string | null; senderId: string; attachmentName: string | null;
};
export type MsgBase = {
  id: string; senderId: string; text: string | null;
  attachmentUrl: string | null; attachmentName: string | null;
  attachmentType: string | null; editedAt: string | null;
  createdAt: string; isRead: boolean; replyTo: ReplyTo | null;
  deletedBySender?: boolean;
};

export const isImg = (t?: string | null) => t?.startsWith("image/") ?? false;
export const isPdf = (t?: string | null) => t === "application/pdf";
export const isText = (t?: string | null) => !!(t?.startsWith("text/") || t === "application/json");

export function fmt(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
export function fmtConv(d: string) {
  const date = new Date(d), now = new Date();
  if (date.toDateString() === now.toDateString()) return fmt(d);
  const y = new Date(); y.setDate(now.getDate() - 1);
  if (date.toDateString() === y.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export const canEdit = (c: string) => Date.now() - new Date(c).getTime() <= 15 * 60 * 1000;
export function fmtLastSeen(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000), hrs = Math.floor(mins / 60);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export const getFileExt = (name?: string | null) => {
  if (!name) return "FILE";
  const p = name.split(".");
  return p.length > 1 ? p.pop()!.toUpperCase() : "FILE";
};
export const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

const triggerDownload = (url: string, name: string) => {
  const a = document.createElement("a");
  a.href = url; a.download = name; a.target = "_blank";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
};

export function useSmartScroll(
  endRef: React.RefObject<HTMLDivElement | null>,
  messages: any[],
  activeChat: string
) {
  const prevCount = useRef(0);
  const prevChat = useRef("");
  useEffect(() => {
    const chatChanged = prevChat.current !== activeChat;
    const grew = messages.length > prevCount.current;
    if (chatChanged || grew) {
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: chatChanged ? "auto" : "smooth" }), 60);
      prevCount.current = messages.length;
      prevChat.current = activeChat;
    }
  }, [messages.length, activeChat]);
}

// ── FileViewer type — passed to page-level viewer ─────────────────────────────

export type FileViewerState = {
  url: string;
  name: string;
  type: string | null;
} | null;

// ── Page-level file/image viewer — rendered ONCE at page root, never re-mounts ─

export function PageFileViewer({ viewer, onClose }: {
  viewer: FileViewerState;
  onClose: () => void;
}) {
  // canClose: ignore all close attempts for first 350ms after opening
  // This prevents the opening click from immediately closing the modal
  const canClose = useRef(false);
  const openTime = useRef(0);

  useEffect(() => {
    if (!viewer) return;
    canClose.current = false;
    openTime.current = Date.now();
    const t = setTimeout(() => { canClose.current = true; }, 350);
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && canClose.current) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [viewer?.url]); // re-run only when a NEW file is opened

  if (!viewer) return null;

  const { url, name, type } = viewer;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canClose.current) return;
    // Only close if clicking the backdrop itself, not any child
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{ background: "rgba(5,22,18,0.96)" }}
      onClick={handleBackdropClick}
    >
      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            {isImg(type) ? <ImageIcon size={16} className="text-white/60" /> : <File size={16} className="text-white/60" />}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate max-w-xs">{name}</p>
            <p className="text-white/40 text-[11px]">{getFileExt(name)} file</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => triggerDownload(url, name)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#40b594] hover:bg-[#35a082] text-white text-xs font-bold transition-all"
          >
            <Download size={13} /> Save to Device
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 min-h-0 flex items-center justify-center p-6 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {isImg(type) ? (
          <img
            src={url} alt={name} draggable={false}
            className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain select-none"
            style={{ maxHeight: "calc(100vh - 120px)" }}
          />
        ) : isPdf(type) ? (
          <iframe
            src={url} title={name}
            className="w-full rounded-2xl bg-white"
            style={{ height: "calc(100vh - 120px)", minWidth: "min(700px,90vw)" }}
          />
        ) : isText(type) ? (
          <div
            className="w-full max-w-3xl rounded-2xl bg-[#0d1f1a] border border-white/10 overflow-auto p-6"
            style={{ maxHeight: "calc(100vh - 120px)" }}
            onClick={e => e.stopPropagation()}
          >
            <TextContent url={url} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center">
              <File size={40} className="text-white/40" />
            </div>
            <div>
              <p className="text-white text-lg font-bold mb-1">{name}</p>
              <p className="text-white/40 text-sm mb-6">This file type cannot be previewed</p>
              <button
                onClick={() => triggerDownload(url, name)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#40b594] hover:bg-[#35a082] text-white font-bold transition-all mx-auto"
              >
                <Download size={16} /> Download to View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TextContent({ url }: { url: string }) {
  const [content, setContent] = useState<string | null>(null);
  useEffect(() => {
    if (url.startsWith("data:")) {
      try { setContent(atob(url.split(",")[1])); } catch { setContent("Could not decode."); }
    } else {
      fetch(url).then(r => r.text()).then(setContent).catch(() => setContent("Could not load."));
    }
  }, [url]);
  if (!content) return <p className="text-white/40 text-sm">Loading…</p>;
  return <pre className="text-white/80 text-xs font-mono whitespace-pre-wrap break-words leading-relaxed">{content}</pre>;
}

// ── Attachment bubble — calls onOpenFile instead of rendering modal itself ────

export function AttachmentBubble({ url, name, type, dark = false, onOpenFile }: {
  url: string | null;
  name: string | null;
  type: string | null;
  dark?: boolean;
  onOpenFile?: (state: FileViewerState) => void;
}) {
  if (!url && !name) return null;

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (url && onOpenFile) {
      onOpenFile({ url, name: name || "File", type });
    }
  };

  if (isImg(type)) {
    return (
      <div
        className="mt-2 relative group/img cursor-pointer rounded-xl overflow-hidden"
        style={{ maxWidth: 220 }}
        onClick={handleOpen}
      >
        {url ? (
          <>
            <img
              src={url} alt={name || ""} draggable={false}
              className="w-full object-cover rounded-xl select-none"
              style={{ maxHeight: 180 }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 rounded-xl transition-all flex items-center justify-center">
              <span className="opacity-0 group-hover/img:opacity-100 bg-white/90 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all pointer-events-none">
                View
              </span>
            </div>
          </>
        ) : (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${dark ? "bg-white/10" : "bg-gray-100"}`}>
            <ImageIcon size={14} className={dark ? "text-white/60" : "text-gray-400"} />
            <span className={`text-xs font-medium truncate max-w-[140px] ${dark ? "text-white/70" : "text-gray-500"}`}>{name}</span>
          </div>
        )}
      </div>
    );
  }

  const ext = getFileExt(name);
  const extColors: Record<string, string> = {
    PDF: "bg-red-100 text-red-600", DOC: "bg-blue-100 text-blue-600",
    DOCX: "bg-blue-100 text-blue-600", TXT: "bg-gray-100 text-gray-600",
    ZIP: "bg-yellow-100 text-yellow-600", RAR: "bg-yellow-100 text-yellow-600",
    CSV: "bg-green-100 text-green-600", XLSX: "bg-green-100 text-green-600",
    JSON: "bg-purple-100 text-purple-600",
  };
  const extColor = extColors[ext] || "bg-gray-100 text-gray-600";

  return (
    <div
      className={`mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${dark ? "bg-white/[0.07] border-white/[0.08] hover:bg-white/[0.12]" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}
      onClick={handleOpen}
    >
      <div className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-wide flex-shrink-0 ${dark ? "bg-white/10 text-white/70" : extColor}`}>
        {ext}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold truncate max-w-[150px] ${dark ? "text-white/90" : "text-[#071a15]"}`}>{name || "File"}</p>
        <p className={`text-[10px] mt-0.5 ${dark ? "text-white/40" : "text-gray-400"}`}>{url ? "Click to view" : "Attachment"}</p>
      </div>
      {url && (
        <button
          onClick={e => { e.stopPropagation(); triggerDownload(url, name || "file"); }}
          className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${dark ? "text-white/40 hover:text-white/80 hover:bg-white/10" : "text-gray-400 hover:text-[#40b594] hover:bg-gray-200"}`}
        >
          <Download size={12} />
        </button>
      )}
    </div>
  );
}

// ── Attach Button ─────────────────────────────────────────────────────────────

export function AttachButton({ onImageSelect, onFileSelect, disabled, theme = "light" }: {
  onImageSelect: (f: File) => void;
  onFileSelect: (f: File) => void;
  disabled?: boolean;
  theme?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      <input ref={imgRef} type="file" className="hidden" accept="image/*"
        onChange={e => { const f = e.target.files?.[0]; if (f) onImageSelect(f); setOpen(false); e.target.value = ""; }} />
      <input ref={fileRef} type="file" className="hidden"
        accept="application/pdf,.doc,.docx,.txt,.zip,.rar,.csv,.xlsx,.json"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelect(f); setOpen(false); e.target.value = ""; }} />
      <button type="button" onClick={() => !disabled && setOpen(v => !v)} disabled={disabled}
        className={`relative p-2 rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-50 ${open ? isDark ? "bg-[#00ffa3]/20 text-[#00ffa3]" : "bg-[#e8f5f1] text-[#40b594]" : isDark ? "text-[#6b9e8a] hover:text-[#0d1f1a] hover:bg-white/10" : "text-[#6b7f79] hover:text-[#40b594] hover:bg-[#e8f5f1]"}`}>
        <Paperclip size={16} />
        {open && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#40b594]" />}
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 z-[200]">
          <div className="bg-white rounded-2xl overflow-hidden min-w-[210px]"
            style={{ boxShadow: "0 20px 60px rgba(5,22,18,0.18),0 4px 16px rgba(5,22,18,0.08)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3.5 pb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attach</p>
            </div>
            <button type="button" onClick={() => imgRef.current?.click()}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#f0f9f6] transition-all group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <ImageIcon size={14} className="text-rose-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#071a15]">Photo / Image</p>
                <p className="text-[10px] text-gray-400">JPG, PNG, GIF, WEBP</p>
              </div>
            </button>
            <div className="mx-4 h-px bg-gray-100" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#f0f9f6] transition-all group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText size={14} className="text-indigo-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#071a15]">Document / File</p>
                <p className="text-[10px] text-gray-400">PDF, DOC, TXT, ZIP…</p>
              </div>
            </button>
            <div className="h-2" />
          </div>
          <div className="w-3 h-3 bg-white rotate-45 mx-4 -mt-1.5"
            style={{ borderRight: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)", boxShadow: "2px 2px 4px rgba(0,0,0,0.04)" }} />
        </div>
      )}
    </div>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────────────

export function UnsendDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full mx-4 overflow-hidden"
        style={{ boxShadow: "0 25px 60px rgba(5,22,18,0.2)" }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-3">
          <h3 className="text-base font-extrabold text-[#071a15] mb-1">Unsend message?</h3>
          <p className="text-xs text-[#6b7f79] leading-relaxed">
            This message will be removed from your view only. The other person can still see it.
          </p>
        </div>
        <div className="px-4 pb-4 flex gap-2 mt-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#6b7f79] hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-bold text-white hover:bg-red-600 transition-all">Unsend</button>
        </div>
      </div>
    </div>
  );
}

export function DeleteConvDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full mx-4 overflow-hidden"
        style={{ boxShadow: "0 25px 60px rgba(5,22,18,0.2)" }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-3">
          <h3 className="text-base font-extrabold text-[#071a15] mb-1">Delete conversation?</h3>
          <p className="text-xs text-[#6b7f79] leading-relaxed">
            This chat and all messages will be permanently removed from your view. If you search for this person again it will start fresh. The other person is not affected.
          </p>
        </div>
        <div className="px-4 pb-4 flex gap-2 mt-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#6b7f79] hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-bold text-white hover:bg-red-600 transition-all">Delete Chat</button>
        </div>
      </div>
    </div>
  );
}

export function ReplyBanner({ replyTo, onClear }: { replyTo: ReplyTo; onClear: () => void }) {
  return (
    <div className="mb-3 flex items-center gap-3 rounded-xl border-l-4 border-[#40b594] bg-[#f0f9f6] px-4 py-2.5">
      <Reply size={13} className="text-[#40b594] flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-[#40b594] uppercase tracking-wide mb-0.5">Replying</p>
        <p className="text-xs text-[#071a15] truncate max-w-xs font-medium">{replyTo.text || replyTo.attachmentName || "Attachment"}</p>
      </div>
      <button onClick={onClear} className="flex-shrink-0 text-[#6b7f79] hover:text-red-500 transition-colors p-1"><X size={13} /></button>
    </div>
  );
}

export function AttachmentPreviewBar({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);
  return (
    <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
      {preview
        ? <img src={preview} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
        : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-black text-indigo-500">{getFileExt(file.name)}</span>
          </div>
      }
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-[#071a15] max-w-[180px]">{file.name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{formatBytes(file.size)}</p>
      </div>
      <button onClick={onRemove}
        className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
        <X size={12} />
      </button>
    </div>
  );
}

export function ReadReceipt({ isRead }: { isRead: boolean }) {
  return isRead
    ? <CheckCheck size={12} className="text-[#40b594] flex-shrink-0" />
    : <Check size={12} className="text-gray-300 flex-shrink-0" />;
}

export function Avatar({ name, image, size = "md" }: {
  name: string; image?: string | null; size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className={`${sizes[size]} bg-[#051612] rounded-full flex items-center justify-center font-extrabold text-white flex-shrink-0 overflow-hidden`}>
      {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : (name[0] || "?").toUpperCase()}
    </div>
  );
}

export function OnlineDot({ online, size = "md" }: { online: boolean; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-2.5 w-2.5 border-2" : "h-3 w-3 border-2";
  return <span className={`absolute bottom-0 right-0 ${s} rounded-full border-white transition-colors ${online ? "bg-[#40b594]" : "bg-gray-300"}`} />;
}