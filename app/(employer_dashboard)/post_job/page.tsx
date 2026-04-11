"use client";
import React, { useState } from 'react';
import { Settings, Search, Clock, FileEdit, Trash2, ChevronRight, Briefcase, PlusCircle } from 'lucide-react';
import Link from 'next/link';

const PostJob = () => {
  // State to switch between the Form and the Drafts List
  const [activeTab, setActiveTab] = useState<'post' | 'drafts'>('post');

  const draftData = [
    { id: 1, title: 'Senior UX Designer', category: 'Design', lastSaved: '2 hours ago' },
    { id: 2, title: 'Marketing Manager', category: 'Marketing', lastSaved: 'Yesterday' },
  ];

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
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Post Job</button>
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

      <main className="max-w-7xl mx-auto p-8">
        {/* TAB SWITCHER */}
        {/* SUB-NAVIGATION TOGGLE */}
        <div className="flex items-center gap-6 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('post')}
            className={`pb-4 text-2xl font-extrabold transition-all ${activeTab === 'post' ? 'text-[#1a1a1a] border-b-4 border-[#153a30]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Post Job
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`pb-4 text-2xl font-extrabold transition-all ${activeTab === 'drafts' ? 'text-[#1a1a1a] border-b-4 border-[#153a30]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Drafts ({draftData.length})
          </button>
        </div>
        {activeTab === 'post' ? (
          /* YOUR ORIGINAL POST JOB CODE START */
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-8">
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Job Details</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Job Title <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter job title" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#40b594]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Job Category <span className="text-red-500">*</span></label>
                    <select className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                      <option>Select category</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Location <span className="text-red-500">*</span></label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 cursor-pointer">
                          <input type="checkbox" className="accent-[#40b594]" /> Phnom Penh
                        </label>
                        <select className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 text-sm">
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Work Type</label>
                      <div className="flex gap-4">
                        <select className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>Employment Type</option></select>
                        <select className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>Work Type</option></select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Salary (Minimum)</label>
                      <input type="text" placeholder="$0.00" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Salary (Maximum)</label>
                      <input type="text" placeholder="$0.00" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Experience Level</label>
                      <select className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50"><option>Entry Level</option></select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Application Deadline</label>
                      <input type="date" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
                    </div>
                  </div>
                </div>
              </section>
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Job Description</h2>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <textarea rows={10} className="w-full p-4 focus:outline-none resize-none" placeholder="Write job description here..."></textarea>
                </div>
              </section>
            </div>
            <div className="lg:w-1/3 space-y-8">
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Requirement</h2>
                <textarea rows={8} placeholder="Enter requirements" className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none resize-none"></textarea>
              </section>
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Application Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 ">Application Platform</label>
                    <select className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                      <option value="">Select Platform</option>
                      <option value="internal">Apply on NexHire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">External Link</label>
                    <input type="text" placeholder="https://" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Contact & Email</label>
                    <input type="email" placeholder="example@gmail.com" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50" />
                  </div>
                  <div className="flex gap-8 pt-4">
                    <label className="flex items-center gap-2 text-sm font-medium"><input type="radio" name="status" className="accent-[#153a30] w-4 h-4" /> Public Now</label>
                    <label className="flex items-center gap-2 text-sm font-medium"><input type="radio" name="status" className="accent-[#153a30] w-4 h-4" /> Save as Draft</label>
                  </div>
                  <div className="space-y-4 pt-6">
                    <button className="w-full bg-[#153a30] text-white py-4 rounded-2xl font-bold hover:bg-[#0d2a23]">Post</button>
                    <button className="w-full bg-[#f1fcf9] text-[#153a30] py-4 rounded-2xl font-bold">Cancel</button>
                  </div>
                </div>
              </section>
            </div>
          </div>
          /* YOUR ORIGINAL POST JOB CODE END */
        ) : (
          /* --- DRAFTS STACK VIEW --- */
          <div className="max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-500 uppercase tracking-widest">Unfinished Stack</h2>
              <button onClick={() => setActiveTab('post')} className="flex items-center gap-2 text-[#40b594] font-bold text-sm">
                <PlusCircle size={18} /> Create New Post
              </button>
            </div>

            <div className="space-y-4">
              {draftData.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-white border border-gray-100 rounded-[24px] p-6 flex items-center justify-between group hover:border-[#40b594] transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-[#f1fcf9] rounded-2xl flex items-center justify-center text-[#153a30]">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1a1a1a]">{draft.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{draft.category}</span>
                        <div className="flex items-center gap-1 text-gray-400 text-xs"><Clock size={14} /> {draft.lastSaved}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-3 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                    <button
                      onClick={() => setActiveTab('post')}
                      className="flex items-center gap-2 bg-[#153a30] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#0d2a23] transition-all"
                    >
                      <FileEdit size={18} /> Edit Draft
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