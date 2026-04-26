"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Bookmark, BookmarkCheck, X, MapPin, Clock, DollarSign, TrendingUp, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

// ── DATA ────────────────────────────────────────────────────────────────────
const jobTypeOptions    = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const experienceOptions = ['Entry Level', 'Mid Level', 'Senior', 'Lead / Manager', 'Executive'];
const salaryOptions     = ['$50k – $100k', '$100k – $150k', '$150k – $200k', '$200k+'];

const jobListings = [
  {
    id: 1,
    title: 'Full Stack Developer',
    company: 'Acme Technologies',
    category: 'IT & Software',
    location: 'Phnom Penh',
    arrangement: 'Remote',
    type: 'Part-time',
    experience: 'Senior',
    description: 'Build and maintain scalable web applications using React, Node.js, and PostgreSQL. Collaborate with cross-functional teams to ship high-quality features.',
    salary: '$190k – $230k',
    posted: '2 days ago',
    deadline: '30 May 2025',
    logo: 'AT',
    logoColor: '#1a4f3a',
  },
  {
    id: 2,
    title: 'Product Designer',
    company: 'Bright Solutions',
    category: 'Design',
    location: 'Remote',
    arrangement: 'Remote',
    type: 'Full-time',
    experience: 'Mid Level',
    description: 'Own end-to-end product design from discovery to delivery. Work closely with engineers and PMs to create intuitive, delightful user experiences.',
    salary: '$150k – $200k',
    posted: '5 days ago',
    deadline: '15 Jun 2025',
    logo: 'BS',
    logoColor: '#2d3a8c',
  },
  {
    id: 3,
    title: 'Data Scientist',
    company: 'Nexora Analytics',
    category: 'IT & Software',
    location: 'Siem Reap',
    arrangement: 'Hybrid',
    type: 'Full-time',
    experience: 'Senior',
    description: 'Develop machine learning models and statistical analyses to drive key business decisions. Strong Python and SQL skills required.',
    salary: '$160k – $210k',
    posted: '1 week ago',
    deadline: '20 Jun 2025',
    logo: 'NA',
    logoColor: '#5a2d82',
  },
  {
    id: 4,
    title: 'Marketing Manager',
    company: 'GrowthLab',
    category: 'Marketing',
    location: 'Phnom Penh',
    arrangement: 'On-site',
    type: 'Full-time',
    experience: 'Mid Level',
    description: 'Lead campaign strategy, manage a small team, and drive user acquisition across digital and offline channels in a fast-growing startup.',
    salary: '$80k – $120k',
    posted: '3 days ago',
    deadline: '10 Jun 2025',
    logo: 'GL',
    logoColor: '#7a3a1a',
  },
];

