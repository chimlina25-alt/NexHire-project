"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Profile = { firstName: string; lastName: string; profileImage: string };

export default function UserNavProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/auth/job-seeker-profile", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          profileImage: data.profileImage || "",
        });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("profileUpdated", handler);
    return () => window.removeEventListener("profileUpdated", handler);
  }, []);

  const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() || "Profile" : "Profile";
  const initials = profile?.firstName?.charAt(0)?.toUpperCase() || "U";

  return (
    <Link href="/profile">
      <div className="flex items-center gap-3 cursor-pointer group">
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Signed in as</p>
          <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors truncate max-w-[120px]">
            {fullName}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#40b594] flex items-center justify-center font-extrabold text-[#051612] text-sm overflow-hidden flex-shrink-0">
          {profile?.profileImage ? (
            <img src={profile.profileImage} alt={fullName} className="w-full h-full object-cover" />
          ) : (initials)}
        </div>
      </div>
    </Link>
  );
}