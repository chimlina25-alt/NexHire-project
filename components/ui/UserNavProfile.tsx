"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Profile = {
  firstName: string;
  lastName: string;
  profileImage: string;
};

export default function UserNavProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [imgCacheBust, setImgCacheBust] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/auth/job-seeker-profile?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          profileImage: data.profileImage || "",
        });
        setImgCacheBust(Date.now());
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("profileUpdated", load);
    return () => window.removeEventListener("profileUpdated", load);
  }, [load]);

  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim() || "Profile"
    : "Profile";
  const initials = profile?.firstName?.charAt(0)?.toUpperCase() || "U";

  return (
    <Link href="/profile">
      <div className="flex items-center gap-3 cursor-pointer group">
        <div className="text-right">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Signed in as
          </p>
          <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors truncate max-w-[120px]">
            {fullName}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#2d4f45] flex items-center justify-center font-extrabold text-white text-sm overflow-hidden flex-shrink-0">
          {profile?.profileImage ? (
            <img
              src={`${profile.profileImage}?t=${imgCacheBust}`}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      </div>
    </Link>
  );
}