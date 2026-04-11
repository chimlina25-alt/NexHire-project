"use client";
import React from 'react';
import { Calendar, Clock, Video, MapPin, ExternalLink, MoreVertical } from 'lucide-react';
import Link from 'next/link';

const MyInterviews = () => {
  // Navigation tabs for the "My Jobs" section
  const tabs = [
    { name: 'Saved', path: '/my_job', count: 1, active: false },
    { name: 'Applied', path: '/my_job2', count: 1, active: false },
    { name: 'Interviews', path: '/my_job3', count: 2, active: true }, // Explicitly Active
    { name: 'Archived', path: '/my_job4', count: 1, active: false },
  ];

  const interviewJobs = [
    {
      id: 1,
      title: 'Full Stack Developer',
      company: 'NexHire Solutions',
      date: 'Mar 30, 2026',
      time: '4:30 pm',
      location: 'Google Meet',
      isRemote: true,
      salary: '$190k - $230k',
      tags: ['Part time', 'Remote', 'Senior'],
    },
    {
      id: 2,
      title: 'Computer Science',
      company: 'Global Tech',
      date: 'April 02, 2026',
      time: '10:00 am',
      location: '128 Kampuchea Krom, TK',
      isRemote: false,
      salary: '$150k - $200k',
      tags: ['Full time', 'On-site', 'Mid-level'],
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
          <Link href="/home_page"><button className="hover:text-gray-300">Home</button></Link>
          <Link href="/my_job"><button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">My Jobs</button></Link> 
          <Link href="/message_j"><button className="hover:text-gray-300">Messages</button></Link>
          <Link href="/notification_j"><button className="hover:text-gray-300">Notification</button></Link>
          <Link href="/setting_j"><button className="hover:text-gray-300">Settings</button></Link>
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

      <main className="max-w-5xl mx-auto p-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-2">My Applications</h1>
          <p className="text-gray-400 font-medium">Manage your upcoming interviews and meetings</p>
        </div>

        {/* TABS - Focused on Interviews */}
        <div className="flex gap-10 border-b border-gray-100 mb-10">
          {tabs.map((tab) => (
            <Link key={tab.name} href={tab.path}>
              <button 
                className={`pb-4 px-1 flex flex-col items-start relative transition-all ${
                  tab.active ? 'text-[#153a30]' : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                <span className="text-xs font-bold mb-1">{tab.count}</span>
                <span className="text-lg font-bold">{tab.name}</span>
                {tab.active && (
                  <div className="absolute bottom-0 left-0 w-full h-[3.5px] bg-[#153a30] rounded-full"></div>
                )}
              </button>
            </Link>
          ))}
        </div>

        {/* INTERVIEW LISTINGS */}
        <div className="space-y-12">
          {interviewJobs.map((job) => (
            <div key={job.id} className="pb-10 border-b border-gray-100 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-[#1a1a1a] mb-1">{job.title}</h2>
                  <p className="text-gray-400 text-sm font-bold mb-6 uppercase tracking-tight">{job.company}</p>
                  
                  {/* INTERVIEW TIME & LOCATION CARD */}
                  <div className="flex flex-wrap items-center gap-6 text-gray-600 text-xs font-bold">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-50">
                      <Calendar size={16} className="text-[#40b594]" />
                      {job.date}
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-50">
                      <Clock size={16} className="text-[#40b594]" />
                      {job.time}
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-50">
                      {job.isRemote ? (
                        <Video size={16} className="text-[#40b594]" />
                      ) : (
                        <MapPin size={16} className="text-[#40b594]" />
                      )}
                      {job.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="bg-[#153a30] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#0d2a23] transition-all flex items-center gap-2 shadow-lg shadow-[#153a30]/20">
                    {job.isRemote ? 'Join Call' : 'View Map'}
                    <ExternalLink size={16} />
                  </button>
                  <button className="text-gray-300 hover:text-black transition-colors">
                    <MoreVertical size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-8">
                <span className="text-2xl font-black text-[#153a30]">{job.salary}</span>
                <div className="flex gap-2">
                  {job.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-[#f1fcf9] text-[#153a30] text-[10px] font-black px-4 py-2 rounded-lg border border-[#e4f6f1]"
                    >
                      {tag.toUpperCase()}
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

export default MyInterviews;