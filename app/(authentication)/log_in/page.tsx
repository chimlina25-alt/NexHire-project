import React from 'react';
import Link from 'next/link';

const LoginPage = () => {
  return (
    /* OUTER BACKGROUND: This represents the dark, blurred environment behind the card */
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#1a1a1a] relative">
      
      {/* BACKGROUND DESIGN: Decorative blurred elements to mimic the original's depth */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-1/2 h-1/2 bg-[#00a37b]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-1/2 h-1/2 bg-black/40 blur-[120px] rounded-full" />
        <img src="/au.jpg" alt="" />
      </div>

      {/* THE MAIN WHITE CARD: sits on top of the "big" background */}
      <div className="bg-white rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col md:flex-row max-w-6xl w-full overflow-hidden relative z-10">
        
        {/* LEFT SIDE: Image Section */}
        <div className="md:w-1/2 p-5 md:p-7">
          <div className="h-full w-full rounded-[30px] overflow-hidden relative">
            <img 
              src="/au.jpg" 
              alt="Workspace" 
              className="w-full h-full object-cover"
            />
            {/* Logo Overlay */}
            <div className="absolute top-8 left-8 flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <img src="/logo.png" alt="NexHire" className="w-6 h-6" />
              </div>
              <span className="text-white text-2xl font-bold tracking-tight drop-shadow-md">NexHire</span>
            </div>
            {/* Sign Up Overlay */}
            <div className="absolute bottom-8 left-8">
              <Link href="/sign_up">
                <button className="px-8 py-2 border border-white/50 bg-black/30 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all">
                  Sign up
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form Section */}
        <div className="md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12">
          <div className="text-center mb-10">
            <h1 className="text-[#00a37b] text-4xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Enter your email below to login<br />to your account
            </p>
          </div>

          <form className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[#00a37b] font-bold text-sm ml-1">Email</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-[#ebf2ff] focus:outline-none focus:ring-2 focus:ring-[#00a37b] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#00a37b] font-bold text-sm ml-1">Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-[#ebf2ff] focus:outline-none focus:ring-2 focus:ring-[#00a37b] transition-all"
              />
              <div className="text-right">
                <Link href="/forget_pw">
                  <button type="button" className="text-[#00a37b] text-xs font-bold hover:underline">
                    forgot password?
                  </button>
                </Link>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#00a37b] text-white font-bold py-3.5 rounded-xl hover:bg-[#008f6c] shadow-lg shadow-[#00a37b]/20 transition-all mt-2"
            >
              Login
            </button>
          </form>

          {/* Social and Sign Up */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-white px-4 text-[10px] uppercase text-gray-400 absolute">Or continue with</span>
            </div>

            <button className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-600">
              <img src="/gogo.png" alt="Google" className="w-10 h-10" />
              <span>Login with Google</span>
            </button>
          </div>

          <p className="text-center mt-8 text-gray-500 text-sm">
            Don't have an account? 
            <Link href="/sign_up" className="text-[#00a37b] font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;