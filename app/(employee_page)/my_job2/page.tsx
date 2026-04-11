"use client";

import React from 'react';
import { Settings, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const MyApplicationsApplied = () => {
const pathname = usePathname();

  const tabs = [
  { name: 'Saved', path: '/my_job', count: 1 },
  { name: 'Applied', path: '/my_job2', count: 1 },
  { name: 'Interviews', path: '/my_job3', count: 2 },
  { name: 'Archived', path: '/my_job4', count: 1 },
];
  const appliedJobs = [
    {
      id: 1,
      title: 'Full Stack Developer',
      company: 'Company name',
      description: 'Work with modern tech stack across frontend and backend.',
      salary: '$190k - $230k',
      tags: ['Part time', 'Remote', 'Senior'],
      status: 'Pending'
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
          <Link href="/home_page">
            <button className="hover:text-gray-300 transition-colors">
              Home
            </button>
          </Link>
          <Link href="/my_job">
             <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">My Jobs</button>
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

      <main className="max-w-5xl mx-auto p-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-2">My Applications</h1>
          <p className="text-gray-400 font-medium">Track and manage your job applications</p>
        </div>

        {/* TABS */}
        <div className="flex gap-10 border-b border-gray-400 mb-8">
  {tabs.map((tab) => {
    const isActive = pathname === tab.path;

    return (
      <Link key={tab.name} href={tab.path}>
        <button
          className={`pb-4 px-1 flex flex-col items-start relative transition-all ${
            isActive ? 'text-[#153a30]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="text-xs font-bold mb-1">{tab.count}</span>
          <span className="text-lg font-bold">{tab.name}</span>

          {isActive && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#153a30] rounded-full"></div>
          )}
        </button>
      </Link>
    );
  })}
</div>

        {/* STATS SUMMARY */}
        <div className="flex gap-8 mb-8 text-sm font-bold text-gray-600">
          <span>Total: 1</span>
          <span>Accepted: 0</span>
          <span>Rejected: 0</span>
        </div>

        {/* APPLIED JOB LISTINGS */}
        <div className="space-y-4">
          {appliedJobs.map((job) => (
            <div key={job.id} className="py-6 border-b border-gray-400">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1a] mb-1">{job.title}</h2>
                  <p className="text-gray-400 text-sm font-bold mb-4">{job.company}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-[#e4f6f1] text-[#153a30] px-4 py-1.5 rounded-full font-bold text-xs border border-[#40b594]/20">
                    {job.status}
                  </span>
                  <button className="text-gray-400 hover:text-black transition-colors">
                    <MoreVertical size={22} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-6 max-w-2xl">{job.description}</p>
              
              <div className="flex items-center gap-6">
                <span className="text-lg font-extrabold text-[#1a1a1a]">{job.salary}</span>
                <div className="flex gap-2">
                  {job.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-[#153a30] text-white text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider"
                    >
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

export default MyApplicationsApplied;