// app/employer_profile/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Globe,
  MapPin,
  Users,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  Building2,
  Pencil,
  TrendingUp,
  Save,
  X,
  Sparkles,
  Camera,
  Trash2,
  FileText,
  Upload,
} from "lucide-react";
import ImageCropModal from "@/components/ui/ImageCropModal";

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

const cardClass =
  "rounded-[28px] border border-[#e6eeea] bg-white shadow-[0_18px_50px_rgba(7,28,22,0.06)]";

export default function EmployerProfile() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const companyFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = React.useState<"overview" | "details">("overview");
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [profileImage, setProfileImage] = React.useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = React.useState<string | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = React.useState<string | null>(null);
  const [cropOpen, setCropOpen] = React.useState(false);

  const [companyFile, setCompanyFile] = React.useState<File | null>(null);

  const [saved, setSaved] = React.useState<EmployerForm>({
    companyDescription:
      "NexHire is a modern hiring company focused on helping employers find qualified talent faster with a cleaner and more human recruitment experience.",
    companyName: "NexHire Solutions",
    industry: "Technology & Software",
    companySize: "50 - 100 Employees",
    currentAddress: "Phnom Penh, Cambodia",
    foundedYear: "2021",
    country: "Cambodia",
    contact: "+855 23 456 789",
    websiteLink: "https://www.nexhire.com",
    companyFileName: "",
    companyFileUrl: "",
    profileImageUrl: "",
  });

  const [draft, setDraft] = React.useState<EmployerForm>(saved);

  const stats = [
    { label: "Active Jobs", value: "12", icon: Briefcase },
    { label: "Hires", value: "148", icon: Users },
    { label: "Growth", value: "+26%", icon: TrendingUp },
  ];

  const openJobs = [
    { title: "Senior Software Engineer", type: "Full-time", salary: "$2,000 - $3,500" },
    { title: "Product Designer", type: "Full-time", salary: "$1,500 - $2,500" },
    { title: "Data Analyst", type: "Contract", salary: "$1,200 - $2,000" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setDraft((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const openFilePicker = () => fileInputRef.current?.click();
  const openCompanyFilePicker = () => companyFileInputRef.current?.click();

  const handleCircleAction = () => {
    if (sourceImageUrl || saved.profileImageUrl) {
      setCropOpen(true);
      return;
    }
    openFilePicker();
  };

  const handleDeleteImage = () => {
    if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);

    setSourceImageUrl(null);
    setCroppedPreviewUrl(null);
    setProfileImage(null);
    setCropOpen(false);

    setSaved((prev) => ({ ...prev, profileImageUrl: "" }));
    setDraft((prev) => ({ ...prev, profileImageUrl: "" }));

    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleCropSave = (file: File, previewUrl: string) => {
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    setProfileImage(file);
    setCroppedPreviewUrl(previewUrl);
    setCropOpen(false);
  };

  const handleCropClose = () => setCropOpen(false);

  const handleCompanyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
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
    setDraft((prev) => ({
      ...prev,
      companyFileName: file.name,
    }));

    e.target.value = "";
  };

  const handleRemoveCompanyFile = () => {
    setCompanyFile(null);
    setDraft((prev) => ({
      ...prev,
      companyFileName: "",
      companyFileUrl: "",
    }));
    setSaved((prev) => ({
      ...prev,
      companyFileName: "",
      companyFileUrl: prev.companyFileName === draft.companyFileName ? "" : prev.companyFileUrl,
    }));

    if (companyFileInputRef.current) companyFileInputRef.current.value = "";
  };

  React.useEffect(() => {
    return () => {
      if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
      if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    };
  }, [sourceImageUrl, croppedPreviewUrl]);

  const handleEdit = () => {
    setDraft(saved);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(saved);
    setCompanyFile(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("companyDescription", draft.companyDescription);
      formData.append("companyName", draft.companyName);
      formData.append("industry", draft.industry);
      formData.append("companySize", draft.companySize);
      formData.append("currentAddress", draft.currentAddress);
      formData.append("foundedYear", draft.foundedYear);
      formData.append("country", draft.country);
      formData.append("contact", draft.contact);
      formData.append("websiteLink", draft.websiteLink);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      if (companyFile) {
        formData.append("companyFile", companyFile);
      }

      const res = await fetch("/api/auth/employer-profile", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : {};

      if (!res.ok) {
        alert(result.error || "Failed to update profile");
        return;
      }

      setSaved({
        ...draft,
        companyFileUrl: result.companyFileUrl || draft.companyFileUrl,
        companyFileName: result.companyFileName || draft.companyFileName,
        profileImageUrl: result.profileImageUrl || draft.profileImageUrl || saved.profileImageUrl,
      });
      setCompanyFile(null);
      setIsEditing(false);
    } catch (error) {
      console.error("EMPLOYER UPDATE ERROR:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const profile = isEditing ? draft : saved;
  const displayImageSrc = croppedPreviewUrl || sourceImageUrl || saved.profileImageUrl || "";

  const completionFields = [
    saved.companyDescription,
    saved.companyName,
    saved.industry,
    saved.companySize,
    saved.currentAddress,
    saved.foundedYear,
    saved.country,
    saved.contact,
    saved.websiteLink,
    saved.companyFileName || saved.companyFileUrl,
    saved.profileImageUrl || croppedPreviewUrl || sourceImageUrl,
  ];
  const completion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  return (
    <>
      <div className="min-h-screen bg-[#edf4f1] pb-16 font-sans text-[#10211d]">
        <header className="sticky top-0 z-50 flex items-center justify-between bg-[#051612] px-8 py-4 text-white shadow-lg">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="NexHire" className="h-8 w-8" />
            <span className="text-xl font-extrabold tracking-tight">NexHire</span>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <Link href="/dashboard"><button className="text-gray-300 hover:text-white">Dashboard</button></Link>
            <Link href="/post_job"><button className="text-gray-300 hover:text-white">Post Job</button></Link>
            <Link href="/employer_message"><button className="text-gray-300 hover:text-white">Messages</button></Link>
            <Link href="/employer_notification"><button className="text-gray-300 hover:text-white">Notification</button></Link>
            <Link href="/employer_setting"><button className="text-gray-300 hover:text-white">Settings</button></Link>
          </nav>

          <Link href="/employer_profile">
            <div className="group flex cursor-pointer items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-500">Company</p>
                <p className="text-sm font-bold text-white group-hover:text-[#40b594]">Profile</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#40b594] text-sm font-extrabold text-[#051612]">
                {saved.companyName.charAt(0) || "C"}
              </div>
            </div>
          </Link>
        </header>

        <section className="relative overflow-hidden bg-[#051612]">
          <div className="absolute inset-0 opacity-15">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(#40b594 1px, transparent 1px), linear-gradient(90deg, #40b594 1px, transparent 1px)",
                backgroundSize: "46px 46px",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-8 py-12 md:py-16">
            <div className="max-w-3xl">
            
              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                {saved.companyName}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
                Company identity, business details, hiring summary, and stored company file in one clean layout without overlap.
              </p>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-8 pt-8">
          <section className={`${cardClass} mb-8 p-6 md:p-8`}>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
                <div className="relative">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-[linear-gradient(135deg,#21483d,#40b594)] shadow-[0_18px_50px_rgba(0,0,0,0.18)] md:h-40 md:w-40">
                    {displayImageSrc ? (
                      <img src={displayImageSrc} alt="Company profile" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-16 w-16 text-white/85" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCircleAction}
                    className="absolute bottom-1 right-1 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#00a37b] text-white shadow-lg"
                  >
                    {displayImageSrc ? <Pencil size={18} /> : <Camera size={20} />}
                  </button>

                  {displayImageSrc && isEditing && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="absolute left-1 top-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-white text-[#d11a2a] shadow-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div className="max-w-2xl">
                  <div className="flex items-center justify-center gap-2 lg:justify-start">
                    <h2 className="text-2xl font-black text-[#0d211b] md:text-3xl">
                      {saved.companyName}
                    </h2>
                    <CheckCircle2 className="text-[#40b594]" size={20} />
                  </div>
                  <p className="mt-2 text-sm font-bold text-[#40b594]">{saved.industry}</p>
                  <p className="mt-4 text-sm leading-7 text-[#58706a]">
                    {saved.companyDescription}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 lg:justify-end">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-2xl border border-[#d7e5df] bg-white px-5 py-3 text-sm font-bold text-[#17332b]"
                    >
                      <span className="inline-flex items-center gap-2"><X size={16} />Cancel</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={loading}
                      className="rounded-2xl bg-[#051612] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      <span className="inline-flex items-center gap-2"><Save size={16} />{loading ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="rounded-2xl bg-[#051612] px-5 py-3 text-sm font-bold text-white"
                  >
                    <span className="inline-flex items-center gap-2"><Pencil size={16} />Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className={`${cardClass} p-5`}>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff8f5] text-[#40b594]">
                  <Icon size={18} />
                </div>
                <p className="text-3xl font-black text-[#0c201a]">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-[#718881]">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_2.05fr]">
            <aside className="space-y-8">
              <section className={`${cardClass} p-6`}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#40b594]">
                  Profile Completion
                </p>
                <div className="mb-3 flex items-end justify-between">
                  <p className="text-3xl font-black text-[#0c201a]">{completion}%</p>
                  <p className="text-xs font-semibold text-[#6a817b]">Complete your company profile</p>
                </div>
                <div className="h-3 w-full rounded-full bg-[#e5efeb]">
                  <div className="h-3 rounded-full bg-[#40b594]" style={{ width: `${completion}%` }} />
                </div>
              </section>

              <section className={`${cardClass} p-6`}>
                <h3 className="mb-5 text-base font-extrabold text-[#071a15]">Quick Info</h3>
                <div className="space-y-4">
                  <InfoRow icon={Globe} label="Website" value={saved.websiteLink || "Not added"} />
                  <InfoRow icon={MapPin} label="Location" value={saved.currentAddress || "Not added"} />
                  <InfoRow icon={Users} label="Company Size" value={saved.companySize || "Not added"} />
                  <InfoRow icon={Phone} label="Contact" value={saved.contact || "Not added"} />
                </div>
              </section>

              <section className={`${cardClass} p-6`}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff8f5] text-[#40b594]">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#071a15]">Company File</h3>
                    <p className="text-xs text-[#6a817b]">Store one company document</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-dashed border-[#cfe2db] bg-[#f8fcfa] p-4">
                  <p className="text-sm font-semibold text-[#17332b]">
                    {saved.companyFileName || "No company file uploaded yet"}
                  </p>
                  {saved.companyFileUrl ? (
                    <a
                      href={saved.companyFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#0a7e61]"
                    >
                      <FileText size={16} />
                      View uploaded file
                    </a>
                  ) : (
                    <p className="mt-2 text-xs text-[#7a8f89]">PDF, DOC, or DOCX</p>
                  )}
                </div>
              </section>
            </aside>

            <div className="space-y-8">
              <section className={`${cardClass} p-3`}>
                <div className="flex flex-wrap gap-2">
                  {(["overview", "details"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-2xl px-5 py-3 text-sm font-extrabold ${
                        activeTab === tab ? "bg-[#051612] text-white" : "text-[#5f7770]"
                      }`}
                    >
                      {tab === "overview" ? "Overview" : "Company Details"}
                    </button>
                  ))}
                </div>
              </section>

              {activeTab === "overview" ? (
                <>
                  <section className={`${cardClass} p-6 md:p-8`}>
                    <h3 className="mb-6 text-xl font-black text-[#0d211b]">About Company</h3>
                    {isEditing ? (
                      <textarea
                        name="companyDescription"
                        value={profile.companyDescription}
                        onChange={handleChange}
                        className="h-40 w-full resize-none rounded-3xl border border-[#d9e8e2] bg-[#f6fbf8] px-5 py-4 text-sm"
                      />
                    ) : (
                      <p className="text-sm leading-8 text-[#405752]">{saved.companyDescription}</p>
                    )}
                  </section>

                  <section className={`${cardClass} p-6 md:p-8`}>
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-xl font-black text-[#0d211b]">Current Open Positions</h3>
                    </div>

                    <div className="space-y-4">
                      {openJobs.map((job) => (
                        <div
                          key={job.title}
                          className="flex items-center justify-between rounded-3xl border border-[#ebf1ee] bg-[#f9fcfb] px-5 py-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff8f5] text-[#16322b]">
                              <Briefcase size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-[#10211d]">{job.title}</h4>
                              <p className="mt-1 text-xs font-semibold text-[#59706a]">
                                {job.type} · <span className="text-[#40b594]">{job.salary}</span>
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#59706a]">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <section className={`${cardClass} p-6 md:p-8`}>
                  <h3 className="mb-6 text-xl font-black text-[#0d211b]">Company Information</h3>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <EditableField editing={isEditing} label="Company Name" name="companyName" value={profile.companyName} onChange={handleChange} className="md:col-span-2" />
                    <EditableField editing={isEditing} label="Industry" name="industry" value={profile.industry} onChange={handleChange} />
                    <EditableField editing={isEditing} label="Company Size" name="companySize" value={profile.companySize} onChange={handleChange} />
                    <EditableField editing={isEditing} label="Current Address" name="currentAddress" value={profile.currentAddress} onChange={handleChange} className="md:col-span-2" />
                    <EditableSelectYear editing={isEditing} label="Founded Year" name="foundedYear" value={profile.foundedYear} onChange={handleChange} />
                    <EditableField editing={isEditing} label="Country" name="country" value={profile.country} onChange={handleChange} />
                    <EditableField editing={isEditing} label="Contact" name="contact" value={profile.contact} onChange={handleChange} />
                    <EditableField editing={isEditing} label="Website Link" name="websiteLink" value={profile.websiteLink} onChange={handleChange} />
                  </div>
                </section>
              )}

              <section className={`${cardClass} p-6 md:p-8`}>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#0d211b]">Upload Company File</h3>
                    <p className="mt-1 text-sm text-[#6a817b]">
                      Store your company profile, brochure, or supporting document
                    </p>
                  </div>
                  <FileText className="text-[#40b594]" size={22} />
                </div>

                <div className="rounded-[28px] border border-dashed border-[#cfe2db] bg-[#f8fcfa] p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#17332b]">
                        {profile.companyFileName || saved.companyFileName || "No file selected"}
                      </p>
                      <p className="mt-1 text-xs text-[#7a8f89]">
                        Accepted formats: PDF, DOC, DOCX. Max size: 10MB.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={openCompanyFilePicker}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#051612] px-4 py-3 text-sm font-bold text-white"
                          >
                            <Upload size={16} />
                            Upload File
                          </button>

                          {(profile.companyFileName || saved.companyFileName) && (
                            <button
                              type="button"
                              onClick={handleRemoveCompanyFile}
                              className="inline-flex items-center gap-2 rounded-2xl border border-[#d7e5df] bg-white px-4 py-3 text-sm font-bold text-[#b42318]"
                            >
                              <Trash2 size={16} />
                              Remove File
                            </button>
                          )}
                        </>
                      )}

                      {!isEditing && saved.companyFileUrl && (
                        <a
                          href={saved.companyFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#eff8f5] px-4 py-3 text-sm font-bold text-[#0a7e61]"
                        >
                          <FileText size={16} />
                          View File
                        </a>
                      )}
                    </div>
                  </div>

                  <input
                    ref={companyFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleCompanyFileChange}
                    className="hidden"
                  />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      <ImageCropModal
        open={cropOpen}
        imageSrc={sourceImageUrl || saved.profileImageUrl}
        title="Adjust company profile image"
        onClose={handleCropClose}
        onSave={handleCropSave}
        onUploadAnother={openFilePicker}
        onDelete={handleDeleteImage}
        hasImage={!!(sourceImageUrl || saved.profileImageUrl)}
      />
    </>
  );
}

function EditableField({
  editing,
  label,
  name,
  value,
  onChange,
  className = "",
}: {
  editing: boolean;
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-bold text-[#27413a]">{label}</p>
      {editing ? (
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-[#d9e8e2] bg-[#f6fbf8] px-4 py-3 text-sm"
        />
      ) : (
        <div className="rounded-2xl border border-[#edf3f0] bg-[#f9fcfb] px-4 py-3 text-sm font-semibold">
          {value || "Not added"}
        </div>
      )}
    </div>
  );
}

function EditableSelectYear({
  editing,
  label,
  name,
  value,
  onChange,
}: {
  editing: boolean;
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[#27413a]">{label}</p>
      {editing ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-[#d9e8e2] bg-[#f6fbf8] px-4 py-3 text-sm"
        >
          <option value="">Select option</option>
          {Array.from({ length: 60 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={String(year)}>
                {year}
              </option>
            );
          })}
        </select>
      ) : (
        <div className="rounded-2xl border border-[#edf3f0] bg-[#f9fcfb] px-4 py-3 text-sm font-semibold">
          {value || "Not added"}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f4f3] text-[#40b594]">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6b7f79]">
          {label}
        </p>
        <p className="text-sm font-bold text-[#071a15]">{value}</p>
      </div>
    </div>
  );
}
