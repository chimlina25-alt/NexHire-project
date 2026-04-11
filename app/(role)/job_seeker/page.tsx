import React from 'react';
import { Camera, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const JobSeekerProfile = () => {
  return (
    /* OUTER BACKGROUND: Deep teal header section matching the reference */
    <div className="min-h-screen w-full bg-[#f8fafc] font-sans">
      <div className="w-full bg-[#0d2a23] h-64 absolute top-0 left-0 z-0" />

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        {/* TOP NAVIGATION: Logo and Back Button */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
            <span className="text-white text-xl font-bold tracking-tight">NexHire</span>
          </div>
          <Link 
            href="/r_choosing"
            className="flex items-center gap-2 px-6 py-2 bg-white text-[#0d2a23] rounded-full hover:bg-gray-100 transition-all text-sm font-bold shadow-md"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>

        {/* MAIN PROFILE CARD */}
        <div className="bg-white rounded-[30px] shadow-2xl p-8 md:p-16 flex flex-col lg:flex-row gap-16">
          
          {/* LEFT SIDE: Profile Photo & Description */}
          <div className="lg:w-1/3 flex flex-col items-center">
            <h2 className="text-[#1a1a1a] text-2xl font-bold mb-10 text-center">Job Seeker's Profile</h2>
            
            <div className="relative mb-6">
              <div className="w-48 h-48 bg-[#4a907d] rounded-full flex items-center justify-center overflow-hidden">
                {/* Default User Silhouette */}
                <svg className="w-32 h-32 text-white/80 mt-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              {/* Camera Upload Badge */}
              <button className="absolute bottom-2 right-2 w-12 h-12 bg-[#00a37b] border-4 border-white rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform">
                <Camera size={20} />
              </button>
            </div>
            
            <p className="text-gray-400 text-xs mb-8">Upload a clear photo of yourself (JPG/PNG)</p>
            
            <div className="w-full space-y-2">
              <label className="text-gray-600 text-sm font-medium ml-1">Description (optional)</label>
              <textarea 
                className="w-full h-32 p-4 rounded-2xl border border-gray-200 bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#00a37b] transition-all resize-none"
              />
            </div>
          </div>

          {/* RIGHT SIDE: User Information & Education */}
          <div className="lg:w-2/3 space-y-10">
            {/* User Information Section */}
            <section>
              <h3 className="text-[#1a1a1a] text-xl font-bold mb-6">User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-bold">First name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-bold">Last name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-gray-700 text-sm font-bold">Contact <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-gray-700 text-sm font-bold">Address <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm" />
                </div>
              </div>
            </section>

            {/* Education Section */}
            <section>
              <h3 className="text-[#1a1a1a] text-xl font-bold mb-6">Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-bold">Education level <span className="text-red-500">*</span></label>
                  <select className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm focus:outline-none">
                    <option>Select option</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-bold">School /University <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-bold">Year <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm" />
                </div>
                
                {/* Submit Button */}
                <div className="flex items-end justify-end mt-4">
                  <button className="w-48 bg-[#2d4f45] text-white font-bold py-3.5 rounded-2xl hover:bg-[#1e3a32] shadow-xl shadow-[#2d4f45]/20 transition-all">
                    Next
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerProfile;