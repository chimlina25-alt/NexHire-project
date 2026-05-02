"use client";
import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Mail,
  Save,
  User,
  Trash2,
  LogOut,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ExternalLink,
  UserCog,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ProfileData = {
  firstName: string;
  lastName: string;
  educationLevel: string;
  cvFileName: string;
  cvUrl: string;
  profileImageUrl: string;
};

type Toast = { id: number; type: "success" | "error"; message: string };

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed right-6 top-20 z-[9999] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold shadow-xl transition-all ${
            t.type === "success" ? "bg-[#051612] text-white" : "bg-red-600 text-white"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 size={16} className="text-[#40b594]" />
          ) : (
            <XCircle size={16} className="text-red-300" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

const EmployeeSettings = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("general");
  const [profileLoading, setProfileLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    educationLevel: "",
    cvFileName: "",
    cvUrl: "",
    profileImageUrl: "",
  });

  const [accountEmail, setAccountEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // password
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // delete
  const [deleteText, setDeleteText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // logout
  const [logoutLoading, setLogoutLoading] = useState(false);

  const addToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // Load profile + email from existing profile endpoint
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/auth/job-seeker-profile", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data) return;

        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          educationLevel: data.educationLevel || "",
          cvFileName: data.cvFileName || "",
          cvUrl: data.cvUrl || "",
          profileImageUrl: data.profileImage || "",
        });

        if (data.email) setAccountEmail(data.email);
      } catch (err) {
        console.error("Settings: failed to load profile", err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "—";

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      router.push("/login");
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to sign out. Please try again.");
      setLogoutLoading(false);
    }
  };

  // ── Update email — calls /api/auth/setting with action: "update_email" ────
  const handleSaveEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      addToast("error", "Please enter a valid email address.");
      return;
    }
    try {
      setEmailLoading(true);
      const res = await fetch("/api/auth/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_email", newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update email");
      setAccountEmail(newEmail);
      setNewEmail("");
      addToast("success", "Email updated successfully.");
    } catch (err: any) {
      addToast("error", err.message || "Failed to update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Change password — calls /api/auth/setting with action: "change_password"
  const handleChangePassword = async () => {
    setPasswordError("");

    if (!passwordForm.currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await fetch("/api/auth/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      addToast("success", "Password updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      addToast("error", err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Delete account — calls /api/auth/setting with action: "delete_account" ─
  const handleDeleteAccount = async () => {
    if (deleteText !== "DELETE") return;
    try {
      setDeleteLoading(true);
      const res = await fetch("/api/auth/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_account" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");
      router.push("/");
    } catch (err: any) {
      addToast("error", err.message || "Failed to delete account.");
      setDeleteLoading(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: UserCog },
    { id: "security", name: "Security", icon: Shield },
    { id: "danger", name: "Danger Zone", icon: AlertTriangle },
  ];

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-[#f8faf9] px-4 py-3 text-sm font-medium text-[#071a15] placeholder-[#9ab0aa] transition-all focus:border-[#40b594] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30";
  const labelClass = "mb-2 block text-sm font-extrabold text-[#071a15]";

  return (
    <div className="min-h-screen bg-[#f0f4f3] pb-16 font-sans">
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-[#051612] px-8 py-4 text-white shadow-lg">
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
            <button className="transition-colors hover:text-gray-300">Messages</button>
          </Link>
          <Link href="/notification">
            <button className="transition-colors hover:text-gray-300">Notification</button>
          </Link>
          <button className="border-b-2 border-[#40b594] pb-1 text-[#40b594]">Settings</button>
        </nav>
        <Link href="/profile">
          <div className="group flex cursor-pointer items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Signed in as</p>
              <p className="max-w-[140px] truncate text-sm font-bold text-white transition-colors group-hover:text-[#40b594]">
                {profileLoading ? "Loading…" : fullName}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#2d4f45] font-bold text-white">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                profile.firstName.charAt(0).toUpperCase() || "U"
              )}
            </div>
          </div>
        </Link>
      </header>

      {/* Page title */}
      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="mb-8">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#40b594]">Account</p>
          <h1 className="text-4xl font-extrabold text-[#071a15]">Settings</h1>
          <p className="mt-1 font-medium text-[#4a5a55]">
            Manage account controls, email settings, and security
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <aside className="flex-shrink-0 lg:w-72">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === "danger";
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-5 py-4 text-sm font-bold transition-all ${
                      idx !== 0 ? "border-t border-gray-100" : ""
                    } ${
                      isActive
                        ? isDanger
                          ? "bg-red-50 text-red-600"
                          : "bg-[#f0f9f6] text-[#071a15]"
                        : isDanger
                        ? "text-red-400 hover:bg-red-50 hover:text-red-600"
                        : "text-[#4a5a55] hover:bg-[#f8faf9] hover:text-[#071a15]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isActive ? (isDanger ? "bg-red-100" : "bg-[#d1e8e3]") : "bg-[#f0f4f3]"
                          }`}
                        >
                          <Icon
                            size={16}
                            className={
                              isActive
                                ? isDanger
                                  ? "text-red-600"
                                  : "text-[#40b594]"
                                : isDanger
                                ? "text-red-400"
                                : "text-[#6b7f79]"
                            }
                          />
                        </div>
                        {tab.name}
                      </div>
                      {isActive && (
                        <ChevronRight size={16} className={isDanger ? "text-red-400" : "text-[#40b594]"} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 text-sm font-bold text-[#4a5a55] shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f4f3]">
                {logoutLoading ? (
                  <Loader2 size={16} className="animate-spin text-[#6b7f79]" />
                ) : (
                  <LogOut size={16} className="text-[#6b7f79]" />
                )}
              </div>
              {logoutLoading ? "Signing out…" : "Sign Out"}
            </button>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1">

            {/* ══ General Tab ══ */}
            {activeTab === "general" && (
              <div className="space-y-6">
                {/* Profile Overview */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-8 py-6">
                    <h2 className="text-lg font-extrabold text-[#071a15]">Profile Overview</h2>
                    <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">
                      Personal information and CV are managed from your profile page
                    </p>
                  </div>
                  <div className="p-8">
                    {profileLoading ? (
                      <div className="flex items-center gap-3 text-sm text-[#6b7f79]">
                        <Loader2 size={16} className="animate-spin text-[#40b594]" />
                        Loading profile data…
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-3">
                        <SummaryCard icon={User} label="Full Name" value={fullName || "Not added"} />
                        <SummaryCard icon={Briefcase} label="Education" value={profile.educationLevel || "Not added"} />
                        <SummaryCard
                          icon={FileText}
                          label="CV"
                          value={profile.cvFileName || (profile.cvUrl ? "Resume available" : "No CV uploaded")}
                        />
                      </div>
                    )}
                    <div className="mt-6 rounded-2xl border border-[#d1e8e3] bg-[#f0f9f6] p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-[#071a15]">
                            Edit your profile from the profile page
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#4a5a55]">
                            Keep your public information, profile image, and CV in one place.
                          </p>
                        </div>
                        <Link href="/my_profile">
                          <button className="inline-flex items-center gap-2 rounded-xl bg-[#051612] px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23]">
                            Open Profile
                            <ExternalLink size={16} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Update Email */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-8 py-6">
                    <h2 className="text-lg font-extrabold text-[#071a15]">Account Email</h2>
                    <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">
                      Update the email address used to sign in
                    </p>
                  </div>
                  <div className="p-8">
                    <div className="max-w-md space-y-6">
                      {/* Current email — read only */}
                      <div>
                        <label className={labelClass}>Current Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                          <input
                            type="email"
                            value={accountEmail}
                            disabled
                            className={`${inputClass} pl-10 opacity-60 cursor-not-allowed`}
                          />
                        </div>
                      </div>
                      {/* New email */}
                      <div>
                        <label className={labelClass}>New Email Address</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                          <input
                            type="email"
                            placeholder="Enter new email address"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                        <p className="ml-1 mt-2 text-xs font-semibold text-[#6b7f79]">
                          You will use this email to sign in going forward
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleSaveEmail}
                          disabled={emailLoading || !newEmail}
                          className="flex items-center gap-2 rounded-xl bg-[#051612] px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {emailLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          {emailLoading ? "Saving…" : "Update Email"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ Security Tab ══ */}
            {activeTab === "security" && (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-8 py-6">
                  <h2 className="text-lg font-extrabold text-[#071a15]">Change Password</h2>
                  <p className="mt-0.5 text-sm font-medium text-[#4a5a55]">
                    Update your account password — must be at least 8 characters
                  </p>
                </div>
                <div className="p-8">
                  <div className="max-w-md space-y-6">

                    {/* Current password */}
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input
                          type={showCurrent ? "text" : "password"}
                          placeholder="Enter current password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                          }
                          className={`${inputClass} pl-10 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] hover:text-[#071a15]"
                        >
                          {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div>
                      <label className={labelClass}>New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input
                          type={showNew ? "text" : "password"}
                          placeholder="Minimum 8 characters"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                          }
                          className={`${inputClass} pl-10 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] hover:text-[#071a15]"
                        >
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="ml-1 mt-2 text-xs font-semibold text-[#6b7f79]">
                        Must be at least 8 characters.
                      </p>
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label className={labelClass}>Confirm New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79]" />
                        <input
                          type={showConfirm ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                          }
                          className={`${inputClass} pl-10 pr-10 ${
                            passwordForm.confirmPassword &&
                            passwordForm.confirmPassword !== passwordForm.newPassword
                              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7f79] hover:text-[#071a15]"
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordForm.confirmPassword &&
                        passwordForm.confirmPassword !== passwordForm.newPassword && (
                          <p className="ml-1 mt-1.5 text-xs font-semibold text-red-500">
                            Passwords do not match
                          </p>
                        )}
                    </div>

                    {/* Single error message */}
                    {passwordError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-xs font-semibold text-red-600">• {passwordError}</p>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={
                          passwordLoading ||
                          !passwordForm.currentPassword ||
                          !passwordForm.newPassword ||
                          !passwordForm.confirmPassword
                        }
                        className="flex items-center gap-2 rounded-xl bg-[#051612] px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-[#0d2a23] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {passwordLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Shield size={16} />
                        )}
                        {passwordLoading ? "Updating…" : "Update Password"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ Danger Zone Tab ══ */}
            {activeTab === "danger" && (
              <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
                <div className="border-b border-red-100 bg-red-50/50 px-8 py-6">
                  <h2 className="text-lg font-extrabold text-red-600">Danger Zone</h2>
                  <p className="mt-0.5 text-sm font-medium text-red-400">
                    These actions are permanent and cannot be undone
                  </p>
                </div>
                <div className="p-8">
                  <div className="rounded-2xl border border-red-100 bg-red-50/30 p-7">
                    <div className="mb-6 flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100">
                        <Trash2 size={18} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#071a15]">Delete Account</h3>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-[#4a5a55]">
                          This will permanently delete your account
                          {fullName !== "—" ? ` for ${fullName}` : ""}, saved jobs, messages, and
                          profile history. This action cannot be reversed.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-extrabold text-[#071a15]">
                          Type{" "}
                          <span className="font-black tracking-widest text-red-600">DELETE</span>{" "}
                          to confirm
                        </label>
                        <input
                          type="text"
                          placeholder="Type DELETE here"
                          value={deleteText}
                          onChange={(e) => setDeleteText(e.target.value)}
                          className="w-full max-w-sm rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-[#071a15] placeholder-red-200 transition-all focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300/40"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={deleteText !== "DELETE" || deleteLoading}
                        className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold transition-all ${
                          deleteText === "DELETE" && !deleteLoading
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "cursor-not-allowed bg-red-100 text-red-300"
                        }`}
                      >
                        {deleteLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        {deleteLoading ? "Deleting…" : "Delete Account"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-[#f8faf9] p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5f1]">
        <Icon size={18} className="text-[#40b594]" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-wider text-[#6b7f79]">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-[#071a15]">{value}</p>
    </div>
  );
}

export default EmployeeSettings;