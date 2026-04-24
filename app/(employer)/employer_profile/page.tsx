"use client";

import React, { useState } from 'react';
import {
  Globe, MapPin, Users,
  Mail, Phone, ExternalLink, Briefcase,
  CheckCircle2, Building, Pencil, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const EmployerProfile = () => {
  const [activeTab, setActiveTab] = useState<'about' | 'jobs'>('about');

  const company = {
    name: 'NexHire Solutions',
    industry: 'Technology & Software',
    location: 'Phnom Penh, Cambodia',
    employees: '50–100 Employees',
    website: 'www.nexhire.com',
    bio: 'NexHire is a leading tech firm dedicated to revolutionizing the recruitment landscape in Southeast Asia. We build tools that connect talent with opportunity using cutting-edge AI and human-centered design.',
    stats: [
      { label: 'Active Jobs', value: '12',    icon: Briefcase  },
      { label: 'Hired',       value: '148',   icon: Users      },
      { label: 'Rating',      value: '4.8/5', icon: TrendingUp },
    ],
  };

  const openJobs = [
    { title: 'Senior Software Engineer', type: 'Full-time', salary: '$2,000 – $3,500' },
    { title: 'Product Designer',         type: 'Full-time', salary: '$1,500 – $2,500' },
    { title: 'Data Analyst',             type: 'Contract',  salary: '$1,200 – $2,000' },
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
          <Link href="/dashboard">
            <button className="text-gray-300 hover:text-white transition-colors">Dashboard</button>
          </Link>
          <Link href="/post_job">
            <button className="text-gray-300 hover:text-white transition-colors">Post Job</button>
          </Link>
          <Link href="/employer_message">
            <button className="text-gray-300 hover:text-white transition-colors">Messages</button>
          </Link>
          <Link href="/employer_notification">
            <button className="text-gray-300 hover:text-white transition-colors">Notification</button>
          </Link>
          <Link href="/setting">
            <button className="text-gray-300 hover:text-white transition-colors">Settings</button>
          </Link>
        </nav>

        <Link href="/employer_profile">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Company</p>
              <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors">Profile</p>
            </div>
            <div className="w-10 h-10 bg-[#40b594] rounded-full flex items-center justify-center font-extrabold text-[#051612] text-sm">C</div>
          </div>
        </Link>
      </header>

      {/* ── COVER BANNER ── */}
      <div className="relative h-56 w-full bg-[#051612] overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(#40b594 1px, transparent 1px), linear-gradient(90deg, #40b594 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#051612]/60 to-transparent" />
      </div>

      {/* ── LOGO + NAME ROW — sits cleanly below banner ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-[#f0f4f3] rounded-2xl border-2 border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0">
              <Building size={38} className="text-[#051612]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-0.5">Verified Company</p>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold text-[#071a15]">{company.name}</h1>
                <CheckCircle2 className="text-[#40b594] flex-shrink-0" size={20} />
              </div>
              <p className="text-[#4a5a55] font-semibold text-sm mt-0.5">{company.industry}</p>
            </div>
          </div>
          <Link href="/settings">
            <button className="flex items-center gap-2 bg-white border border-gray-200 text-[#071a15] px-5 py-2.5 rounded-xl font-bold text-sm hover:border-[#40b594] hover:text-[#40b594] transition-all shadow-sm">
              <Pencil size={15} /> Edit Profile
            </button>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:w-2/3">

            {/* ── STAT CARDS — muted professional palette ── */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {company.stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f0f9f6] border border-[#d1e8e3] flex items-center justify-center">
                    <Icon size={17} className="text-[#40b594]" />
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-[#071a15] leading-none">{value}</p>
                    <p className="text-xs font-bold uppercase tracking-wider mt-1 text-[#6b7f79]">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── TABS ── */}
            <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 mb-8 shadow-sm w-fit">
              {(['about', 'jobs'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
                    activeTab === tab
                      ? 'bg-[#051612] text-white shadow-sm'
                      : 'text-[#4a5a55] hover:text-[#071a15]'
                  }`}
                >
                  {tab === 'about' ? 'About Company' : 'Open Positions'}
                </button>
              ))}
            </div>

            {/* ── ABOUT TAB ── */}
            {activeTab === 'about' && (
              <div className="space-y-5">
                <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-base font-extrabold text-[#071a15] mb-3">About Us</h2>
                  <p className="text-[#4a5a55] leading-relaxed font-medium text-sm">
                    {company.bio}
                  </p>
                </section>

                <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-base font-extrabold text-[#071a15] mb-4">Culture & Perks</h2>
                  <div className="flex flex-wrap gap-2">
                    {['Remote Friendly', 'Health Insurance', 'Learning Budget', 'Flexible Hours', 'Stock Options', 'Annual Bonus'].map((tag) => (
                      <span key={tag} className="bg-[#f0f9f6] text-[#071a15] text-xs font-bold px-3.5 py-2 rounded-xl border border-[#d1e8e3]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ── JOBS TAB ── */}
            {activeTab === 'jobs' && (
              <div className="space-y-3">
                {openJobs.map((job, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-[#40b594] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-[#f0f9f6] rounded-xl flex items-center justify-center border border-[#d1e8e3]">
                        <Briefcase size={20} className="text-[#071a15]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[#071a15] text-sm">{job.title}</h4>
                        <p className="text-xs text-[#4a5a55] font-semibold mt-0.5">
                          {job.type}&nbsp;·&nbsp;
                          <span className="text-[#40b594] font-bold">{job.salary}</span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-[#40b594] transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="lg:w-1/3 space-y-5">

            {/* Contact card */}
            <section className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-base font-extrabold text-[#071a15] mb-6">Contact & Info</h3>
              <div className="space-y-5">
                {[
                  { icon: Globe,  label: 'Website',      value: company.website,   link: true  },
                  { icon: MapPin, label: 'Location',     value: company.location,  link: false },
                  { icon: Users,  label: 'Company Size', value: company.employees, link: false },
                ].map(({ icon: Icon, label, value, link }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#f0f4f3] rounded-xl flex items-center justify-center text-[#40b594] flex-shrink-0">
                      <Icon size={17} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6b7f79] font-bold uppercase tracking-wider">{label}</p>
                      {link ? (
                        <a href="#" className="text-sm font-bold text-[#071a15] hover:text-[#40b594] flex items-center gap-1 transition-colors">
                          {value} <ExternalLink size={11} />
                        </a>
                      ) : (
                        <p className="text-sm font-bold text-[#071a15]">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                <button className="flex-1 bg-[#051612] text-[#40b594] py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0d2a23] transition-all font-bold text-sm">
                  <Mail size={17} /> Email
                </button>
                <button className="flex-1 bg-[#f0f4f3] text-[#071a15] py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#d1e8e3] transition-all font-bold text-sm border border-[#d1e8e3]">
                  <Phone size={17} /> Call
                </button>
              </div>
            </section>

            {/* Plan card */}
            <section className="bg-[#051612] p-7 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#40b594] mb-1">Current Plan</p>
              <p className="text-2xl font-extrabold text-white mb-1">Standard</p>
              <p className="text-sm text-gray-400 font-medium mb-5">3 active job slots per month</p>
              <div className="w-full bg-[#0d2a23] rounded-full h-2 mb-2">
                <div className="bg-[#40b594] h-2 rounded-full" style={{ width: '60%' }} />
              </div>
              <p className="text-xs text-gray-500 font-semibold mb-5">2 of 3 slots used</p>
              <Link href="/subscription">
                <button className="w-full bg-[#40b594] text-[#051612] py-3 rounded-xl font-extrabold text-sm hover:bg-[#33997a] transition-all">
                  Upgrade Plan →
                </button>
              </Link>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployerProfile;