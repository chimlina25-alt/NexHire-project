"use client";

import React from "react";
import Link from "next/link";
import {
  Globe, MapPin, Users, Phone, Briefcase, CheckCircle2,
  Building2, Pencil, TrendingUp, Save, X, Camera,
  Trash2, FileText, Upload, ExternalLink, Shield,
  Calendar, Tag, Mail,
} from "lucide-react";
import ImageCropModal from "@/components/ui/ImageCropModal";
import EmployerNavProfile from "@/components/ui/EmployerNavProfile";
import { useEmployerProfile } from "@/context/EmployerProfileContext";

type EmployerForm = {
  companyDescription: string;
  companyName: string;
  industry: string;
  companySize: string;
  currentAddress: string;
  foundedYear: string;
  country: string;
  contact: string;
  websiteLink: string;
  companyFileName: string;
  companyFileUrl: string;
  profileImageUrl: string;
};

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const card =
  "rounded-2xl border border-[#e8f0ec] bg-white shadow-[0_4px_24px_rgba(7,28,22,0.07)]";

/** Build a FormData from the current saved profile fields (for partial saves) */
function buildBaseFormData(saved: EmployerForm): FormData {
  const fd = new FormData();
  fd.append("companyName", saved.companyName || "Untitled");
  fd.append("companyDescription", saved.companyDescription || "");
  fd.append("industry", saved.industry || "");
  fd.append("companySize", saved.companySize || "");
  fd.append("currentAddress", saved.currentAddress || "");
  fd.append("foundedYear", saved.foundedYear || "");
  fd.append("country", saved.country || "");
  fd.append("contact", saved.contact || "");
  fd.append("websiteLink", saved.websiteLink || "");
  return fd;
}

/* ─── page ────────────────────────────────────────────────────────────────── */

