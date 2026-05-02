"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone,
  MapPin,
  GraduationCap,
  User2,
  Pencil,
  Save,
  X,
  Briefcase,
  Camera,
  Trash2,
  FileText,
  Upload,
  CheckCircle2,
} from "lucide-react";
import ImageCropModal from "@/components/ui/ImageCropModal";
import UserNavProfile from "@/components/ui/UserNavProfile";

type JobSeekerForm = {
  description: string;
  firstName: string;
  lastName: string;
  contact: string;
  address: string;
  educationLevel: string;
  schoolUniversity: string;
  year: string;
  cvFileName: string;
  cvUrl: string;
  profileImageUrl: string;
};

type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

const cardClass = "rounded-[28px] border border-[#e6eeea] bg-white shadow-[0_18px_50px_rgba(7,28,22,0.06)]";

export default function JobSeekerProfile() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const cvInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profileImage, setProfileImage] = React.useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = React.useState<string | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = React.useState<string | null>(null);
  const [cropOpen, setCropOpen] = React.useState(false);

  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const [cvRemoved, setCvRemoved] = React.useState(false);
  const [cvDragging, setCvDragging] = React.useState(false);

  const emptyForm: JobSeekerForm = {
    description: "",
    firstName: "",
    lastName: "",
    contact: "",
    address: "",
    educationLevel: "",
    schoolUniversity: "",
    year: "",
    cvFileName: "",
    cvUrl: "",
    profileImageUrl: "",
  };

  const [saved, setSaved] = React.useState<JobSeekerForm>(emptyForm);
  const [draft, setDraft] = React.useState<JobSeekerForm>(emptyForm);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/auth/job-seeker-profile", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data) {
          setSaved(emptyForm);
          setDraft(emptyForm);
          return;
        }
        const mapped: JobSeekerForm = {
          description: data.description || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          contact: data.contact || "",
          address: data.address || "",
          educationLevel: data.educationLevel || "",
          schoolUniversity: data.schoolUniversity || "",
          year: data.year || "",
          cvFileName: data.cvFileName || "",
          cvUrl: data.cvUrl || "",
          profileImageUrl: data.profileImage || "",
        };
        setSaved(mapped);
        setDraft(mapped);
      } catch (err) {
        console.error("LOAD JOB SEEKER PROFILE ERROR:", err);
        setError("Failed to load profile");
      } finally {
        setPageLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    setDraft((prev) => ({ ...prev, [target.name]: target.value }));
  };

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
    setSaved((prev) => ({ ...prev, profileImageUrl: "" }));
    setDraft((prev) => ({ ...prev, profileImageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!isEditing) {
      const formData = new FormData();
      formData.append("firstName", saved.firstName);
      formData.append("lastName", saved.lastName);
      formData.append("description", saved.description);
      formData.append("contact", saved.contact);
      formData.append("address", saved.address);
      formData.append("educationLevel", saved.educationLevel);
      formData.append("schoolUniversity", saved.schoolUniversity);
      formData.append("year", saved.year);
      formData.append("removeProfileImage", "1");
      await fetch("/api/auth/job-seeker-profile", { method: "POST", body: formData });
      window.dispatchEvent(new Event("profileUpdated"));
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
    const objectUrl = URL.createObjectURL(file);
    setSourceImageUrl(objectUrl);
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

  const handleCropClose = () => setCropOpen(false);

  // ── CV ─────────────────────────────────────────────────────────────────────

  const openCvPicker = () => setTimeout(() => cvInputRef.current?.click(), 0);

  const processCvFile = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, DOC, and DOCX files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("CV must be 10MB or smaller");
      return;
    }
    setCvFile(file);
    setCvRemoved(false);
    setDraft((prev) => ({ ...prev, cvFileName: file.name }));
  };

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    processCvFile(file);
    e.target.value = "";
    if (!isEditing) {
      await autoSaveWithCv(file);
    }
  };

  const handleCvDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setCvDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processCvFile(file);
    if (!isEditing) {
      await autoSaveWithCv(file);
    }
  };

  const handleRemoveCv = async () => {
    setCvFile(null);
    setCvRemoved(true);
    setDraft((prev) => ({ ...prev, cvFileName: "", cvUrl: "" }));
    setSaved((prev) => ({ ...prev, cvFileName: "", cvUrl: "" }));
    if (cvInputRef.current) cvInputRef.current.value = "";
    if (!isEditing) {
      const formData = new FormData();
      formData.append("firstName", saved.firstName);
      formData.append("lastName", saved.lastName);
      formData.append("description", saved.description);
      formData.append("contact", saved.contact);
      formData.append("address", saved.address);
      formData.append("educationLevel", saved.educationLevel);
      formData.append("schoolUniversity", saved.schoolUniversity);
      formData.append("year", saved.year);
      formData.append("removeCv", "1");
      await fetch("/api/auth/job-seeker-profile", { method: "POST", body: formData });
    }
  };

  // ── Auto-save helpers ──────────────────────────────────────────────────────

  const autoSaveWithCv = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("firstName", saved.firstName);
      formData.append("lastName", saved.lastName);
      formData.append("description", saved.description);
      formData.append("contact", saved.contact);
      formData.append("address", saved.address);
      formData.append("educationLevel", saved.educationLevel);
      formData.append("schoolUniversity", saved.schoolUniversity);
      formData.append("year", saved.year);
      formData.append("cvFile", file, file.name);
      const res = await fetch("/api/auth/job-seeker-profile", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setSaved((prev) => ({
          ...prev,
          cvUrl: data.cvUrl ?? prev.cvUrl,
          cvFileName: data.cvFileName ?? prev.cvFileName,
        }));
        setDraft((prev) => ({
          ...prev,
          cvUrl: data.cvUrl ?? prev.cvUrl,
          cvFileName: data.cvFileName ?? prev.cvFileName,
        }));
        setCvFile(null);
        setCvRemoved(false);
        setSaveSuccess(true);
      } else {
        setError(data.error || "Failed to upload CV");
      }
    } catch {
      setError("Something went wrong uploading CV");
    } finally {
      setLoading(false);
    }
  };

  const autoSaveProfileImage = async (file: File, previewUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("firstName", saved.firstName);
      formData.append("lastName", saved.lastName);
      formData.append("description", saved.description);
      formData.append("contact", saved.contact);
      formData.append("address", saved.address);
      formData.append("educationLevel", saved.educationLevel);
      formData.append("schoolUniversity", saved.schoolUniversity);
      formData.append("year", saved.year);
      formData.append("profileImage", file, file.name);
      const res = await fetch("/api/auth/job-seeker-profile", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        const newUrl = data.profileImageUrl || data.profileImage || previewUrl;
        setSaved((prev) => ({ ...prev, profileImageUrl: newUrl }));
        setDraft((prev) => ({ ...prev, profileImageUrl: newUrl }));
        URL.revokeObjectURL(previewUrl);
        setCroppedPreviewUrl(null);
        setSourceImageUrl(null);
        setProfileImage(null);
        setSaveSuccess(true);
        window.dispatchEvent(new Event("profileUpdated"));
      } else {
        setError(data.error || "Failed to upload photo");
      }
    } catch {
      setError("Something went wrong uploading photo");
    } finally {
      setLoading(false);
    }
  };

  // ── Edit / Cancel / Save ───────────────────────────────────────────────────

  const handleEdit = () => {
    setDraft(saved);
    setError(null);
    setSaveSuccess(false);
    setCvRemoved(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(saved);
    setCvFile(null);
    setCvRemoved(false);
    setError(null);
    setSaveSuccess(false);
    if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    setSourceImageUrl(null);
    setCroppedPreviewUrl(null);
    setProfileImage(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSaveSuccess(false);

      const formData = new FormData();
      formData.append("description", draft.description);
      formData.append("firstName", draft.firstName);
      formData.append("lastName", draft.lastName);
      formData.append("contact", draft.contact);
      formData.append("address", draft.address);
      formData.append("educationLevel", draft.educationLevel);
      formData.append("schoolUniversity", draft.schoolUniversity);
      formData.append("year", draft.year);

      if (profileImage && profileImage.size > 0) {
        formData.append("profileImage", profileImage, profileImage.name || "profile.jpg");
      }

      if (saved.profileImageUrl && !profileImage && !croppedPreviewUrl && !sourceImageUrl) {
        formData.append("removeProfileImage", "1");
      }

      if (cvFile && cvFile.size > 0) {
        formData.append("cvFile", cvFile, cvFile.name || "cv.pdf");
      }
      if (cvRemoved) {
        formData.append("removeCv", "1");
      }

      const res = await fetch("/api/auth/job-seeker-profile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      const newProfileImageUrl =
        data.profileImageUrl || data.profileImage || draft.profileImageUrl;

      const nextSaved: JobSeekerForm = {
        ...draft,
        cvUrl: data.cvUrl ?? (cvRemoved ? "" : draft.cvUrl),
        cvFileName: data.cvFileName ?? (cvRemoved ? "" : draft.cvFileName),
        profileImageUrl: newProfileImageUrl,
      };

      setSaved(nextSaved);
      setDraft(nextSaved);

      if (croppedPreviewUrl) { URL.revokeObjectURL(croppedPreviewUrl); setCroppedPreviewUrl(null); }
      if (sourceImageUrl) { URL.revokeObjectURL(sourceImageUrl); setSourceImageUrl(null); }

      setProfileImage(null);
      setCvFile(null);
      setCvRemoved(false);
      setSaveSuccess(true);
      setIsEditing(false);

      window.dispatchEvent(new Event("profileUpdated"));
    } catch (err) {
      console.error("JOB SEEKER UPDATE ERROR:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
      if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────

  const fullName = `${saved.firstName} ${saved.lastName}`.trim() || "Profile";
  const profile = isEditing ? draft : saved;
  const displayImageSrc = croppedPreviewUrl || sourceImageUrl || saved.profileImageUrl || "";

  const currentCvFileName = cvRemoved
    ? ""
    : cvFile
    ? cvFile.name
    : draft.cvFileName || saved.cvFileName;

  const currentCvUrl = cvRemoved ? "" : cvFile ? "" : draft.cvUrl || saved.cvUrl;

  const cvFileSize = cvFile
    ? cvFile.size < 1024 * 1024
      ? `${(cvFile.size / 1024).toFixed(0)} KB`
      : `${(cvFile.size / (1024 * 1024)).toFixed(1)} MB`
    : null;

  const completionFields = [
    saved.firstName, saved.lastName, saved.contact, saved.address,
    saved.description, saved.educationLevel, saved.schoolUniversity,
    saved.year, saved.cvFileName || saved.cvUrl, saved.profileImageUrl,
  ];
  const completion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  const isWordDoc = (filename: string) =>
    filename.endsWith(".doc") || filename.endsWith(".docx");

  const getCvViewUrl = (url: string, filename: string) =>
  `/api/cv?url=${encodeURIComponent(url)}`;

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#edf4f1] flex items-center justify-center text-sm text-[#58706a]">
        Loading profile...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#edf4f1] pb-16 font-sans text-[#10211d]">

        {/* HEADER */}
        <header className="sticky top-0 z-50 flex items-center justify-between bg-[#051612] px-8 py-4 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NexHire" className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">NexHire</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link href="/home_page"><button className="hover:text-gray-300">Home</button></Link>
            <Link href="/saved"><button className="hover:text-gray-300">My Jobs</button></Link>
            <Link href="/message"><button className="hover:text-gray-300">Messages</button></Link>
            <Link href="/notification"><button className="hover:text-gray-300">Notification</button></Link>
            <Link href="/setting"><button className="hover:text-gray-300">Settings</button></Link>
          </nav>
          <UserNavProfile />
        </header>

        {/* HERO */}
        <section className="relative overflow-hidden bg-[#051612]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(64,181,148,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />
          <div className="relative mx-auto max-w-7xl px-8 py-12 md:py-16">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">{fullName}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                Professional profile, photo, education, and CV storage in one clean layout.
              </p>
            </div>
          </div>
        </section>

        {/* MAIN */}
        <main className="mx-auto max-w-7xl px-8 pt-8">

          {loading && !isEditing && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-sm font-medium flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              Uploading...
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-3">
              <X size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {saveSuccess && !isEditing && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-medium flex items-center gap-3">
              <CheckCircle2 size={16} className="shrink-0" />
              Saved successfully!
            </div>
          )}

          {/* Profile card */}
          <section className={`${cardClass} mb-8 p-6 md:p-8`}>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-[linear-gradient(135deg,#21483d,#40b594)] shadow-[0_18px_50px_rgba(0,0,0,0.18)] md:h-40 md:w-40">
                    {displayImageSrc ? (
                      <img src={displayImageSrc} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-20 w-20 text-white/85" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>

                  {/* Camera button — always clickable */}
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    aria-label="Change profile photo"
                    className="absolute bottom-1 right-1 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#00a37b] text-white shadow-lg hover:bg-[#008f6b] transition-all cursor-pointer"
                  >
                    {displayImageSrc ? <Pencil size={18} /> : <Camera size={20} />}
                  </button>

                  {/* Delete button — always shown when image exists */}
                  {displayImageSrc && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      aria-label="Remove profile photo"
                      className="absolute left-1 top-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-white text-[#d11a2a] shadow-md hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {/* Upload hint */}
                  {!displayImageSrc && (
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-[#40b594]">Click to upload photo</span>
                    </div>
                  )}

                  {/* Hidden file input — always in DOM */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div className="max-w-2xl mt-4 lg:mt-0">
                  <h2 className="text-2xl font-black text-[#0d211b] md:text-3xl">{fullName}</h2>
                  <p className="mt-2 text-sm font-bold text-[#40b594]">Open to opportunities</p>
                  <p className="mt-4 text-sm leading-7 text-[#58706a]">{saved.description || "No description yet."}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 lg:justify-end">
                {isEditing ? (
                  <>
                    <button type="button" onClick={handleCancel}
                      className="rounded-2xl border border-[#d7e5df] bg-white px-5 py-3 text-sm font-bold text-[#17332b] hover:bg-gray-50 transition-all">
                      <span className="inline-flex items-center gap-2"><X size={16} />Cancel</span>
                    </button>
                    <button type="button" onClick={handleSave} disabled={loading}
                      className="rounded-2xl bg-[#051612] px-5 py-3 text-sm font-bold text-white disabled:opacity-60 hover:bg-[#0d2a23] transition-all">
                      <span className="inline-flex items-center gap-2">
                        <Save size={16} />{loading ? "Saving..." : "Save Changes"}
                      </span>
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={handleEdit}
                    className="rounded-2xl bg-[#051612] px-5 py-3 text-sm font-bold text-white hover:bg-[#0d2a23] transition-all">
                    <span className="inline-flex items-center gap-2"><Pencil size={16} />Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_2.05fr]">

            {/* ASIDE */}
            <aside className="space-y-8">

              {/* Completion */}
              <section className={`${cardClass} p-6`}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#40b594]">Profile Completion</p>
                <div className="mb-3 flex items-end justify-between">
                  <p className="text-3xl font-black text-[#0c201a]">{completion}%</p>
                  <p className="text-xs font-semibold text-[#6a817b]">Complete your profile</p>
                </div>
                <div className="h-3 w-full rounded-full bg-[#e5efeb]">
                  <div className="h-3 rounded-full bg-[#40b594] transition-all" style={{ width: `${completion}%` }} />
                </div>
              </section>

              {/* Quick Info */}
              <section className={`${cardClass} p-6`}>
                <h3 className="mb-5 text-base font-extrabold text-[#071a15]">Quick Info</h3>
                <div className="space-y-4">
                  <InfoRow icon={Phone} label="Contact" value={saved.contact || "Not added"} />
                  <InfoRow icon={MapPin} label="Address" value={saved.address || "Not added"} />
                  <InfoRow icon={GraduationCap} label="Education" value={saved.educationLevel || "Not added"} />
                </div>
              </section>

              {/* CV Storage sidebar */}
              <section className={`${cardClass} p-6`}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff8f5] text-[#40b594]">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#071a15]">CV Storage</h3>
                    <p className="text-xs text-[#6a817b]">Store one CV in this profile</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-dashed border-[#cfe2db] bg-[#f8fcfa] p-4">
                  {saved.cvFileName ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[#40b594]" />
                        <p className="text-sm font-semibold text-[#17332b] truncate">{saved.cvFileName}</p>
                      </div>
                      {saved.cvUrl && (
                        <a
                          href={getCvViewUrl(saved.cvUrl, saved.cvFileName)}
                          target="_blank"
                          rel="noreferrer"
                          download={isWordDoc(saved.cvFileName) ? saved.cvFileName : undefined}
                          className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-[#0a7e61] hover:underline"
                        >
                          <FileText size={14} />
                          {isWordDoc(saved.cvFileName) ? "Download CV" : "View CV"}
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-[#7a8f89]">No CV uploaded yet</p>
                  )}
                </div>
              </section>
            </aside>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">

              {/* Personal Info */}
              <section className={`${cardClass} p-6 md:p-8`}>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-black text-[#0d211b]">Personal Information</h3>
                  <User2 className="text-[#40b594]" size={22} />
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <EditableField editing={isEditing} label="First Name" name="firstName" value={profile.firstName} onChange={handleChange} />
                  <EditableField editing={isEditing} label="Last Name" name="lastName" value={profile.lastName} onChange={handleChange} />
                  <EditableField editing={isEditing} label="Contact" name="contact" value={profile.contact} onChange={handleChange} className="md:col-span-2" />
                  <EditableField editing={isEditing} label="Address" name="address" value={profile.address} onChange={handleChange} className="md:col-span-2" />
                </div>
              </section>

              {/* Education */}
              <section className={`${cardClass} p-6 md:p-8`}>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-black text-[#0d211b]">Education Details</h3>
                  <Briefcase className="text-[#40b594]" size={22} />
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <EditableSelect
                    editing={isEditing} label="Education Level" name="educationLevel"
                    value={profile.educationLevel} onChange={handleChange}
                    options={["High School", "Associate", "Bachelor", "Master", "PhD"]}
                  />
                  <EditableField editing={isEditing} label="School / University" name="schoolUniversity" value={profile.schoolUniversity} onChange={handleChange} />
                  <EditableField editing={isEditing} label="Year" name="year" value={profile.year} onChange={handleChange} />
                </div>
              </section>

              {/* About */}
              <section className={`${cardClass} p-6 md:p-8`}>
                <h3 className="mb-6 text-xl font-black text-[#0d211b]">About Candidate</h3>
                {isEditing ? (
                  <textarea
                    name="description" value={profile.description} onChange={handleChange}
                    placeholder="Write a short bio about yourself..."
                    className="h-36 w-full resize-none rounded-3xl border border-[#d9e8e2] bg-[#f6fbf8] px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#40b594]"
                  />
                ) : (
                  <p className="text-sm leading-8 text-[#405752]">{saved.description || "Not added"}</p>
                )}
              </section>

              {/* ── CV UPLOAD — always interactive ── */}
              <section className={`${cardClass} p-6 md:p-8`}>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#0d211b]">Resume / CV</h3>
                    <p className="mt-1 text-sm text-[#6a817b]">Upload your resume so employers can find you</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff8f5] text-[#40b594]">
                    <FileText size={22} />
                  </div>
                </div>

                {/* Always-in-DOM hidden input */}
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleCvChange}
                  className="hidden"
                />

                {currentCvFileName ? (
                  /* CV exists */
                  <div className="rounded-[24px] border-2 border-[#40b594] bg-gradient-to-br from-[#f0faf6] to-[#f8fcfa] p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#051612] text-white shrink-0 shadow-md">
                        <FileText size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-[#0d211b] truncate">{currentCvFileName}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {cvFile ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              Ready to upload{cvFileSize ? ` · ${cvFileSize}` : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f5f0] px-2 py-0.5 text-[10px] font-bold text-[#0a7e61]">
                              <CheckCircle2 size={10} /> On file
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                      {currentCvUrl && !cvFile && (
                        <a
                            href={getCvViewUrl(currentCvUrl, currentCvFileName)}
  target="_blank"
  rel="noreferrer"
  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#cfe2db] px-4 py-2 text-xs font-bold text-[#0a7e61] hover:bg-[#e6f5f0] transition-all"
>
  <FileText size={13} />
  View CV
</a>
                      )}
                      <button type="button" onClick={openCvPicker}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#051612] px-4 py-2 text-xs font-bold text-white hover:bg-[#0d2a23] transition-all">
                        <Upload size={13} /> Replace CV
                      </button>
                      <button type="button" onClick={handleRemoveCv}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-all">
                        <Trash2 size={13} /> Remove CV
                      </button>
                    </div>
                  </div>
                ) : (
                  /* No CV — drag & drop zone */
                  <>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setCvDragging(true); }}
                      onDragLeave={() => setCvDragging(false)}
                      onDrop={handleCvDrop}
                      onClick={openCvPicker}
                      className={`rounded-[24px] border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
                        cvDragging
                          ? "border-[#40b594] bg-[#e6f5f0] scale-[1.01]"
                          : "border-[#cfe2db] bg-[#f8fcfa] hover:border-[#40b594] hover:bg-[#f0faf6]"
                      }`}
                    >
                      <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${cvDragging ? "bg-[#40b594] text-white" : "bg-[#e6f5f0] text-[#40b594]"}`}>
                        <Upload size={28} />
                      </div>
                      <p className="text-sm font-extrabold text-[#17332b]">
                        {cvDragging ? "Drop your CV here" : "Click to upload or drag & drop"}
                      </p>
                      <p className="text-xs text-[#7a8f89] mt-2">PDF, DOC, or DOCX</p>
                      <p className="text-xs text-[#aec5be] mt-1">Maximum file size 10MB</p>
                    </div>

                    <button type="button" onClick={openCvPicker}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#051612] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#0d2a23] transition-all">
                      <Upload size={16} /> Upload CV from Device
                    </button>
                  </>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      <ImageCropModal
        open={cropOpen}
        imageSrc={sourceImageUrl || saved.profileImageUrl}
        title="Adjust profile photo"
        onClose={handleCropClose}
        onSave={handleCropSave}
        onUploadAnother={openFilePicker}
        onDelete={handleDeleteImage}
        hasImage={!!(sourceImageUrl || saved.profileImageUrl)}
      />
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-[#f6fbf8] px-4 py-3">
      <div className="mt-0.5 rounded-xl bg-white p-2 text-[#40b594] shadow-sm">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6f8780]">{label}</p>
        <p className="mt-1 text-sm font-bold text-[#10211d]">{value}</p>
      </div>
    </div>
  );
}

function EditableField({ editing, label, name, value, onChange, className = "" }: {
  editing: boolean;
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-bold text-[#27413a]">{label}</p>
      {editing ? (
        <input name={name} value={value} onChange={onChange}
          className="w-full rounded-2xl border border-[#d9e8e2] bg-[#f6fbf8] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#40b594]" />
      ) : (
        <div className="rounded-2xl border border-[#edf3f0] bg-[#f9fcfb] px-4 py-3 text-sm font-semibold text-[#10211d]">
          {value || "Not added"}
        </div>
      )}
    </div>
  );
}

function EditableSelect({ editing, label, name, value, onChange, options }: {
  editing: boolean;
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent) => void;
  options: string[];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[#27413a]">{label}</p>
      {editing ? (
        <select name={name} value={value} onChange={onChange}
          className="w-full rounded-2xl border border-[#d9e8e2] bg-[#f6fbf8] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#40b594]">
          <option value="">Select option</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <div className="rounded-2xl border border-[#edf3f0] bg-[#f9fcfb] px-4 py-3 text-sm font-semibold text-[#10211d]">
          {value || "Not added"}
        </div>
      )}
    </div>
  );
}