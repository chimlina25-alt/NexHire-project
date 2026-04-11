import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const RoleSelectionPage = () => {
  return (
    /* OUTER BACKGROUND: Dark green container that matches the site's theme */
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-12 bg-[#0d2a23] relative font-sans">
      
      {/* BACK BUTTON: Positioned at the top left of the screen */}
      <div className="absolute top-8 left-8 z-20">
        <Link 
          href="/log_in"
          className="flex items-center gap-2 px-6 py-2 bg-white text-[#0d2a23] rounded-full hover:bg-gray-100 transition-all text-sm font-bold shadow-md"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      {/* THE MAIN SELECTION CARD: Split into two sides */}
      <div className="bg-white rounded-[40px] shadow-2xl flex flex-col md:flex-row max-w-5xl w-full h-[600px] overflow-hidden relative">
        
        {/* LEFT SIDE: Hiring (Employer) */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-12 bg-white group cursor-pointer transition-all">
          <h2 className="text-[#0d2a23] text-2xl font-bold mb-12">I'm here for Hiring</h2>
          
          {/* Employer Illustration */}
          <div className="mb-12 transition-transform group-hover:scale-110 duration-300">
             <img src="/emr.png" alt="Hiring" className="w-100 h-100 items-center object-contain grayscale-[0.2]" />
          </div>

          <Link 
            href="/employer"
            className="px-10 py-3 bg-[#1e4d40] text-white rounded-full font-bold hover:bg-[#153a30] transition-all tracking-wide text-sm"
          >
            JOIN AS EMPLOYER
          </Link>
        </div>

        {/* RIGHT SIDE: Seeking Job (Job Seeker) */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-12 bg-[#051612] group cursor-pointer transition-all">
          <h2 className="text-white text-2xl font-bold mb-12">I'm here Seeking Job</h2>
          
          {/* Job Seeker Illustration */}
          <div className="mb-12 transition-transform group-hover:scale-110 duration-300">
             <img src="/er.png" alt="Job Seeker" className="w-100 h-100 object-contain invert" />
          </div>

          <Link 
            href="/job_seeker"
            className="px-10 py-3 bg-white text-[#051612] rounded-full font-bold hover:bg-gray-100 transition-all tracking-wide text-sm"
          >
            JOIN AS JOB SEEKER
          </Link>
        </div>

        {/* CENTER FLOATING LOGO: Positioned exactly in the middle overlap */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center">
            <div className="w-32 h-32 bg-white rounded-[30px] shadow-xl flex items-center justify-center border-4 border-[#0d2a23]/5">
                <div className="flex flex-col items-center">
                    <img src="/logo.png" alt="NexHire" className="w-10 h-10 mb-1" />
                    <span className="text-[#0d2a23] font-bold text-lg">NexHire</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default RoleSelectionPage;