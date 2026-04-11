"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Bookmark, Settings, X } from 'lucide-react';
import Link from 'next/link';

const JobSeekerHome = () => {
  // --- STATE MANAGEMENT ---
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({
    'Job type': '',
    'On-site': '',
    'Experiences level': '',
    'Salary': ''
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- FILTER OPTIONS ---
  const filterOptions: Record<string, string[]> = {
    'Job type': ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
    'On-site': ['Remote', 'On-site', 'Hybrid'],
    'Experiences level': ['Entry-level', 'Mid-level', 'Senior', 'Lead/Manager', 'Executive'],
    'Salary': ['$50k - $100k', '$100k - $150k', '$150k - $200k', '$250k+']
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node | null)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (category: string, value: string) => {
    setFilters(prev => ({ ...prev, [category]: value }));
    setActiveDropdown(null);
  };

  const jobListings = [
    {
      id: 1,
      title: 'Full Stack Developer',
      company: 'Company name',
      description: 'Work with modern tech stack across frontend and backend.',
      salary: '$190k - $230k',
      tags: ['Part-time', 'Remote', 'Senior']
    },
    {
      id: 2,
      title: 'Computer Science',
      company: 'Company name',
      description: 'Work with modern tech stack across frontend and backend.',
      salary: '$150k - $200k',
      tags: ['Full-time', 'On-site', 'Mid-level']
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      {/* HEADER NAVIGATION */}
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">NexHire</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">
            Home
          </button>
          <Link href="/my_job">
             <button className="hover:text-gray-300 transition-colors">My Jobs</button>
           </Link> 
           <Link href="/message_j">
          <button className="hover:text-gray-300 transition-colors">Messages</button>
          </Link>
          <Link href="/notification_j">
            <button className="hover:text-gray-300 transition-colors">Notification</button>
          </Link>
          <Link href="/setting_j">
            <button className="hover:text-gray-300 transition-colors">Settings</button>
          </Link>
        </nav>

        <Link href="/profile_j">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">User name</p>
            <p className="text-sm font-bold">Profile</p>
          </div>
          <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold text-white">U</div>
        </div>
      </Link>
      </header>

      {/* HERO SECTION */}
      <section className="bg-[#051612] text-white pt-20 pb-24 px-8 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-4">Your Next Great Role</h1>
          <p className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed">
            Discover opportunities matched to your skills, experience, and career goals.
          </p>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="search jobs by title, company, or skills..." 
                className="w-full bg-white text-black py-4 pl-12 pr-4 rounded-xl focus:outline-none"
              />
            </div>
            <button className="bg-[#1e3a32] px-8 py-4 rounded-xl font-bold hover:bg-[#2d4f45] transition-all border border-[#2d4f45]">
              Search
            </button>
          </div>

          {/* FILTER DROPDOWNS */}
          <div className="flex flex-wrap gap-3" ref={dropdownRef}>
            {Object.keys(filterOptions).map((category) => (
              <div key={category} className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === category ? null : category)}
                  className={`border px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                    filters[category] 
                    ? 'bg-[#40b594] border-[#40b594] text-white' 
                    : 'bg-[#122b25] border-[#1e3a32] text-gray-300 hover:bg-[#1e3a32]'
                  }`}
                >
                  {filters[category] || category}
                  {filters[category] ? (
                    <X size={14} className="ml-1" onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(category, '');
                    }} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>

                {activeDropdown === category && (
                  <div className="absolute left-0 mt-2 w-56 bg-[#122b25] border border-[#1e3a32] rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="py-2">
                      {filterOptions[category].map((option: string) => (
                        <button
                          key={option}
                          onClick={() => handleSelect(category, option)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1e3a32] hover:text-white transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    
                    {/* CUSTOM INPUT OPTION */}
                    <div className="p-3 border-t border-[#1e3a32] bg-[#0d1f1b]">
                      <input 
                        type="text"
                        placeholder="other..."
                        className="w-full bg-[#051612] text-white text-xs p-2.5 rounded-lg border border-[#1e3a32] focus:outline-none focus:border-[#40b594]"
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                            handleSelect(category, e.currentTarget.value);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOB LISTINGS */}
      <main className="max-w-4xl mx-auto p-8 -mt-12">
        <div className="space-y-6">
          {jobListings.map((job) => (
            <div key={job.id} className="bg-white p-8 rounded-[25px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-extrabold text-[#1a1a1a]">{job.title}</h2>
                <div className="flex gap-3">
                  <Link href="/">
                    <button className="bg-[#153a30] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#0d2a23]">View Details</button>
                  </Link>
                  <button className="bg-[#153a30] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#0d2a23]">Apply</button>
                  <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:text-black hover:border-gray-300">
                    <Bookmark size={20} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-500 font-bold text-sm mb-4">{job.company}</p>
              <p className="text-gray-400 text-sm mb-6">{job.description}</p>
              
              <div className="flex items-center gap-6">
                <span className="text-xl font-extrabold text-[#1a1a1a]">{job.salary}</span>
                <div className="flex gap-2">
                  {job.tags.map((tag) => (
                    <span key={tag} className="bg-[#153a30] text-white text-[10px] font-bold px-3 py-1.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default JobSeekerHome;