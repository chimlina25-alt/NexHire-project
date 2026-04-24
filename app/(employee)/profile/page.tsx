// app/my_profile/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  MapPin,
  GraduationCap,
  User2,
  Pencil,
  Save,
  X,
  Sparkles,
  Briefcase,
  Camera,
  Trash2,
  FileText,
  Upload,
} from "lucide-react";
import ImageCropModal from "@/components/ui/ImageCropModal";

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

const cardClass =
  "rounded-[28px] border border-[#e6eeea] bg-white shadow-[0_18px_50px_rgba(7,28,22,0.06)]";

export default function JobSeekerProfile() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const cvInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [profileImage, setProfileImage] = React.useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = React.useState<string | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = React.useState<string | null>(null);
  const [cropOpen, setCropOpen] = React.useState(false);

  const [cvFile, setCvFile] = React.useState<File | null>(null);

  const [saved, setSaved] = React.useState<JobSeekerForm>({
    description:
      "Full stack developer focused on building responsive products, clean UI systems, and reliable frontend experiences.",
    firstName: "Marsslu",
    lastName: "SMC",
    contact: "+855 12 345 678",
    address: "Phnom Penh, Cambodia",
    educationLevel: "Bachelor",
    schoolUniversity: "Royal University of Phnom Penh",
    year: "2020",
    cvFileName: "",
    cvUrl: "",
    profileImageUrl: "",
  });

  const [draft, setDraft] = React.useState<JobSeekerForm>(saved);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setDraft((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const openFilePicker = () => fileInputRef.current?.click();
  const openCvPicker = () => cvInputRef.current?.click();

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

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      alert("CV must be 10MB or smaller");
      e.target.value = "";
      return;
    }

    setCvFile(file);
    setDraft((prev) => ({
      ...prev,
      cvFileName: file.name,
    }));

    e.target.value = "";
  };

  const handleRemoveCv = () => {
    setCvFile(null);
    setDraft((prev) => ({
      ...prev,
      cvFileName: "",
      cvUrl: "",
    }));
    setSaved((prev) => ({
      ...prev,
      cvFileName: "",
      cvUrl: prev.cvFileName === draft.cvFileName ? "" : prev.cvUrl,
    }));

    if (cvInputRef.current) cvInputRef.current.value = "";
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
    setCvFile(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("description", draft.description);
      formData.append("firstName", draft.firstName);
      formData.append("lastName", draft.lastName);
      formData.append("contact", draft.contact);
      formData.append("address", draft.address);
      formData.append("educationLevel", draft.educationLevel);
      formData.append("schoolUniversity", draft.schoolUniversity);
      formData.append("year", draft.year);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      if (cvFile) {
        formData.append("cvFile", cvFile);
      }

      const res = await fetch("/api/auth/job-seeker-profile", {
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
        cvUrl: result.cvUrl || draft.cvUrl,
        cvFileName: result.cvFileName || draft.cvFileName,
        profileImageUrl: result.profileImageUrl || draft.profileImageUrl || saved.profileImageUrl,
      });
      setCvFile(null);
      setIsEditing(false);
    } catch (error) {
      console.error("JOB SEEKER UPDATE ERROR:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${saved.firstName} ${saved.lastName}`.trim();
  const profile = isEditing ? draft : saved;
  const displayImageSrc = croppedPreviewUrl || sourceImageUrl || saved.profileImageUrl || "";

  const completionFields = [
    saved.firstName,
    saved.lastName,
    saved.contact,
    saved.address,
    saved.description,
    saved.educationLevel,
    saved.schoolUniversity,
    saved.year,
    saved.cvFileName || saved.cvUrl,
    saved.profileImageUrl || croppedPreviewUrl || sourceImageUrl,
  ];
  const completion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  return (
    <>
      <div className="min-h-screen bg-[#edf4f1] pb-16 font-sans text-[#10211d]">
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

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">User name</p>
              <p className="text-sm font-bold">Profile</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d4f45] font-bold text-white">
              {saved.firstName.charAt(0) || "U"}
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden bg-[#051612]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(64,181,148,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_28%)]" />
          <div className="relative mx-auto max-w-7xl px-8 py-12 md:py-16">
            <div className="max-w-3xl">
             
              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                {fullName}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                Professional profile, photo, education, and CV storage in one clean layout.
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
                      <img src={displayImageSrc} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-20 w-20 text-white/85" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
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
                  <h2 className="text-2xl font-black text-[#0d211b] md:text-3xl">{fullName}</h2>
                  <p className="mt-2 text-sm font-bold text-[#40b594]">Open to opportunities</p>
                  <p className="mt-4 text-sm leading-7 text-[#58706a]">{saved.description}</p>
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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_2.05fr]">
            <aside className="space-y-8">
              <section className={`${cardClass} p-6`}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#40b594]">
                  Profile Completion
                </p>
                <div className="mb-3 flex items-end justify-between">
                  <p className="text-3xl font-black text-[#0c201a]">{completion}%</p>
                  <p className="text-xs font-semibold text-[#6a817b]">Complete your candidate profile</p>
                </div>
                <div className="h-3 w-full rounded-full bg-[#e5efeb]">
                  <div className="h-3 rounded-full bg-[#40b594]" style={{ width: `${completion}%` }} />
                </div>
              </section>

              <section className={`${cardClass} p-6`}>
                <h3 className="mb-5 text-base font-extrabold text-[#071a15]">Quick Info</h3>
                <div className="space-y-4">
                  <InfoRow icon={Phone} label="Contact" value={saved.contact || "Not added"} />
                  <InfoRow icon={MapPin} label="Address" value={saved.address || "Not added"} />
                  <InfoRow icon={GraduationCap} label="Education" value={saved.educationLevel || "Not added"} />
                </div>
              </section>

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
                  <p className="text-sm font-semibold text-[#17332b]">
                    {saved.cvFileName || "No CV uploaded yet"}
                  </p>
                  {saved.cvUrl ? (
                    <a
                      href={saved.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#0a7e61]"
                    >
                      <FileText size={16} />
                      View uploaded CV
                    </a>
                  ) : (
                    <p className="mt-2 text-xs text-[#7a8f89]">PDF, DOC, or DOCX</p>
                  )}
                </div>
              </section>
            </aside>

            <div className="space-y-8">
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

              <section className={`${cardClass} p-6 md:p-8`}>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-black text-[#0d211b]">Education Details</h3>
                  <Briefcase className="text-[#40b594]" size={22} />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <EditableSelect
                    editing={isEditing}
                    label="Education Level"
                    name="educationLevel"
                    value={profile.educationLevel}
                    onChange={handleChange}
                    options={["High School", "Associate", "Bachelor", "Master", "PhD"]}
                  />
                  <EditableField editing={isEditing} label="School / University" name="schoolUniversity" value={profile.schoolUniversity} onChange={handleChange} />
                  <EditableField editing={isEditing} label="Year" name="year" value={profile.year} onChange={handleChange} />
                </div>
              </section>

              <section className={`${cardClass} p-6 md:p-8`}>
                <h3 className="mb-6 text-xl font-black text-[#0d211b]">About Candidate</h3>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={profile.description}
                    onChange={handleChange}
                    className="h-36 w-full resize-none rounded-3xl border border-[#d9e8e2] bg-[#f6fbf8] px-5 py-4 text-sm"
                  />
                ) : (
                  <p className="text-sm leading-8 text-[#405752]">{saved.description}</p>
                )}
              </section>

              <section className={`${cardClass} p-6 md:p-8`}>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#0d211b]">Upload CV</h3>
                    <p className="mt-1 text-sm text-[#6a817b]">Store your resume directly in this profile</p>
                  </div>
                  <FileText className="text-[#40b594]" size={22} />
                </div>

                <div className="rounded-[28px] border border-dashed border-[#cfe2db] bg-[#f8fcfa] p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#17332b]">
                        {profile.cvFileName || saved.cvFileName || "No CV selected"}
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
                            onClick={openCvPicker}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#051612] px-4 py-3 text-sm font-bold text-white"
                          >
                            <Upload size={16} />
                            Upload CV
                          </button>

                          {(profile.cvFileName || saved.cvFileName) && (
                            <button
                              type="button"
                              onClick={handleRemoveCv}
                              className="inline-flex items-center gap-2 rounded-2xl border border-[#d7e5df] bg-white px-4 py-3 text-sm font-bold text-[#b42318]"
                            >
                              <Trash2 size={16} />
                              Remove CV
                            </button>
                          )}
                        </>
                      )}

                      {!isEditing && saved.cvUrl && (
                        <a
                          href={saved.cvUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#eff8f5] px-4 py-3 text-sm font-bold text-[#0a7e61]"
                        >
                          <FileText size={16} />
                          View CV
                        </a>
                      )}
                    </div>
                  </div>

                  <input
                    ref={cvInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleCvChange}
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
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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

function EditableSelect({
  editing,
  label,
  name,
  value,
  onChange,
  options,
}: {
  editing: boolean;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  options: string[];
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
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <div className="rounded-2xl border border-[#edf3f0] bg-[#f9fcfb] px-4 py-3 text-sm font-semibold">
          {value || "Not added"}
        </div>
      )}
    </div>
  );
}
