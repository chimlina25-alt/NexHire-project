"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type ProfileData = {
  companyName: string;
  profileImage: string;
};

type ContextType = {
  profile: ProfileData | null;
  refresh: () => void;
};

const EmployerProfileContext = createContext<ContextType>({
  profile: null,
  refresh: () => {},
});

export function EmployerProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/employer/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setProfile({ companyName: d.companyName || "", profileImage: d.profileImage || "" });
      });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <EmployerProfileContext.Provider value={{ profile, refresh }}>
      {children}
    </EmployerProfileContext.Provider>
  );
}

export const useEmployerProfile = () => useContext(EmployerProfileContext);