const tagColors: Record<string, string> = {
  'Full-time':      'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Part-time':      'bg-blue-50 text-blue-700 border-blue-100',
  'Contract':       'bg-orange-50 text-orange-700 border-orange-100',
  'Freelance':      'bg-pink-50 text-pink-700 border-pink-100',
  'Internship':     'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Remote':         'bg-violet-50 text-violet-700 border-violet-100',
  'On-site':        'bg-gray-50 text-gray-600 border-gray-200',
  'Hybrid':         'bg-teal-50 text-teal-700 border-teal-100',
  'Senior':         'bg-amber-50 text-amber-700 border-amber-100',
  'Mid Level':      'bg-sky-50 text-sky-700 border-sky-100',
  'Entry Level':    'bg-rose-50 text-rose-700 border-rose-100',
  'Executive':      'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Lead / Manager': 'bg-purple-50 text-purple-700 border-purple-100',
};

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
const JobSeekerHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs]     = useState<number[]>([]);
  const [sortBy, setSortBy]           = useState('Most Relevant');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    jobType:     '',
    experience:  '',
    salary:      '',
    arrangement: '',
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSave = (id: number) =>
    setSavedJobs(prev => prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]);

  const clearFilters = () =>
    setFilters({ jobType: '', experience: '', salary: '', arrangement: '' });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filteredJobs = jobListings.filter(job => {
    const q = searchQuery.toLowerCase();
    if (q && !job.title.toLowerCase().includes(q) &&
        !job.company.toLowerCase().includes(q) &&
        !job.category.toLowerCase().includes(q)) return false;
    if (filters.jobType     && job.type        !== filters.jobType)     return false;
    if (filters.experience  && job.experience  !== filters.experience)  return false;
    if (filters.arrangement && job.arrangement !== filters.arrangement) return false;
    return true;
  });

  const pillFilters: { key: keyof typeof filters; label: string; options: string[] }[] = [
    { key: 'jobType',     label: 'Job Type',   options: jobTypeOptions    },
    { key: 'arrangement', label: 'Work Mode',  options: ['On-site', 'Remote', 'Hybrid'] },
    { key: 'experience',  label: 'Experience', options: experienceOptions },
    { key: 'salary',      label: 'Salary',     options: salaryOptions     },
  ];

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: '#f0f4f3' }}>

      {/* ── HEADER ── */}
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Home</button>
          <Link href="/saved"><button className="text-gray-300 hover:text-white transition-colors">My Jobs</button></Link>
          <Link href="/message"><button className="text-gray-300 hover:text-white transition-colors">Messages</button></Link>
          <Link href="/notification"><button className="text-gray-300 hover:text-white transition-colors">Notifications</button></Link>
          <Link href="/setting"><button className="text-gray-300 hover:text-white transition-colors">Settings</button></Link>
        </nav>

        <Link href="/profile">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Signed in as</p>
              <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors">My Profile</p>
            </div>
            <div className="w-10 h-10 bg-[#40b594] rounded-full flex items-center justify-center font-extrabold text-[#051612] text-sm">U</div>
          </div>
        </Link>
      </header>

      {/* ── HERO / SEARCH ── */}
      <section className="bg-[#051612] text-white pt-16 pb-28 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={13} className="text-[#40b594]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#40b594]">238 new roles this week</span>
          </div>

          <h1 className="text-5xl font-extrabold mb-3 leading-tight tracking-tight">
            Your Next Great Role
          </h1>
          <p className="text-gray-400 text-base mb-10 max-w-md leading-relaxed font-medium">
            Discover opportunities matched to your skills, experience, and career goals.
          </p>

          {/* ── SEARCH BAR ── */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Job title, company, or skill..."
                className="w-full bg-white text-[#071a15] py-3.5 pl-11 pr-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#40b594]/40 placeholder-gray-400"
              />
            </div>
            <button className="bg-[#40b594] text-[#051612] px-8 py-3.5 rounded-xl font-extrabold text-sm hover:bg-[#34a382] transition-all">
              Search
            </button>
          </div>

          {/* ── PILL FILTERS ── */}
          <div className="flex flex-wrap items-center gap-2.5" ref={dropdownRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                showFilters
                  ? 'bg-[#40b594] border-[#40b594] text-[#051612]'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
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

            {showFilters && pillFilters.map(({ key, label, options }) => (
              <div key={key} className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                    filters[key]
                      ? 'bg-[#40b594] border-[#40b594] text-[#051612]'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {filters[key] || label}
                  {filters[key] ? (
                    <X size={11} onClick={e => { e.stopPropagation(); setFilters(p => ({ ...p, [key]: '' })); }} />
                  ) : (
                    <ChevronDown size={11} className={`transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {activeDropdown === key && (
                  <div className="absolute left-0 top-full mt-2 w-52 bg-[#0d2219] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="py-1.5">
                      {options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setFilters(p => ({ ...p, [key]: opt })); setActiveDropdown(null); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                            filters[key] === opt
                              ? 'bg-[#40b594]/20 text-[#40b594]'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div className="p-2.5 border-t border-white/10">
                      <input
                        type="text"
                        placeholder="Type custom value..."
                        className="w-full bg-white/5 text-white text-xs px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#40b594] placeholder-gray-500"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            setFilters(p => ({ ...p, [key]: e.currentTarget.value.trim() }));
                            setActiveDropdown(null);
                          }
                        }}
                      />
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

      {/* ── JOB LISTINGS ── */}
      <main className="max-w-4xl mx-auto px-8 -mt-14">

        {/* Results bar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-bold text-[#4a5a55]">
            {filteredJobs.length} position{filteredJobs.length !== 1 ? 's' : ''} found
            {activeFilterCount > 0 && (
              <span className="text-[#40b594] ml-1">
                · {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
            )}
          </p>
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs font-bold text-[#4a5a55] bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 appearance-none cursor-pointer"
            >
              <option>Most Relevant</option>
              <option>Newest First</option>
              <option>Highest Salary</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7f79] pointer-events-none" />
          </div>
        </div>

        {/* Cards */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-12 h-12 bg-[#f0f9f6] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#d1e8e3]">
              <Search size={20} className="text-[#40b594]" />
            </div>
            <h3 className="text-base font-extrabold text-[#071a15] mb-1">No jobs found</h3>
            <p className="text-sm text-[#6b7f79] font-medium">Try adjusting your search or clearing some filters.</p>
            <button
              onClick={clearFilters}
              className="mt-5 px-6 py-2.5 bg-[#051612] text-white rounded-xl text-sm font-bold hover:bg-[#0d2a23] transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-14">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#c8e6dd] transition-all duration-200"
              >
                <div className="p-7">
                  <div className="flex items-start gap-5">

                    {/* Logo */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: job.logoColor }}
                    >
                      {job.logo}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div>
                          <h2 className="text-lg font-extrabold text-[#071a15] leading-snug">{job.title}</h2>
                          <p className="text-sm font-semibold text-[#4a7063] mt-0.5">{job.company}</p>
                        </div>
                        <button
                          onClick={() => toggleSave(job.id)}
                          className={`p-2 rounded-xl border transition-all flex-shrink-0 ${
                            savedJobs.includes(job.id)
                              ? 'bg-[#f0f9f6] border-[#c8e6dd] text-[#40b594]'
                              : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                          }`}
                        >
                          {savedJobs.includes(job.id)
                            ? <BookmarkCheck size={17} />
                            : <Bookmark size={17} />
                          }
                        </button>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center flex-wrap gap-4 mb-3 mt-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                          <MapPin size={12} /> {job.location}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                          <Clock size={12} /> Posted {job.posted}
                        </span>
                        <span className="text-xs font-semibold text-[#6b7f79]">
                          Deadline: {job.deadline}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 leading-relaxed mb-5 font-medium">{job.description}</p>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1 text-base font-extrabold text-[#071a15]">
                            <DollarSign size={14} className="text-[#40b594]" />
                            {job.salary}
                          </span>
                          <div className="flex gap-1.5 flex-wrap">
                            {[job.type, job.arrangement, job.experience].map(tag => (
                              <span
                                key={tag}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${tagColors[tag] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <Link href="/">
                            <button className="px-5 py-2.5 rounded-xl border border-[#d1e8e3] text-[#071a15] font-bold text-xs hover:bg-[#f0f9f6] transition-all">
                              View Details
                            </button>
                          </Link>
                          <button className="px-5 py-2.5 rounded-xl bg-[#051612] text-white font-bold text-xs hover:bg-[#0d2a23] transition-all">
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {filteredJobs.length > 0 && (
          <div className="text-center mt-10">
            <button className="px-8 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#4a5a55] bg-white hover:border-[#40b594] hover:text-[#40b594] transition-all">
              Load more jobs
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobSeekerHome;