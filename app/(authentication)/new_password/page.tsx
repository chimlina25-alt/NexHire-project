import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const ForgotPasswordPage = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1a1a] px-4 py-4 font-sans md:px-8">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] h-1/2 w-1/2 rounded-full bg-[#00a37b]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-1/2 w-1/2 rounded-full bg-black/40 blur-[120px]" />
        <img
          src="/au.jpg"
          alt=""
          className="h-full w-full object-cover opacity-30"
        />
      </div>

      {/* Main Card */}
      <div className="relative z-10 mx-auto flex h-full max-w-5xl items-center justify-center">
        <div className="flex h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-[34px] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] md:h-[calc(100vh-4rem)] md:flex-row">
          {/* Left Side */}
          <div className="p-4 md:w-1/2 md:p-5">
            <div className="relative h-full w-full overflow-hidden rounded-[28px]">
              <img
                src="/au.jpg"
                alt="Workspace"
                className="h-full w-full object-cover"
              />

              <div className="absolute left-7 top-7 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
                  <img src="/logo.png" alt="NexHire" className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                  NexHire
                </span>
              </div>

              <div className="absolute bottom-7 left-7">
                <Link
                  href="/forget_password"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white hover:text-black"
                >
                  <ArrowLeft size={15} />
                  Back
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center overflow-y-auto px-6 py-8 md:w-1/2 md:px-10 md:py-8">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-4 flex justify-center">
                <img
                  src="/res.png"
                  alt="Reset Password Illustration"
                  className="h-auto w-[150px] object-contain sm:w-[170px] md:w-[190px]"
                />
              </div>

              <div className="mb-6 text-center">
                <h1 className="mb-2 text-[28px] font-bold leading-tight text-[#00a37b] md:text-[30px]">
                  Create a new password
                </h1>
                <p className="mx-auto max-w-[320px] text-sm leading-6 text-gray-500">
                  Enter your new password below. Make sure it&apos;s strong and
                  secure to protect your account.
                </p>
              </div>

              <form className="space-y-4">
                <div className="space-y-1.5">
                  <label className="ml-1 block text-sm font-semibold text-[#00a37b]">
                    New password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your new password"
                    className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 transition-all focus:border-[#00a37b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a37b]/15"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="ml-1 block text-sm font-semibold text-[#00a37b]">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 transition-all focus:border-[#00a37b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a37b]/15"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-lg bg-[#00a37b] py-3 text-sm font-semibold text-white shadow-md shadow-[#00a37b]/20 transition-all hover:bg-[#008f6c]"
                >
                  Reset password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
