"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  X,
  MapPin,
  Clock,
  DollarSign,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import UserNavProfile from "@/components/ui/UserNavProfile";

const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const experienceOptions = ["Entry Level", "Mid Level", "Senior", "Lead / Manager", "Executive"];
const salaryOptions = ["$50k – $100k", "$100k – $150k", "$150k – $200k", "$200k+"];

const tagColors: Record<string, string> = {
  "Full-time": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Part-time": "bg-blue-50 text-blue-700 border-blue-100",
  Contract: "bg-orange-50 text-orange-700 border-orange-100",
  Freelance: "bg-pink-50 text-pink-700 border-pink-100",
  Internship: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Remote: "bg-violet-50 text-violet-700 border-violet-100",
  "On-site": "bg-gray-50 text-gray-600 border-gray-200",
  Hybrid: "bg-teal-50 text-teal-700 border-teal-100",
  Senior: "bg-amber-50 text-amber-700 border-amber-100",
  "Mid Level": "bg-sky-50 text-sky-700 border-sky-100",
  "Entry Level": "bg-rose-50 text-rose-700 border-rose-100",
  Executive: "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Lead / Manager": "bg-purple-50 text-purple-700 border-purple-100",
};

const JobSeekerHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Most Relevant");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    jobType: "",
    experience: "",
    salary: "",
    arrangement: "",
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearFilters = () =>
    setFilters({ jobType: "", experience: "", salary: "", arrangement: "" });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const pillFilters: { key: keyof typeof filters; label: string; options: string[] }[] = [
    { key: "jobType", label: "Job Type", options: jobTypeOptions },
    { key: "arrangement", label: "Work Mode", options: ["On-site", "Remote", "Hybrid"] },
    { key: "experience", label: "Experience", options: experienceOptions },
    { key: "salary", label: "Salary", options: salaryOptions },
  ];

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: "#f0f4f3" }}>
      <header className="flex items-center justify-between bg-[#051612] px-8 py-4 text-white">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NexHire" className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/home_page">
            <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Home</button>
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
          <Link href="/setting">
            <button className="transition-colors hover:text-gray-300">Settings</button>
          </Link>
        </nav>

        <UserNavProfile />
      </header>

      <section className="bg-[#051612] text-white pt-16 pb-28 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-3 leading-tight tracking-tight">
            Your Next Great Role
          </h1>
          <p className="text-gray-400 text-base mb-10 max-w-md leading-relaxed font-medium">
            Discover opportunities matched to your skills, experience, and career goals.
          </p>

          <div className="flex gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Job title, company, or skill..."
                className="w-full bg-white text-[#071a15] py-3.5 pl-11 pr-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#40b594]/40 placeholder-gray-400"
              />
            </div>
            <button className="bg-[#40b594] text-[#051612] px-8 py-3.5 rounded-xl font-extrabold text-sm hover:bg-[#34a382] transition-all">
              Search
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5" ref={dropdownRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                showFilters
                  ? "bg-[#40b594] border-[#40b594] text-[#051612]"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              <SlidersHorizontal size={12} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#051612] text-[#40b594] rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-extrabold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilters &&
              pillFilters.map(({ key, label, options }) => (
                <div key={key} className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                      filters[key]
                        ? "bg-[#40b594] border-[#40b594] text-[#051612]"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {filters[key] || label}
                    {filters[key] ? (
                      <X
                        size={11}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilters((p) => ({ ...p, [key]: "" }));
                        }}
                      />
                    ) : (
                      <ChevronDown
                        size={11}
                        className={`transition-transform ${activeDropdown === key ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {activeDropdown === key && (
                    <div className="absolute left-0 top-full mt-2 w-52 bg-[#0d2219] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="py-1.5">
                        {options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setFilters((p) => ({ ...p, [key]: opt }));
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                              filters[key] === opt
                                ? "bg-[#40b594]/20 text-[#40b594]"
                                : "text-gray-300 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors px-1"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobSeekerHome;
