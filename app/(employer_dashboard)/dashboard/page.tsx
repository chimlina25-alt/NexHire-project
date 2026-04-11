"use client";

import React, { useRef } from 'react';
import { LayoutDashboard, Users, Settings, Plus, Eye, FileText } from 'lucide-react';
import Link from 'next/link';

const EmployerDashboard = () => {

  // ✅ Scroll target
const applicantsRef = useRef<HTMLDivElement | null>(null);

  // ✅ Scroll function
  const handleScrollToApplicants = () => {
    applicantsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
            Dashboard
          </button>
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
          <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold text-white">U</div>
          <Link href="/setting">
            <Settings className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={24} />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 md:p-12">
        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-10">Welcome Company1 !</h1>

        {/* WHITE MAIN CONTAINER */}
        <div className="bg-white rounded-[35px] shadow-sm border border-gray-100 p-8 md:p-12">
          
          {/* SUMMARY STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-[#eef7f6] p-10 rounded-[20px] flex flex-col items-center">
              <div className="bg-[#a6d5cb] p-4 rounded-xl mb-4">
                <FileText className="text-white" size={40} />
              </div>
              <p className="text-lg text-gray-700 font-medium">
                Total Jobs Posted : <span className="font-bold text-2xl text-black ml-1">5</span>
              </p>
            </div>

            <div className="bg-[#e7efec] p-10 rounded-[20px] flex flex-col items-center">
              <div className="bg-black p-4 rounded-xl mb-4">
                <Users className="text-white" size={40} />
              </div>
              <p className="text-lg text-gray-700 font-medium">
                Total Applicants: <span className="font-bold text-2xl text-black ml-1">32</span>
              </p>
            </div>

            <div className="bg-[#dceae7] p-10 rounded-[20px] flex flex-col items-center">
              <div className="bg-[#00a37b] p-4 rounded-xl mb-4">
                <LayoutDashboard className="text-white" size={40} />
              </div>
              <p className="text-lg text-gray-700 font-medium">
                Active Jobs: <span className="font-bold text-2xl text-black ml-1">3</span>
              </p>
            </div>
          </div>

          {/* TOP SECTION */}
          <div className="flex flex-col lg:flex-row gap-12 mb-16">

            {/* RECENT JOBS */}
            <div className="lg:w-2/3">
              <h2 className="text-2xl font-bold mb-8">Recent Jobs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-100">
                      <th className="pb-4 font-semibold">Job title</th>
                      <th className="pb-4 font-semibold">Category</th>
                      <th className="pb-4 font-semibold">Location</th>
                      <th className="pb-4 font-semibold">Status</th>
                      <th className="pb-4 font-semibold">Applicants</th>
                    </tr>
                  </thead>

                  <tbody className="text-sm">
                    {[
                      { title: 'Frontend Developer', cat: 'IT & Software', loc: 'Phnom Penh', status: 'Active', count: 12 },
                      { title: 'UI/UX Designer', cat: 'Design', loc: 'Remote', status: 'Active', count: 8 },
                      { title: 'Marketing Specialist', cat: 'Marketing', loc: 'Phnom Penh', status: 'Closed', count: 7 },
                      { title: 'Sales Executive', cat: 'Sales', loc: 'Siem Reap', status: 'Active', count: 5 },
                      { title: 'Data Analyst', cat: 'IT & Software', loc: 'Hybrid', status: 'Draft', count: 0 },
                    ].map((job, idx) => (
                      <tr key={idx} className="border-b border-gray-50 last:border-0">
                        <td className="py-5 font-medium text-gray-700">{job.title}</td>
                        <td className="py-5 text-gray-500">{job.cat}</td>
                        <td className="py-5 text-gray-500">{job.loc}</td>
                        <td className="py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            job.status === 'Active' ? 'bg-green-100 text-green-600' : 
                            job.status === 'Closed' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-5 text-center font-bold">{job.count}</td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="lg:w-1/3">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-8">
                <h2 className="text-2xl font-bold mb-8">Quick Actions</h2>

                <div className="flex flex-col gap-5">
                  <Link href="/post_job">
                    <button className="w-full bg-[#153a30] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#0d2a23] transition-all">
                      <Plus size={22} /> Post a New Job
                    </button>
                  </Link>

                  {/* ✅ SCROLL BUTTON */}
                  <button 
                    onClick={handleScrollToApplicants}
                    className="w-full border border-gray-200 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 "
                  >
                    <Eye size={22} /> View Applicants
                  </button>

                  <button className="w-full border border-gray-200 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50">
                    <FileText size={22} /> Draft
                  </button>
                </div>
              </div>
            </div>

          </div>

          <hr className="border-gray-100 mb-12" />

          {/* ✅ TARGET SECTION */}
          <section ref={applicantsRef} className="w-full">
            <h2 className="text-2xl font-bold mb-8">Recent Applicants</h2>

            <div className="overflow-x-auto border border-gray-100 rounded-[30px] p-6">
              <table className="w-full text-left">
                <tbody>
                  {[
                    { name: 'Rithy Kim', title: 'Frontend Developer', date: 'Apr 23, 2024', status: 'New' },
                    { name: 'Nika Yem', title: 'Sales', date: 'Jan 02, 2024', status: 'New' },
                    { name: 'Sokha Chan', title: 'UI/UX Designer', date: 'May 10, 2024', status: 'In Review' },
                  ].map((applicant, idx) => (
                    <tr key={idx}>
                      <td className="py-6 px-4">{applicant.name}</td>
                      <td className="py-6 px-4">{applicant.title}</td>
                      <td className="py-6 px-4">{applicant.date}</td>
                      <td className="py-6 px-4 text-[#00a37b] font-bold">{applicant.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default EmployerDashboard;