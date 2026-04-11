import React from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

const VerifyIdentityPage = () => {
  return (
    /* OUTER BACKGROUND: Framed background image behind the card */
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#1a1a1a] relative font-sans">
      
     {/* BACKGROUND DESIGN: Decorative blurred elements to mimic the original's depth */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-1/2 h-1/2 bg-[#00a37b]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-1/2 h-1/2 bg-black/40 blur-[120px] rounded-full" />
        <img src="/au.jpg" alt="" />
      </div>

      {/* THE MAIN WHITE CARD */}
      <div className="bg-white rounded-[45px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col md:flex-row max-w-6xl w-full overflow-hidden relative z-10">
        
        {/* LEFT SIDE: Branded Image Section with Back Button */}
        <div className="md:w-1/2 p-6 md:p-8">
          <div className="h-full w-full rounded-[35px] overflow-hidden relative">
            <img 
              src="/au.jpg" 
              alt="NexHire Workspace" 
              className="w-full h-full object-cover"
            />
            {/* Logo Overlay */}
            <div className="absolute top-10 left-10 flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <img src="/logo.png" alt="NexHire" className="w-7 h-7" />
              </div>
              <span className="text-white text-3xl font-bold tracking-tight drop-shadow-md">NexHire</span>
            </div>
            
            {/* BACK BUTTON overlay at the bottom */}
            <div className="absolute bottom-10 left-10">
                <Link 
                  href="/sign_up"
                  className="flex items-center gap-2 px-8 py-3 border border-white/40 bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all text-sm font-semibold"
                >
                  <ArrowLeft size={18} />
                  Back
                </Link>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Verification Form Section */}
        <div className="md:w-1/2 flex flex-col justify-center px-10 md:px-20 py-16">
          
          {/* Centered Mail Icon matching nh14.jpg */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#f0fdf9] rounded-2xl">
              <Mail className="text-[#00a37b] w-12 h-12" strokeWidth={1.5} />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-[#00a37b] text-4xl font-bold mb-4">Verify your identity</h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
              We've sent a 6-digit code to <span className="font-semibold">example@gmail.com</span>
            </p>
          </div>

          <form className="space-y-8">
            <div className="space-y-4">
              <label className="text-gray-700 font-bold text-sm block ml-1 text-center md:text-left">
                Verification code
              </label>
              
              {/* Segmented 6-Box Input Container */}
              <div className="flex justify-between gap-2 max-w-md mx-auto">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-100 rounded-xl bg-[#f8fafc] focus:border-[#00a37b] focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#00a37b] text-white font-bold py-4 rounded-2xl hover:bg-[#008f6c] shadow-xl shadow-[#00a37b]/25 transition-all text-lg"
            >
              Verify
            </button>
          </form>

          {/* Resend Logic */}
          <p className="text-center mt-8 text-gray-500 text-sm font-medium">
            Don't receive the code?{' '}
            <button className="text-[#00a37b] font-bold hover:underline underline-offset-4">
              Resend
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default VerifyIdentityPage;