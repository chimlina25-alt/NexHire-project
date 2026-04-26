"use client";

import React from "react";
import { Camera, ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageCropModal from "@/components/ui/ImageCropModal";

export default function JobSeekerProfile() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = React.useState<string | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = React.useState<string | null>(null);
  const [cropOpen, setCropOpen] = React.useState(false);

  const [form, setForm] = React.useState({
    description: "",
    firstName: "",
    lastName: "",
    contact: "",
    address: "",
    educationLevel: "",
    schoolUniversity: "",
    year: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleCircleAction = () => {
    if (sourceImageUrl) {
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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  const handleCropSave = (file: File, previewUrl: string) => {
    if (croppedPreviewUrl) {
      URL.revokeObjectURL(croppedPreviewUrl);
    }

    setProfileImage(file);
    setCroppedPreviewUrl(previewUrl);
    setCropOpen(false);
  };

  const handleCropClose = () => {
    setCropOpen(false);
  };

  React.useEffect(() => {
    return () => {
      if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
      if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    };
  }, [sourceImageUrl, croppedPreviewUrl]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("description", form.description);
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("contact", form.contact);
      formData.append("address", form.address);
      formData.append("educationLevel", form.educationLevel);
      formData.append("schoolUniversity", form.schoolUniversity);
      formData.append("year", form.year);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const res = await fetch("/api/auth/job-seeker-profile", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : {};

      if (!res.ok) {
        alert(result.error || "Failed to save profile");
        setLoading(false);
        return;
      }

      if (!result.next) {
        alert("Missing redirect page");
        setLoading(false);
        return;
      }

      router.push(result.next);
    } catch (error) {
      console.error("JOB SEEKER SUBMIT ERROR:", error);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-[#f8fafc] font-sans">
        <div className="absolute left-0 top-0 z-0 h-64 w-full bg-[#0d2a23]" />

        <div className="relative z-10 mx-auto max-w-6xl p-4 md:p-8">
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="NexHire" className="h-8 w-8" />
              <span className="text-xl font-bold tracking-tight text-white">NexHire</span>
            </div>
            <Link
              href="/role_choosing"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-bold text-[#0d2a23] shadow-md transition-all hover:bg-gray-100"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
          </div>

          <div className="flex flex-col gap-16 rounded-[30px] bg-white p-8 shadow-2xl md:p-16 lg:flex-row">
            <div className="flex flex-col items-center lg:w-1/3">
              <h2 className="mb-10 text-center text-2xl font-bold text-[#1a1a1a]">
                Job Seeker&apos;s Profile
              </h2>

              <div className="relative mb-6">
                <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-full bg-[#4a907d]">
                  {croppedPreviewUrl ? (
                    <img
                      src={croppedPreviewUrl}
                      alt="Job seeker preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="mt-8 h-32 w-32 text-white/80"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCircleAction}
                  title={sourceImageUrl ? "Edit image" : "Upload image"}
                  className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#00a37b] text-white transition-transform hover:scale-105"
                >
                  {sourceImageUrl ? <Pencil size={18} /> : <Camera size={20} />}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <p className="mb-8 text-xs text-gray-400">
                Click the icon on the photo to upload first, then edit crop later
              </p>

              <div className="w-full space-y-2">
                <label className="ml-1 text-sm font-medium text-gray-600">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="h-32 w-full resize-none rounded-2xl border border-gray-200 bg-[#f8fafc] p-4 text-sm text-gray-700 transition-all focus:border-[#00a37b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a37b]/15"
                />
              </div>
            </div>

            <div className="space-y-10 lg:w-2/3">
              <section>
                <h3 className="mb-6 text-xl font-bold text-[#1a1a1a]">User Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter first name"
                      className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-5 py-3.5 text-sm text-gray-700 focus:border-[#00a37b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a37b]/15"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter last name"
                      className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-5 py-3.5 text-sm text-gray-700 focus:border-[#00a37b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a37b]/15"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">
                      Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter contact"
                      className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-5 py-3.5 text-sm text-gray-700 focus:border-[#00a37b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a37b]/15"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter address"
                      className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-5 py-3.5 text-sm text-gray-700 focus:border-[#00a37b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a37b]/15"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-6 text-xl font-bold text-[#1a1a1a]">Education</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Education level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="educationLevel"
                      value={form.educationLevel}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-5 py-3.5 text-sm text-gray-700 focus:border-[#00a37b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a37b]/15"
                    >
                      <option value="">Select option</option>
                      <option value="High School">High School</option>
                      <option value="Associate">Associate</option>
                      <option value="Bachelor">Bachelor</option>
                      <option value="Master">Master</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      School / University <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="schoolUniversity"
                      value={form.schoolUniversity}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter school or university"
                      className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-5 py-3.5 text-sm text-gray-700 focus:border-[#00a37b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a37b]/15"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="year"
                      value={form.year}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter year"
                      className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-5 py-3.5 text-sm text-gray-700 focus:border-[#00a37b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a37b]/15"
                    />
                  </div>

                  <div className="mt-4 flex items-end justify-end">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-48 rounded-2xl bg-[#2d4f45] py-3.5 font-bold text-white shadow-xl shadow-[#2d4f45]/20 transition-all hover:bg-[#1e3a32] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Saving..." : "Next"}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <ImageCropModal
        open={cropOpen}
        imageSrc={sourceImageUrl}
        title="Adjust profile photo"
        onClose={handleCropClose}
        onSave={handleCropSave}
        onUploadAnother={openFilePicker}
        onDelete={handleDeleteImage}
        hasImage={!!sourceImageUrl}
      />
    </>
  );
}