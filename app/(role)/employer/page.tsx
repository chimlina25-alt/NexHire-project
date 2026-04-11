import React from 'react';
import { Camera, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const EmployerProfile = () => {
  return (
    /* OUTER BACKGROUND: Deep teal header matching the site branding */
    <div className="min-h-screen w-full bg-[#f8fafc] font-sans">
      <div className="w-full bg-[#0d2a23] h-64 absolute top-0 left-0 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        {/* TOP NAVIGATION */}
        <div className="flex justify-between items-center mb-10 px-4">
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
        <div className="bg-white rounded-[35px] shadow-2xl p-8 md:p-14 flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* LEFT SIDE: Company Photo & Description */}
          <div className="lg:w-1/3 flex flex-col items-center">
            <h2 className="text-[#1a1a1a] text-2xl font-bold mb-10">Employer's Profile</h2>
            
            <div className="relative mb-6">
              {/* Profile placeholder matching the teal circle in nh17.PNG */}
              <div className="w-52 h-52 bg-[#4a907d] rounded-full flex items-center justify-center overflow-hidden">
                <svg className="w-32 h-32 text-white/80 mt-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              {/* Camera Upload Badge */}
              <button className="absolute bottom-3 right-3 w-12 h-12 bg-[#00a37b] border-4 border-white rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                <Camera size={22} />
              </button>
            </div>
            
            <p className="text-gray-400 text-xs mb-10">Upload a clear photo of yourself (JPG/PNG)</p>
            
            <div className="w-full space-y-2">
              <label className="text-gray-700 text-sm font-bold ml-1">Company Description <span className="text-red-500">*</span></label>
              <textarea 
                className="w-full h-40 p-4 rounded-2xl border border-gray-200 bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#00a37b] transition-all resize-none"
                placeholder=""
              />
            </div>
          </div>

          {/* RIGHT SIDE: User Information Form */}
          <div className="lg:w-2/3">
            <h3 className="text-[#1a1a1a] text-xl font-bold mb-8">User Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Company Name - Full Width */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-gray-700 text-sm font-bold">Company name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm focus:ring-1 focus:ring-[#00a37b] outline-none" />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-bold">Industry</label>
                <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm outline-none" />
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-bold">Company Size <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm outline-none" />
              </div>

              {/* Current Address - Full Width */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-gray-700 text-sm font-bold">Current Address <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm outline-none" />
              </div>

              {/* Founded Year */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-bold">Founded year <span className="text-red-500">*</span></label>
                <select className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm focus:outline-none appearance-none bg-[url('https://cdn0.iconfinder.com/data/icons/ios-7-icons/50/chevron_down-512.png')] bg-[length:12px] bg-[right_1.25rem_center] bg-no-repeat">
                  <option>Select option</option>
                </select>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-bold">Country <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm outline-none" />
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-bold">Contact <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm outline-none" />
              </div>

              {/* Website Link */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-bold">Website Link</label>
                <input type="text" placeholder="Choose File No file chosen" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-[#f8fafc] text-gray-400 text-sm outline-none" />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end mt-12">
              <button className="px-16 py-4 bg-[#2d4f45] text-white font-bold rounded-2xl hover:bg-[#1e3a32] shadow-xl shadow-[#2d4f45]/20 transition-all text-lg">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;