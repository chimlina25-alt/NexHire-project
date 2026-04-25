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

export default function EmployerNavProfile() {
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
        console.error("LOAD EMPLOYER NAV PROFILE ERROR:", error);
      }
    };

    load();
  }, []);

  const displayName = me?.displayName || "Company";
  const avatar = me?.avatar || null;
  const profilePath = me?.profilePath || "/employer_profile";
  const initial = displayName.charAt(0).toUpperCase() || "C";

  return (
    <Link href={profilePath}>
      <div className="flex items-center gap-3 cursor-pointer group">
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Company</p>
          <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors truncate max-w-[160px]">
            {displayName}
          </p>
        </div>

        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#40b594] flex items-center justify-center font-extrabold text-[#051612] text-sm">
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