export default function EmployerProfile() {
  const { refresh } = useEmployerProfile();

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const companyFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = React.useState<"overview" | "details">("overview");
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [fileUploading, setFileUploading] = React.useState(false);

  const [profileImage, setProfileImage] = React.useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = React.useState<string | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = React.useState<string | null>(null);
  const [cropOpen, setCropOpen] = React.useState(false);
  const [companyFile, setCompanyFile] = React.useState<File | null>(null);

  const empty: EmployerForm = {
    companyDescription: "", companyName: "", industry: "", companySize: "",
    currentAddress: "", foundedYear: "", country: "", contact: "",
    websiteLink: "", companyFileName: "", companyFileUrl: "", profileImageUrl: "",
  };

  const [saved, setSaved] = React.useState<EmployerForm>(empty);
  const [draft, setDraft] = React.useState<EmployerForm>(empty);

  /* load */
  React.useEffect(() => {
    fetch("/api/employer/profile").then(async (res) => {
      if (!res.ok) return;
      const d = await res.json();
      const p: EmployerForm = {
        companyDescription: d.companyDescription || "",
        companyName: d.companyName || "",
        industry: d.industry || "",
        companySize: d.companySize || "",
        currentAddress: d.currentAddress || "",
        foundedYear: d.foundedYear || "",
        country: d.country || "",
        contact: d.contact || "",
        websiteLink: d.websiteLink || "",
        companyFileName: d.companyFileName || "",
        companyFileUrl: d.companyFileUrl || "",
        profileImageUrl: d.profileImage || "",
      };
      setSaved(p);
      setDraft(p);
    });
  }, []);

  /* cleanup blob URLs */
  React.useEffect(() => {
    return () => {
      if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
      if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    };
  }, [sourceImageUrl, croppedPreviewUrl]);

  /* ── image handlers ─────────────────────────────────────────────────────── */
  const openFilePicker = () => fileInputRef.current?.click();

  const handleCircleAction = () => {
    if (sourceImageUrl || saved.profileImageUrl) { setCropOpen(true); return; }
    openFilePicker();
  };

  const handleDeleteImage = () => {
    if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    setSourceImageUrl(null); setCroppedPreviewUrl(null); setProfileImage(null);
    setCropOpen(false);
    setSaved((p) => ({ ...p, profileImageUrl: "" }));
    setDraft((p) => ({ ...p, profileImageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPG, PNG, and WEBP images are allowed"); e.target.value = ""; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be 5MB or smaller"); e.target.value = ""; return;
    }
    if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    setSourceImageUrl(URL.createObjectURL(file));
    setCroppedPreviewUrl(null); setProfileImage(null);
    setCropOpen(true); e.target.value = "";
  };

  const handleCropSave = (file: File, previewUrl: string) => {
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    setProfileImage(file); setCroppedPreviewUrl(previewUrl); setCropOpen(false);
  };

  /* ── company file handlers ──────────────────────────────────────────────── */
  const openCompanyFilePicker = () => companyFileInputRef.current?.click();

  const handleCompanyFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const allowed = [
      "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      alert("Only PDF, DOC, and DOCX files are allowed"); e.target.value = ""; return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be 10MB or smaller"); e.target.value = ""; return;
    }
    setCompanyFile(file);
    setDraft((p) => ({ ...p, companyFileName: file.name }));
    e.target.value = "";

    if (!isEditing) {
      await uploadCompanyFileNow(file);
    }
  };

  const uploadCompanyFileNow = async (file: File) => {
    try {
      setFileUploading(true);
      const fd = buildBaseFormData(saved);
      fd.append("companyFile", file);

      const res = await fetch("/api/auth/employer-profile", { method: "POST", body: fd });
      const result = res.ok ? await res.json() : null;

      if (!res.ok || !result) {
        alert("Failed to upload file");
        setCompanyFile(null);
        setDraft((p) => ({ ...p, companyFileName: saved.companyFileName }));
        return;
      }

      const updated: EmployerForm = {
        ...saved,
        companyFileUrl: result.companyFileUrl || saved.companyFileUrl,
        companyFileName: result.companyFileName || file.name,
      };
      setSaved(updated); setDraft(updated);
      setCompanyFile(null);
      refresh();
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Something went wrong uploading the file");
      setCompanyFile(null);
      setDraft((p) => ({ ...p, companyFileName: saved.companyFileName }));
    } finally {
      setFileUploading(false);
    }
  };

  /* ── KEY FIX: capture saved snapshot before any setState calls ────────── */
  const handleRemoveCompanyFile = async () => {
    // Snapshot BEFORE any setState — this is what was failing before
    const snapshot = { ...saved };

    // Update UI immediately
    setCompanyFile(null);
    setDraft((p) => ({ ...p, companyFileName: "", companyFileUrl: "" }));
    if (companyFileInputRef.current) companyFileInputRef.current.value = "";

    // If not editing, persist removal now using the snapshot
    if (!isEditing) {
      try {
        setFileUploading(true);
        const fd = buildBaseFormData(snapshot); // ← snapshot, not saved
        fd.append("removeCompanyFile", "true");

        const res = await fetch("/api/auth/employer-profile", { method: "POST", body: fd });
        if (res.ok) {
          setSaved((p) => ({ ...p, companyFileName: "", companyFileUrl: "" }));
          refresh();
        } else {
          const result = await res.json().catch(() => ({}));
          console.error("Remove file failed:", result.error);
          // Revert on failure
          setSaved(snapshot);
          setDraft(snapshot);
          alert(result.error || "Failed to remove file");
        }
      } catch (err) {
        console.error("REMOVE FILE ERROR:", err);
        setSaved(snapshot);
        setDraft(snapshot);
        alert("Something went wrong");
      } finally {
        setFileUploading(false);
      }
    }
    // If editing → removal sent on Save Changes via removeCompanyFile flag
  };

  /* ── profile edit handlers ──────────────────────────────────────────────── */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setDraft((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleEdit = () => { setDraft(saved); setIsEditing(true); };
  const handleCancel = () => { setDraft(saved); setCompanyFile(null); setIsEditing(false); };

  const handleSave = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("companyDescription", draft.companyDescription);
      fd.append("companyName", draft.companyName || "Untitled");
      fd.append("industry", draft.industry);
      fd.append("companySize", draft.companySize);
      fd.append("currentAddress", draft.currentAddress);
      fd.append("foundedYear", draft.foundedYear);
      fd.append("country", draft.country);
      fd.append("contact", draft.contact);
      fd.append("websiteLink", draft.websiteLink);
      if (profileImage) fd.append("profileImage", profileImage);
      if (companyFile) fd.append("companyFile", companyFile);
      if (!draft.companyFileName && !draft.companyFileUrl && saved.companyFileName) {
        fd.append("removeCompanyFile", "true");
      }

      const res = await fetch("/api/auth/employer-profile", { method: "POST", body: fd });
      const text = await res.text();
      const result = text ? JSON.parse(text) : {};

      if (!res.ok) { alert(result.error || "Failed to update profile"); return; }

      const updated: EmployerForm = {
        ...draft,
        companyFileUrl: result.companyFileUrl ?? draft.companyFileUrl,
        companyFileName: result.companyFileName ?? draft.companyFileName,
        profileImageUrl: result.profileImageUrl || draft.profileImageUrl || saved.profileImageUrl,
      };
      setSaved(updated); setDraft(updated);

      if (profileImage && result.profileImageUrl) {
        if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
        if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
        setSourceImageUrl(null); setCroppedPreviewUrl(null); setProfileImage(null);
      }
      setCompanyFile(null);
      refresh();
      setIsEditing(false);
    } catch (err) {
      console.error("EMPLOYER UPDATE ERROR:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ── derived ────────────────────────────────────────────────────────────── */
  const profile = isEditing ? draft : saved;
  const displayImageSrc = croppedPreviewUrl || sourceImageUrl || saved.profileImageUrl || "";
  const displayFileName = companyFile?.name || draft.companyFileName || saved.companyFileName || "";
  const hasFile = !!displayFileName;
  const hasSavedFile = !!saved.companyFileUrl;

  const completionFields = [
    saved.companyDescription, saved.companyName, saved.industry, saved.companySize,
    saved.currentAddress, saved.foundedYear, saved.country, saved.contact,
    saved.websiteLink, saved.companyFileName || saved.companyFileUrl,
    saved.profileImageUrl || croppedPreviewUrl || sourceImageUrl,
  ];
  const completion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  const openJobs = [
    { title: "Senior Software Engineer", type: "Full-time", salary: "$2,000–$3,500", dept: "Engineering" },
    { title: "Product Designer", type: "Full-time", salary: "$1,500–$2,500", dept: "Design" },
    { title: "Data Analyst", type: "Contract", salary: "$1,200–$2,000", dept: "Analytics" },
  ];

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <>
      <div className="min-h-screen bg-[#f0f5f2] font-sans text-[#10211d]">

        {/* ── Nav ──────────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#051612]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="NexHire" className="h-7 w-7" />
              <span className="text-lg font-black tracking-tight text-white">NexHire</span>
            </div>
            <nav className="hidden items-center gap-1 md:flex">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/post_job", label: "Post Job" },
                { href: "/employer_message", label: "Messages" },
                { href: "/employer_notification", label: "Notifications" },
                { href: "/employer_setting", label: "Settings" },
              ].map(({ href, label }) => (
                <Link key={href} href={href}>
                  <span className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
                    {label}
                  </span>
                </Link>
              ))}
            </nav>
            <EmployerNavProfile />
          </div>
        </header>

        {/* ── Hero banner ──────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-[#051612]">
          <div className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(rgba(64,181,148,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(64,181,148,0.12) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#40b594]/20 blur-[80px]" />
          <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-[#40b594]/10 blur-[60px]" />

          <div className="relative mx-auto max-w-7xl px-6 py-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#40b594]/80">
                  Employer Profile
                </p>
                <h1 className="text-3xl font-black text-white md:text-4xl">
                  {saved.companyName || "Your Company"}
                </h1>
                {saved.industry && (
                  <p className="mt-1.5 text-sm text-white/50">{saved.industry}</p>
                )}
              </div>
              <div className="hidden items-center gap-2 md:flex">
                {isEditing ? (
                  <>
                    <button onClick={handleCancel}
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                      <X size={15} /> Cancel
                    </button>
                    <button onClick={handleSave} disabled={loading}
                      className="flex items-center gap-2 rounded-xl bg-[#40b594] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#35a082] disabled:opacity-60">
                      <Save size={15} /> {loading ? "Saving…" : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button onClick={handleEdit}
                    className="flex items-center gap-2 rounded-xl bg-[#40b594] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#35a082]">
                    <Pencil size={15} /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 py-8">

          {/* ── Profile card ───────────────────────────────────────────────── */}
          <div className={`${card} mb-6 overflow-hidden`}>
            <div className="h-1.5 w-full bg-gradient-to-r from-[#40b594] via-[#2d9a7c] to-[#051612]" />
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {/* avatar */}
                <div className="relative mx-auto flex-shrink-0 md:mx-0">
                  <div className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-[#e8f0ec] bg-gradient-to-br from-[#21483d] to-[#40b594] shadow-lg md:h-32 md:w-32">
                    {displayImageSrc
                      ? <img src={displayImageSrc} alt="Company" className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full items-center justify-center"><Building2 className="h-12 w-12 text-white/70" /></div>
                    }
                  </div>
                  <button onClick={handleCircleAction}
                    className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-[#40b594] text-white shadow-md transition hover:bg-[#35a082]">
                    {displayImageSrc ? <Pencil size={14} /> : <Camera size={15} />}
                  </button>
                  {displayImageSrc && isEditing && (
                    <button onClick={handleDeleteImage}
                      className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-white bg-white text-red-500 shadow-md transition hover:bg-red-50">
                      <Trash2 size={13} />
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange} className="hidden" />
                </div>

                {/* info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col items-center gap-2 md:flex-row md:items-center">
                    <h2 className="text-2xl font-black text-[#071a15]">
                      {saved.companyName || "Your Company"}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#eafaf4] px-2.5 py-0.5 text-xs font-bold text-[#1a7a5c]">
                      <Shield size={10} /> Verified
                    </span>
                  </div>
                  {saved.industry && (
                    <p className="mt-1 text-sm font-semibold text-[#40b594]">{saved.industry}</p>
                  )}
                  {saved.companyDescription && (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5a736c]">
                      {saved.companyDescription}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                    {saved.currentAddress && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f0f7f4] px-3 py-1.5 text-xs font-semibold text-[#3d6b5e]">
                        <MapPin size={11} /> {saved.currentAddress}
                      </span>
                    )}
                    {saved.companySize && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f0f7f4] px-3 py-1.5 text-xs font-semibold text-[#3d6b5e]">
                        <Users size={11} /> {saved.companySize} employees
                      </span>
                    )}
                    {saved.foundedYear && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f0f7f4] px-3 py-1.5 text-xs font-semibold text-[#3d6b5e]">
                        <Calendar size={11} /> Est. {saved.foundedYear}
                      </span>
                    )}
                    {saved.websiteLink && (
                      <a href={saved.websiteLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#f0f7f4] px-3 py-1.5 text-xs font-semibold text-[#3d6b5e] transition hover:bg-[#d9ede6]">
                        <Globe size={11} /> Website <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>

                {/* mobile edit */}
                <div className="flex justify-center gap-2 md:hidden">
                  {isEditing ? (
                    <>
                      <button onClick={handleCancel}
                        className="flex items-center gap-2 rounded-xl border border-[#d1e5dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#17332b]">
                        <X size={15} /> Cancel
                      </button>
                      <button onClick={handleSave} disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-[#40b594] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                        <Save size={15} /> {loading ? "Saving…" : "Save"}
                      </button>
                    </>
                  ) : (
                    <button onClick={handleEdit}
                      className="flex items-center gap-2 rounded-xl bg-[#051612] px-4 py-2.5 text-sm font-semibold text-white">
                      <Pencil size={15} /> Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats ──────────────────────────────────────────────────────── */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            {[
              { label: "Active Jobs", value: "12", icon: Briefcase, color: "text-[#2563eb]", bg: "bg-[#eff4ff]" },
              { label: "Total Hires", value: "148", icon: Users, color: "text-[#7c3aed]", bg: "bg-[#f5f3ff]" },
              { label: "Growth", value: "+26%", icon: TrendingUp, color: "text-[#40b594]", bg: "bg-[#eafaf4]" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${card} p-5`}>
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}>
                  <Icon size={18} />
                </div>
                <p className="text-2xl font-black text-[#071a15]">{value}</p>
                <p className="mt-0.5 text-xs font-semibold text-[#7a9188]">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Main grid ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">

            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <aside className="space-y-5">

              {/* Profile strength */}
              <div className={`${card} p-5`}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#40b594]">
                    Profile Strength
                  </p>
                  <span className="text-lg font-black text-[#071a15]">{completion}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5eeea]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#40b594] to-[#2d9a7c] transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#7a9188]">
                  {completion === 100 ? "Profile complete 🎉" : "Fill in all fields to boost visibility"}
                </p>
              </div>

              {/* Contact info */}
              <div className={`${card} p-5`}>
                <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-[#071a15]">
                  Contact Info
                </h3>
                <div className="space-y-3">
                  <ContactRow icon={Globe} label="Website" value={saved.websiteLink} href={saved.websiteLink} />
                  <ContactRow icon={MapPin} label="Location" value={saved.currentAddress} />
                  <ContactRow icon={Users} label="Team size" value={saved.companySize} />
                  <ContactRow icon={Phone} label="Phone" value={saved.contact} />
                  <ContactRow icon={Mail} label="Country" value={saved.country} />
                </div>
              </div>

              {/* Company file sidebar preview */}
              <div className={`${card} p-5`}>
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eafaf4] text-[#40b594]">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#071a15]">Company File</p>
                    <p className="text-xs text-[#7a9188]">Brochure or document</p>
                  </div>
                </div>
                {hasSavedFile ? (
                  <div className="rounded-xl border border-[#d5eae3] bg-[#f4fbf7] p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#40b594]/10">
                        <FileText size={14} className="text-[#40b594]" />
                      </div>
                      <p className="flex-1 truncate text-xs font-semibold text-[#1a4035]">
                        {saved.companyFileName}
                      </p>
                    </div>
                    <a href={saved.companyFileUrl} target="_blank" rel="noreferrer"
                      className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-[#0a7e61] hover:underline">
                      <ExternalLink size={11} /> View file
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-[#9aafa8]">No file uploaded yet</p>
                )}
              </div>
            </aside>

            {/* ── Main panel ───────────────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Tabs */}
              <div className={`${card} p-1.5`}>
                <div className="flex gap-1">
                  {(["overview", "details"] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                        activeTab === tab
                          ? "bg-[#051612] text-white shadow-sm"
                          : "text-[#5a736c] hover:bg-[#f0f7f4]"
                      }`}>
                      {tab === "overview" ? "Overview" : "Company Details"}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "overview" ? (
                <>
                  {/* About */}
                  <div className={`${card} p-6`}>
                    <h3 className="mb-4 text-base font-black text-[#071a15]">About the Company</h3>
                    {isEditing ? (
                      <textarea name="companyDescription" value={profile.companyDescription}
                        onChange={handleChange} placeholder="Describe your company…"
                        className="h-36 w-full resize-none rounded-xl border border-[#cfe8de] bg-[#f6fbf8] px-4 py-3 text-sm text-[#17332b] outline-none transition focus:border-[#40b594] focus:ring-2 focus:ring-[#40b594]/15" />
                    ) : (
                      <p className="text-sm leading-7 text-[#4d6860]">
                        {saved.companyDescription || <span className="italic text-[#9aafa8]">No description added yet.</span>}
                      </p>
                    )}
                  </div>

                  {/* Open positions */}
                  <div className={`${card} p-6`}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-base font-black text-[#071a15]">Open Positions</h3>
                      <span className="rounded-full bg-[#eafaf4] px-2.5 py-0.5 text-xs font-bold text-[#1a7a5c]">
                        {openJobs.length} active
                      </span>
                    </div>
                    <div className="space-y-3">
                      {openJobs.map((job) => (
                        <div key={job.title}
                          className="flex items-center justify-between rounded-xl border border-[#e8f0ec] bg-[#f8fbf9] px-4 py-3.5 transition hover:border-[#c5ddd4] hover:bg-[#f0f8f4]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                              <Briefcase size={15} className="text-[#40b594]" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#071a15]">{job.title}</p>
                              <p className="mt-0.5 text-xs text-[#6a8880]">
                                <span className="font-semibold text-[#40b594]">{job.salary}</span>
                                {" · "}{job.type}{" · "}{job.dept}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-lg bg-[#eafaf4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1a7a5c]">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className={`${card} p-6`}>
                  <h3 className="mb-5 text-base font-black text-[#071a15]">Company Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <EditableField editing={isEditing} label="Company Name" name="companyName"
                      value={profile.companyName} onChange={handleChange} className="md:col-span-2" />
                    <EditableField editing={isEditing} label="Industry" name="industry"
                      value={profile.industry} onChange={handleChange} />
                    <EditableField editing={isEditing} label="Company Size" name="companySize"
                      value={profile.companySize} onChange={handleChange} />
                    <EditableField editing={isEditing} label="Address" name="currentAddress"
                      value={profile.currentAddress} onChange={handleChange} className="md:col-span-2" />
                    <EditableSelectYear editing={isEditing} label="Founded Year" name="foundedYear"
                      value={profile.foundedYear} onChange={handleChange} />
                    <EditableField editing={isEditing} label="Country" name="country"
                      value={profile.country} onChange={handleChange} />
                    <EditableField editing={isEditing} label="Contact Number" name="contact"
                      value={profile.contact} onChange={handleChange} />
                    <EditableField editing={isEditing} label="Website" name="websiteLink"
                      value={profile.websiteLink} onChange={handleChange} />
                  </div>
                </div>
              )}

              {/* ── Upload Company File ─────────────────────────────────────── */}
              <div className={`${card} overflow-hidden`}>
                {/* header */}
                <div className="flex items-center justify-between border-b border-[#e8f0ec] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eafaf4] text-[#40b594]">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#071a15]">Company Document</p>
                      <p className="text-xs text-[#7a9188]">PDF, DOC, or DOCX · max 10 MB</p>
                    </div>
                  </div>
                  {fileUploading ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                      Uploading…
                    </span>
                  ) : hasSavedFile ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eafaf4] px-3 py-1 text-xs font-bold text-[#1a7a5c]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#40b594]" />
                      Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-bold text-[#8a9e98]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#b0c4bc]" />
                      No file
                    </span>
                  )}
                </div>

                {/* body */}
                <div className="p-6">
                  {hasFile ? (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#d5eae3] bg-[#f4fbf7] px-4 py-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#40b594]/10">
                        <FileText size={18} className="text-[#40b594]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#1a4035]">{displayFileName}</p>
                        <p className="text-xs text-[#7a9188]">
                          {fileUploading ? "Uploading to server…" : "Ready"}
                        </p>
                      </div>
                      {!fileUploading && (
                        <button onClick={handleRemoveCompanyFile}
                          className="flex-shrink-0 rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4 flex items-center justify-center rounded-xl border-2 border-dashed border-[#cfe8de] bg-[#f8fcfa] py-8">
                      <div className="text-center">
                        <Upload size={24} className="mx-auto mb-2 text-[#a0c4b8]" />
                        <p className="text-sm font-semibold text-[#7a9188]">No document uploaded</p>
                        <p className="mt-0.5 text-xs text-[#a0b8b0]">Click Upload to add your company brochure</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    <button onClick={openCompanyFilePicker} disabled={fileUploading}
                      className="flex items-center gap-2 rounded-xl bg-[#051612] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0d2d23] disabled:opacity-50">
                      <Upload size={15} />
                      {fileUploading ? "Uploading…" : hasFile ? "Replace File" : "Upload File"}
                    </button>

                    {hasSavedFile && !fileUploading && (
                      <a href={saved.companyFileUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-[#c5ddd4] bg-white px-4 py-2.5 text-sm font-bold text-[#0a7e61] transition hover:bg-[#f0f8f4]">
                        <ExternalLink size={15} /> View File
                      </a>
                    )}

                    {hasFile && !fileUploading && (
                      <button onClick={handleRemoveCompanyFile}
                        className="flex items-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-50">
                        <Trash2 size={15} /> Remove
                      </button>
                    )}
                  </div>

                  <input ref={companyFileInputRef} type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleCompanyFileChange} className="hidden" />
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      <ImageCropModal
        open={cropOpen}
        imageSrc={sourceImageUrl || saved.profileImageUrl}
        title="Adjust company profile image"
        onClose={() => setCropOpen(false)}
        onSave={handleCropSave}
        onUploadAnother={openFilePicker}
        onDelete={handleDeleteImage}
        hasImage={!!(sourceImageUrl || saved.profileImageUrl)}
      />
    </>
  );
}

/* ─── sub-components ─────────────────────────────────────────────────────── */

function ContactRow({
  icon: Icon, label, value, href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string; href?: string;
}) {
  if (!value) return (
    <div className="flex items-center gap-3">
      <Icon size={14} className="text-[#a0c4b8]" />
      <span className="text-xs text-[#b0c4bc]">{label} not added</span>
    </div>
  );
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="mt-0.5 flex-shrink-0 text-[#40b594]" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a9188]">{label}</p>
        {href
          ? <a href={href} target="_blank" rel="noreferrer"
              className="text-xs font-semibold text-[#0a7e61] hover:underline">{value}</a>
          : <p className="text-xs font-semibold text-[#1a4035]">{value}</p>
        }
      </div>
    </div>
  );
}

function EditableField({
  editing, label, name, value, onChange, className = "",
}: {
  editing: boolean; label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4d7066]">
        {label}
      </label>
      {editing ? (
        <input name={name} value={value} onChange={onChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full rounded-xl border border-[#cfe8de] bg-[#f6fbf8] px-3.5 py-2.5 text-sm text-[#17332b] outline-none transition focus:border-[#40b594] focus:ring-2 focus:ring-[#40b594]/15" />
      ) : (
        <div className="rounded-xl border border-[#e8f0ec] bg-[#f8fbf9] px-3.5 py-2.5 text-sm font-semibold text-[#1a4035]">
          {value || <span className="font-normal text-[#9aafa8]">Not added</span>}
        </div>
      )}
    </div>
  );
}

function EditableSelectYear({
  editing, label, name, value, onChange,
}: {
  editing: boolean; label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4d7066]">
        {label}
      </label>
      {editing ? (
        <select name={name} value={value} onChange={onChange}
          className="w-full rounded-xl border border-[#cfe8de] bg-[#f6fbf8] px-3.5 py-2.5 text-sm text-[#17332b] outline-none transition focus:border-[#40b594] focus:ring-2 focus:ring-[#40b594]/15">
          <option value="">Select year</option>
          {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      ) : (
        <div className="rounded-xl border border-[#e8f0ec] bg-[#f8fbf9] px-3.5 py-2.5 text-sm font-semibold text-[#1a4035]">
          {value || <span className="font-normal text-[#9aafa8]">Not added</span>}
        </div>
      )}
    </div>
  );
}