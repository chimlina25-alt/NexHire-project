"use client";

import React from "react";
import Link from "next/link";
import { useEmployerProfile } from "@/context/EmployerProfileContext";

export default function EmployerNavProfile() {
  const { profile } = useEmployerProfile();

  const name = profile?.companyName || "Company";
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link href="/employer_profile">
      <div className="group flex cursor-pointer items-center gap-3">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Company</p>
          <p className="text-sm font-bold text-white transition-colors group-hover:text-[#40b594]">
            {name}
          </p>
        </div>
        {profile?.profileImage ? (
          <img
            src={profile.profileImage}
            alt={name}
            className="h-10 w-10 rounded-full object-cover border-2 border-[#40b594]"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#40b594] text-sm font-extrabold text-[#051612]">
            {initial}
          </div>
        )}
      </div>
    </Link>
  );
}