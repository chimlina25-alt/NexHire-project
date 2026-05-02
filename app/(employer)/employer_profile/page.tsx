"use client";

import React from "react";
import Link from "next/link";
import {
  Globe, MapPin, Users, Phone, Briefcase, 
  Building2, Pencil, TrendingUp, Save, X, Camera,
  Trash2, FileText, Upload, ExternalLink, Shield,
  Calendar, Mail, CheckCircle2,
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

type StatsData = {
  activeJobs: number;
  totalHires: number;
  growthPct: number;
  openPositions: {
    id: string;
    title: string;
    employmentType: string;
    salaryMin: number | null;
    salaryMax: number | null;
    category: string;
    arrangement: string;
    applicantCount: number;
  }[];
};

const card =
  "rounded-2xl border border-[#e8f0ec] bg-white shadow-[0_4px_24px_rgba(7,28,22,0.07)]";

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

const getFileViewUrl = (url: string) =>
  `/api/cv?url=${encodeURIComponent(url)}`;

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Salary not set";
  if (min && max) return `$${min.toLocaleString()}–$${max.toLocaleString()}`;
  if (min) return `From $${min.toLocaleString()}`;
  return `Up to $${max!.toLocaleString()}`;
}

function formatEmploymentType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

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

const [stats, setStats] = React.useState<StatsData>({
  activeJobs: 0,
  totalHires: 0,
  growthPct: 0,
  openPositions: [],
});

  const empty: EmployerForm = {
    companyDescription: "", companyName: "", industry: "", companySize: "",
    currentAddress: "", foundedYear: "", country: "", contact: "",
    websiteLink: "", companyFileName: "", companyFileUrl: "", profileImageUrl: "",
  };

  const [saved, setSaved] = React.useState<EmployerForm>(empty);
  const [draft, setDraft] = React.useState<EmployerForm>(empty);

  // Load profile
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

  // Load real stats
  React.useEffect(() => {
  fetch("/api/employer/profile-stats").then(async (res) => {
    if (!res.ok) return;
    const data = await res.json();
    setStats(data);
  });
}, []);

  React.useEffect(() => {
    return () => {
      if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
      if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    };
  }, [sourceImageUrl, croppedPreviewUrl]);

  // ── Profile image ──────────────────────────────────────────────────────────

  const openFilePicker = () => setTimeout(() => fileInputRef.current?.click(), 0);

  const handleCameraClick = () => {
    const hasImage = !!(croppedPreviewUrl || sourceImageUrl || saved.profileImageUrl);
    if (hasImage) setCropOpen(true);
    else openFilePicker();
  };

  const handleDeleteImage = async () => {
    if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    setSourceImageUrl(null);
    setCroppedPreviewUrl(null);
    setProfileImage(null);
    setCropOpen(false);
    setSaved((p) => ({ ...p, profileImageUrl: "" }));
    setDraft((p) => ({ ...p, profileImageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!isEditing) {
      const fd = buildBaseFormData(saved);
      fd.append("removeProfileImage", "1");
      await fetch("/api/auth/employer-profile", { method: "POST", body: fd });
      refresh();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPG, PNG, and WEBP images are allowed");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be 5MB or smaller");
      e.target.value = "";
      return;
    }
    if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    setSourceImageUrl(URL.createObjectURL(file));
    setCroppedPreviewUrl(null);
    setProfileImage(null);
    setCropOpen(true);
    e.target.value = "";
  };

  const handleCropSave = async (file: File, previewUrl: string) => {
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    setCropOpen(false);
    if (!isEditing) {
      setCroppedPreviewUrl(previewUrl);
      await autoSaveProfileImage(file, previewUrl);
    } else {
      setProfileImage(file);
      setCroppedPreviewUrl(previewUrl);
    }
  };

  const autoSaveProfileImage = async (file: File, previewUrl: string) => {
    try {
      setLoading(true);
      const fd = buildBaseFormData(saved);
      fd.append("profileImage", file, file.name);
      const res = await fetch("/api/auth/employer-profile", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        const newUrl = data.profileImageUrl || data.profileImage || previewUrl;
        setSaved((p) => ({ ...p, profileImageUrl: newUrl }));
        setDraft((p) => ({ ...p, profileImageUrl: newUrl }));
        URL.revokeObjectURL(previewUrl);
        setCroppedPreviewUrl(null);
        setSourceImageUrl(null);
        setProfileImage(null);
        refresh();
      } else {
        alert(data.error || "Failed to upload photo");
      }
    } catch {
      alert("Something went wrong uploading photo");
    } finally {
      setLoading(false);
    }
  };

  // ── Company file ───────────────────────────────────────────────────────────

  const openCompanyFilePicker = () =>
    setTimeout(() => companyFileInputRef.current?.click(), 0);

  const handleCompanyFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const allowed = [
      "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      alert("Only PDF, DOC, and DOCX files are allowed");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be 10MB or smaller");
      e.target.value = "";
      return;
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
      setSaved(updated);
      setDraft(updated);
      setCompanyFile(null);
      refresh();
    } catch {
      alert("Something went wrong uploading the file");
      setCompanyFile(null);
      setDraft((p) => ({ ...p, companyFileName: saved.companyFileName }));
    } finally {
      setFileUploading(false);
    }
  };

  const handleRemoveCompanyFile = async () => {
    const snapshot = { ...saved };
    setCompanyFile(null);
    setDraft((p) => ({ ...p, companyFileName: "", companyFileUrl: "" }));
    if (companyFileInputRef.current) companyFileInputRef.current.value = "";
    if (!isEditing) {
      try {
        setFileUploading(true);
        const fd = buildBaseFormData(snapshot);
        fd.append("removeCompanyFile", "true");
        const res = await fetch("/api/auth/employer-profile", { method: "POST", body: fd });
        if (res.ok) {
          setSaved((p) => ({ ...p, companyFileName: "", companyFileUrl: "" }));
          refresh();
        } else {
          const result = await res.json().catch(() => ({}));
          setSaved(snapshot);
          setDraft(snapshot);
          alert(result.error || "Failed to remove file");
        }
      } catch {
        setSaved(snapshot);
        setDraft(snapshot);
        alert("Something went wrong");
      } finally {
        setFileUploading(false);
      }
    }
  };

  // ── Edit / Save ────────────────────────────────────────────────────────────

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
      setSaved(updated);
      setDraft(updated);
      if (profileImage && result.profileImageUrl) {
        if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
        if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
        setSourceImageUrl(null);
        setCroppedPreviewUrl(null);
        setProfileImage(null);
      }
      setCompanyFile(null);
      refresh();
      setIsEditing(false);
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

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

  return (
    <>
      <div className="min-h-screen bg-[#f0f5f2] font-sans text-[#10211d]">

        {/* Nav */}
        <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
  <div className="flex items-center gap-2.5">
    <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
    <span className="text-xl font-extrabold tracking-tight">
      NexHire
    </span>
  </div>

  <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
    {[
      { href: "/dashboard", label: "Dashboard" },
      { href: "/post_job", label: "Post Job" },
      { href: "/employer_message", label: "Messages" },
      { href: "/employer_notification", label: "Notifications" },
      { href: "/subscription", label: "Subscription" },
      { href: "/employer_setting", label: "Settings" },
    ].map(({ href, label }) => (
      <Link key={href} href={href}>
        <button className="text-gray-300 hover:text-white transition-colors">
          {label}
        </button>
      </Link>
    ))}
  </nav>

  <EmployerNavProfile />
</header>

        {/* Hero */}
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

          {/* Profile card */}
          <div className={`${card} mb-6 overflow-hidden`}>
            <div className="h-1.5 w-full bg-gradient-to-r from-[#40b594] via-[#2d9a7c] to-[#051612]" />
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">

                {/* Avatar */}
                <div className="relative mx-auto flex-shrink-0 md:mx-0">
                  <div className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-[#e8f0ec] bg-gradient-to-br from-[#21483d] to-[#40b594] shadow-lg md:h-32 md:w-32">
                    {displayImageSrc
                      ? <img src={displayImageSrc} alt="Company" className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full items-center justify-center">
                          <Building2 className="h-12 w-12 text-white/70" />
                        </div>
                    }
                  </div>
                  <button onClick={handleCameraClick} aria-label="Change photo"
                    className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-[#40b594] text-white shadow-md transition hover:bg-[#35a082] cursor-pointer">
                    {displayImageSrc ? <Pencil size={14} /> : <Camera size={15} />}
                  </button>
                  {displayImageSrc && (
                    <button onClick={handleDeleteImage} aria-label="Remove photo"
                      className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-white bg-white text-red-500 shadow-md transition hover:bg-red-50">
                      <Trash2 size={13} />
                    </button>
                  )}
                  {!displayImageSrc && (
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[10px] font-semibold text-[#40b594]">Click to upload</span>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange} className="hidden" />
                </div>

                {/* Info */}
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

                {/* Mobile edit */}
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

          {/* Real Stats */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className={`${card} p-5`}>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff4ff] text-[#2563eb]">
                <Briefcase size={18} />
              </div>
              <p className="text-2xl font-black text-[#071a15]">{stats.activeJobs}</p>
              <p className="mt-0.5 text-xs font-semibold text-[#7a9188]">Active Jobs</p>
            </div>
            <div className={`${card} p-5`}>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f3ff] text-[#7c3aed]">
                <Users size={18} />
              </div>
              <p className="text-2xl font-black text-[#071a15]">{stats.totalHires}</p>
              <p className="mt-0.5 text-xs font-semibold text-[#7a9188]">Total Hires</p>
            </div>
            <div className={`${card} p-5`}>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eafaf4] text-[#40b594]">
                <TrendingUp size={18} />
              </div>
              <p className="text-2xl font-black text-[#071a15]">{stats.growthPct}%</p>
              <p className="mt-0.5 text-xs font-semibold text-[#7a9188]">Hire Rate</p>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">

            {/* Sidebar */}
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
                  <div className="h-full rounded-full bg-gradient-to-r from-[#40b594] to-[#2d9a7c] transition-all duration-500"
                    style={{ width: `${completion}%` }} />
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

              {/* Company file sidebar */}
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
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#40b594]/10">
                        <FileText size={14} className="text-[#40b594]" />
                      </div>
                      <p className="flex-1 truncate text-xs font-semibold text-[#1a4035]">
                        {saved.companyFileName}
                      </p>
                    </div>
                    <a
                      href={getFileViewUrl(saved.companyFileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-[#0a7e61] hover:underline"
                    >
                      <ExternalLink size={11} /> View file
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#cfe8de] bg-[#f8fcfa] p-3 text-center">
                    <p className="text-xs text-[#9aafa8]">No file uploaded yet</p>
                    <button onClick={openCompanyFilePicker}
                      className="mt-2 text-xs font-bold text-[#40b594] hover:underline">
                      Upload now
                    </button>
                  </div>
                )}
              </div>
            </aside>

            {/* Main panel */}
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
                        {saved.companyDescription || (
                          <span className="italic text-[#9aafa8]">No description added yet.</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Real Open Positions */}
                  <div className={`${card} p-6`}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-base font-black text-[#071a15]">Open Positions</h3>
                      <span className="rounded-full bg-[#eafaf4] px-2.5 py-0.5 text-xs font-bold text-[#1a7a5c]">
                        {stats.openPositions.length} active
                      </span>
                    </div>

                    {stats.openPositions.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#e8f0ec] bg-[#f8fbf9] py-10 text-center">
                        <Briefcase size={28} className="mx-auto mb-3 text-[#c5ddd4]" />
                        <p className="text-sm font-semibold text-[#7a9188]">No active jobs yet</p>
                        <Link href="/post_job">
                          <span className="mt-2 inline-block text-xs font-bold text-[#40b594] hover:underline cursor-pointer">
                            Post your first job →
                          </span>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats.openPositions.map((job) => (
                          <div key={job.id}
                            className="flex items-center justify-between rounded-xl border border-[#e8f0ec] bg-[#f8fbf9] px-4 py-3.5 transition hover:border-[#c5ddd4] hover:bg-[#f0f8f4]">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                                <Briefcase size={15} className="text-[#40b594]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-[#071a15] truncate">{job.title}</p>
                                <p className="mt-0.5 text-xs text-[#6a8880]">
                                  <span className="font-semibold text-[#40b594]">
                                    {formatSalary(job.salaryMin, job.salaryMax)}
                                  </span>
                                  {" · "}{formatEmploymentType(job.employmentType)}
                                  {" · "}{job.applicantCount} applicant{job.applicantCount !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              <span className="rounded-lg bg-[#eafaf4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1a7a5c]">
                                Active
                              </span>
                              <Link href={`/jobs/${job.id}`}>
                                <ExternalLink size={14} className="text-[#7a9188] hover:text-[#40b594] transition" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

              {/* Company Document — always interactive */}
              <div className={`${card} overflow-hidden`}>
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
                      <CheckCircle2 size={11} /> Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-bold text-[#8a9e98]">
                      No file
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {hasFile ? (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#d5eae3] bg-[#f4fbf7] px-4 py-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#40b594]/10">
                        <FileText size={18} className="text-[#40b594]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#1a4035]">{displayFileName}</p>
                        <p className="text-xs text-[#7a9188]">
                          {fileUploading ? "Uploading to server…" : companyFile ? "Ready to upload" : "On file"}
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
                    <div onClick={openCompanyFilePicker}
                      className="mb-4 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#cfe8de] bg-[#f8fcfa] py-10 transition hover:border-[#40b594] hover:bg-[#f0faf6]">
                      <div className="text-center">
                        <Upload size={26} className="mx-auto mb-2 text-[#a0c4b8]" />
                        <p className="text-sm font-bold text-[#5a736c]">Click to upload document</p>
                        <p className="mt-1 text-xs text-[#a0b8b0]">PDF, DOC, or DOCX · Max 10MB</p>
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
                      <a
                        href={getFileViewUrl(saved.companyFileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-[#c5ddd4] bg-white px-4 py-2.5 text-sm font-bold text-[#0a7e61] transition hover:bg-[#f0f8f4]"
                      >
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

                  {/* Always in DOM */}
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

// Sub-components

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