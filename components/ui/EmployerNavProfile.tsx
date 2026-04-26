"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Profile = {
  companyName: string;
  profileImage: string | null;
};

export default function EmployerNavProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/employer-profile", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            companyName:  data.companyName  ?? "Company",
            profileImage: data.profileImage ?? null,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const initial = profile?.companyName?.charAt(0)?.toUpperCase() ?? "C";

  return (
    <Link href="/employer_profile">
      <div className="flex items-center gap-3 cursor-pointer group">
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Company
          </p>
          <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors truncate max-w-[120px]">
            {profile?.companyName ?? "Profile"}
          </p>
        </div>
        <div className="w-10 h-10 bg-[#40b594] rounded-full flex items-center justify-center font-extrabold text-[#051612] text-sm overflow-hidden flex-shrink-0">
          {profile?.profileImage ? (
            <img
              src={profile.profileImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
      </div>
    </Link>
  );
}