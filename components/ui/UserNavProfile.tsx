"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type MeResponse = {
  userId: string;
  email: string;
  role: "employer" | "job_seeker";
  displayName: string;
  avatar: string | null;
  profilePath: string;
};

export default function UserNavProfile() {
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (res.ok) {
          setMe(data);
        }
      } catch (error) {
        console.error("LOAD USER NAV PROFILE ERROR:", error);
      }
    };

    load();
  }, []);

  const displayName = me?.displayName || "Profile";
  const avatar = me?.avatar || null;
  const profilePath = me?.profilePath || "/profile";
  const initial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <Link href={profilePath}>
      <div className="flex items-center gap-4 cursor-pointer">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-400">User name</p>
          <p className="text-sm font-bold truncate max-w-[140px] text-white">{displayName}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#2d4f45] font-bold text-white">
          {avatar ? (
            <img src={avatar} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
      </div>
    </Link>
  );
}