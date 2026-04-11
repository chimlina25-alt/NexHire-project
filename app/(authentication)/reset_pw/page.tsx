import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; // Using lucide-react for the back arrow

const ForgotPasswordPage = () => {
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
        
        {/* LEFT SIDE: Image Section with Back Button */}
        <div className="md:w-1/2 p-6 md:p-8">
          <div className="h-full w-full rounded-[35px] overflow-hidden relative">
            <img 
              src="/au.jpg" 
              alt="Workspace" 
              className="w-full h-full object-cover"
            />
            {/* Logo Overlay */}
            <div className="absolute top-10 left-10 flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <img src="/logo.png" alt="NexHire" className="w-7 h-7" />
              </div>
              <span className="text-white text-3xl font-bold tracking-tight drop-shadow-md">NexHire</span>
            </div>
           
            
          </div>
        </div>

        {/* RIGHT SIDE: Forgot Password Form Section */}
        <div className="md:w-1/2 flex flex-col justify-center px-10 md:px-20 py-16">
          
          {/* Centered Graphic: Replace with your specific 3D icon path */}
          <div className="flex justify-center mb-8">
            <img 
              src="/sc.png" 
              alt="Forgot Password Illustration" 
              className="w-38 h-auto object-contain"
            />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-[#00a37b] text-4xl font-bold mb-4">Password reset successful</h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
              Your password has been reset successfully. You can now login with your new password.
            </p>
          </div>

          <form className="space-y-8">
           
            

            {/* Reset Button */}
            <Link href="/log_in">
            <button 
              type="submit" 
              className="w-full bg-[#00a37b] text-white font-bold py-4 rounded-2xl hover:bg-[#008f6c] shadow-xl shadow-[#00a37b]/25 transition-all text-lg"
            >
              Return
            </button>
          </Link>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;