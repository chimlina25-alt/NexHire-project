"use client";
import React, { useState } from 'react';
import { 
  Settings, Globe, MapPin, Users, 
  Mail, Phone, ExternalLink, Briefcase,
  CheckCircle2, Building
} from 'lucide-react';
import Link from 'next/link';

const EmployerProfile = () => {
  const [activeTab, setActiveTab] = useState<'about' | 'jobs'>('about');

  // Mock data for company details
  const company = {
    name: "NexHire Solutions",
    industry: "Technology & Software",
    location: "Phnom Penh, Cambodia",
    employees: "50-100 Employees",
    website: "www.nexhire.com",
    bio: "NexHire is a leading tech firm dedicated to revolutionizing the recruitment landscape in Southeast Asia. We build tools that connect talent with opportunity using cutting-edge AI.",
    stats: [
      { label: "Active Jobs", value: "12" },
      { label: "Hired", value: "148" },
      { label: "Rating", value: "4.8/5" }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      {/* HEADER NAVIGATION - UNCHANGED */}
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/dashboard">
            <button className="hover:text-gray-300 transition-colors">Dashboard</button>
          </Link>
          <Link href="/post_job">
            <button className="hover:text-gray-300 transition-colors">Post Job</button>
          </Link>
          <Link href="/message_er">
            <button className="hover:text-gray-300 transition-colors">Messages</button>
          </Link>
          <Link href="/subscription">
            <button className="hover:text-gray-300 transition-colors">Subscription</button>
          </Link>
          <Link href="/notification">
            <button className="hover:text-gray-300 transition-colors">Notification</button>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <Link href="/profile">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">User name</p>
              <p className="text-sm font-bold">Profile</p>
            </Link>
          </div>
          <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold">U</div>
          <Link href="/setting">
            <Settings className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={24} />
          </Link>
        </div>
      </header>

      {/* COVER IMAGE */}
      <div className="h-64 w-full bg-[#153a30] relative">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-8 relative h-full">
           {/* COMPANY LOGO OVERLAY */}
           <div className="absolute -bottom-16 left-8">
             <div className="w-40 h-40 bg-white rounded-[40px] p-2 shadow-xl border-4 border-white overflow-hidden">
                <div className="w-full h-full bg-gray-50 rounded-[32px] flex items-center justify-center">
                   <Building size={64} className="text-[#153a30]" />
                </div>
             </div>
           </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 pt-20">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT COLUMN: PRIMARY INFO */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-[#1a1a1a]">{company.name}</h1>
                  <CheckCircle2 className="text-[#40b594]" size={24} />
                </div>
                <p className="text-[#40b594] font-bold mt-1">{company.industry}</p>
              </div>
              <Link href="/settings">
                <button className="bg-white border border-gray-200 text-[#153a30] px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm">
                  Edit Profile
                </button>
              </Link>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex gap-8 border-b border-gray-200 mb-8">
              <button 
                onClick={() => setActiveTab('about')}
                className={`pb-4 text-lg font-bold transition-all ${activeTab === 'about' ? 'text-[#1a1a1a] border-b-4 border-[#153a30]' : 'text-gray-400'}`}
              >
                About Company
              </button>
              <button 
                onClick={() => setActiveTab('jobs')}
                className={`pb-4 text-lg font-bold transition-all ${activeTab === 'jobs' ? 'text-[#1a1a1a] border-b-4 border-[#153a30]' : 'text-gray-400'}`}
              >
                Open Positions
              </button>
            </div>

            {activeTab === 'about' ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {company.bio}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {company.stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[28px] border border-gray-50 text-center shadow-sm">
                      <p className="text-3xl font-black text-[#153a30]">{stat.value}</p>
                      <p className="text-gray-400 text-xs font-bold uppercase mt-1 tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                {/* MOCK JOBS */}
                {[1, 2, 3].map((job) => (
                  <div key={job} className="bg-white p-6 rounded-[28px] border border-gray-100 flex justify-between items-center group hover:border-[#40b594] transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f1fcf9] rounded-2xl flex items-center justify-center text-[#153a30]">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a1a1a]">Senior Software Engineer</h4>
                        <p className="text-xs text-gray-400 font-medium">Full-time • $2000 - $3500</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-[#40b594]" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: SIDEBAR DETAILS */}
          <div className="lg:w-1/3 space-y-6">
            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Contact & Info</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Globe size={18} /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Website</p>
                    <a href="#" className="text-sm font-bold text-[#153a30] hover:underline flex items-center gap-1">
                      {company.website} <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><MapPin size={18} /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Location</p>
                    <p className="text-sm font-bold text-[#153a30]">{company.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Users size={18} /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Company Size</p>
                    <p className="text-sm font-bold text-[#153a30]">{company.employees}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 flex gap-4">
                <button className="flex-1 bg-[#f1fcf9] text-[#153a30] p-3 rounded-xl flex items-center justify-center hover:bg-[#dcfce7] transition-all"><Mail size={20} /></button>
                <button className="flex-1 bg-[#f1fcf9] text-[#153a30] p-3 rounded-xl flex items-center justify-center hover:bg-[#dcfce7] transition-all"><Phone size={20} /></button>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
};

// Simple icon for the mock list
const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default EmployerProfile;