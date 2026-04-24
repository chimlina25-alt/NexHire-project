"use client";

import React, { useState } from 'react';
import { Clock, FileEdit, Trash2, Briefcase, PlusCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const PostJob = () => {
  const [activeTab, setActiveTab] = useState<'post' | 'drafts'>('post');

  const draftData = [
    { id: 1, title: 'Senior UX Designer',  category: 'Design',    lastSaved: '2 hours ago' },
    { id: 2, title: 'Marketing Manager',   category: 'Marketing', lastSaved: 'Yesterday'   },
  ];

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium placeholder-[#9ab0aa] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594] transition-all';

  const selectClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594] transition-all appearance-none';

  const labelClass = 'block text-sm font-extrabold text-[#071a15] mb-2';

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
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Post Job</button>
          <Link href="/employer_message">
            <button className="text-gray-300 hover:text-white transition-colors">Messages</button>
          </Link>
          <Link href="/employer_notification">
            <button className="text-gray-300 hover:text-white transition-colors">Notification</button>
          </Link>
          <Link href="/subscription">
            <button className="text-gray-300 hover:text-white transition-colors">Subscription</button>
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

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">

        {/* ── PAGE TITLE ── */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Hiring</p>
          <h1 className="text-4xl font-extrabold text-[#071a15]">Post a Job</h1>
          <p className="text-[#4a5a55] font-medium mt-1">Fill in the details below to publish a new role</p>
        </div>

        {/* ── TAB SWITCHER ── */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 mb-8 shadow-sm w-fit">
          {(['post', 'drafts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
                activeTab === tab
                  ? 'bg-[#051612] text-white shadow-sm'
                  : 'text-[#4a5a55] hover:text-[#071a15]'
              }`}
            >
              {tab === 'post' ? 'Post Job' : `Drafts (${draftData.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'post' && (
          <div className="flex flex-col lg:flex-row gap-6">

            <div className="lg:w-2/3 space-y-6">

              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-8 h-8 bg-[#f0f9f6] rounded-xl flex items-center justify-center border border-[#d1e8e3]">
                    <Briefcase size={16} className="text-[#40b594]" />
                  </div>
                  <h2 className="text-lg font-extrabold text-[#071a15]">Job Details</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Job Title <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g. Senior Frontend Developer" className={inputClass} />
                  </div>

                  <div className="relative">
                    <label className={labelClass}>Job Category <span className="text-red-500">*</span></label>
                    <select className={selectClass}>
                      <option value="">Select a category</option>
                      <option>IT & Software</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                      <option>Finance</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className={labelClass}>Location <span className="text-red-500">*</span></label>
                      <select className={selectClass}>
                        <option>Phnom Penh</option>
                        <option>Siem Reap</option>
                        <option>Remote</option>
                        <option>Other</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                    </div>
                    <div className="relative">
                      <label className={labelClass}>Work Arrangement</label>
                      <select className={selectClass}>
                        <option value="">On-site / Remote / Hybrid</option>
                        <option>On-site</option>
                        <option>Remote</option>
                        <option>Hybrid</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className={labelClass}>Employment Type</label>
                      <select className={selectClass}>
                        <option value="">Select type</option>
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                    </div>
                    <div className="relative">
                      <label className={labelClass}>Experience Level</label>
                      <select className={selectClass}>
                        <option>Entry Level</option>
                        <option>Mid Level</option>
                        <option>Senior</option>
                        <option>Lead / Manager</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Salary Minimum</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79] font-bold text-sm">$</span>
                        <input type="text" placeholder="0.00" className={`${inputClass} pl-8`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Salary Maximum</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f79] font-bold text-sm">$</span>
                        <input type="text" placeholder="0.00" className={`${inputClass} pl-8`} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Application Deadline</label>
                    <input type="date" className={inputClass} />
                  </div>
                </div>
              </section>

              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-extrabold text-[#071a15] mb-2">Job Description</h2>
                <p className="text-xs text-[#6b7f79] font-semibold mb-5">Describe the role, responsibilities, and what success looks like</p>
                <textarea
                  rows={10}
                  placeholder="Write the job description here..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium placeholder-[#9ab0aa] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594] transition-all resize-none"
                />
              </section>
            </div>

            <div className="lg:w-1/3 space-y-6">

              <section className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-extrabold text-[#071a15] mb-2">Requirements</h2>
                <p className="text-xs text-[#6b7f79] font-semibold mb-5">Skills, qualifications, and must-haves</p>
                <textarea
                  rows={8}
                  placeholder="e.g. 3+ years React experience&#10;Strong communication skills&#10;Bachelor's degree preferred"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f8faf9] text-[#071a15] text-sm font-medium placeholder-[#9ab0aa] focus:outline-none focus:ring-2 focus:ring-[#40b594]/30 focus:border-[#40b594] transition-all resize-none"
                />
              </section>

              <section className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-extrabold text-[#071a15] mb-6">Application Settings</h2>

                <div className="space-y-5">
                  <div className="relative">
                    <label className={labelClass}>Application Platform</label>
                    <select className={selectClass}>
                      <option value="">Select platform</option>
                      <option value="internal">Apply on NexHire</option>
                      <option value="external">External Link</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-[42px] text-[#6b7f79] pointer-events-none" />
                  </div>

                  <div>
                    <label className={labelClass}>External Link</label>
                    <input type="text" placeholder="https://yoursite.com/apply" className={inputClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Contact Email</label>
                    <input type="email" placeholder="careers@company.com" className={inputClass} />
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-extrabold text-[#071a15] mb-3">Visibility</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Public Now', 'Save as Draft'].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2.5 bg-[#f8faf9] border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-[#40b594] transition-all"
                        >
                          <input type="radio" name="status" className="accent-[#40b594] w-4 h-4" />
                          <span className="text-sm font-bold text-[#071a15]">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-6" />

                <div className="space-y-3">
                  <button className="w-full bg-[#051612] text-white py-3.5 rounded-xl font-extrabold text-sm hover:bg-[#0d2a23] transition-all shadow-sm">
                    Publish Job
                  </button>
                  <button className="w-full bg-[#f0f4f3] text-[#071a15] py-3.5 rounded-xl font-extrabold text-sm border border-[#d1e8e3] hover:bg-[#d1e8e3] transition-all">
                    Save as Draft
                  </button>
                  <button className="w-full text-[#6b7f79] py-2 rounded-xl font-bold text-sm hover:text-[#071a15] transition-all">
                    Cancel
                  </button>
                </div>
              </section>

            </div>
          </div>
        )}

        {activeTab === 'drafts' && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#6b7f79]">Saved drafts</p>
                <h2 className="text-xl font-extrabold text-[#071a15] mt-0.5">{draftData.length} unfinished posts</h2>
              </div>
              <button
                onClick={() => setActiveTab('post')}
                className="flex items-center gap-2 bg-[#051612] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all shadow-sm"
              >
                <PlusCircle size={17} /> New Post
              </button>
            </div>

            <div className="space-y-4">
              {draftData.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between group hover:border-[#40b594] hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-[#f0f9f6] rounded-xl flex items-center justify-center border border-[#d1e8e3] flex-shrink-0">
                      <Briefcase size={22} className="text-[#40b594]" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#071a15]">{draft.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-bold text-[#40b594] bg-[#f0f9f6] px-2.5 py-1 rounded-lg border border-[#d1e8e3]">
                          {draft.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-[#6b7f79] text-xs font-semibold">
                          <Clock size={13} /> {draft.lastSaved}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl text-[#6b7f79] hover:bg-red-50 hover:text-red-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => setActiveTab('post')}
                      className="flex items-center gap-2 bg-[#051612] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all"
                    >
                      <FileEdit size={16} /> Edit Draft
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default PostJob;