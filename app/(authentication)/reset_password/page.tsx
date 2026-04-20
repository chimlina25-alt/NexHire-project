import React from "react";
import Link from "next/link";

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

              <div className="absolute top-7 left-7 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
                  <img src="/logo.png" alt="NexHire" className="h-5 w-5" />
                </div>
                <span className="text-[22px] font-bold tracking-tight text-white drop-shadow-md">
                  NexHire
                </span>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center overflow-y-auto px-6 py-8 md:w-1/2 md:px-10 md:py-8">
            <div className="mx-auto w-full max-w-sm text-center">
              <div className="mb-5 flex justify-center">
                <img
                  src="/sc.png"
                  alt="Success Illustration"
                  className="h-auto w-[105px] object-contain sm:w-[118px] md:w-[132px]"
                />
              </div>

              <div className="mb-6">
                <h1 className="mb-2 text-[24px] font-semibold leading-tight text-[#00a37b] md:text-[27px]">
                  Password reset successful
                </h1>
                <p className="mx-auto max-w-[300px] text-[13px] leading-6 text-gray-500 md:text-sm">
                  Your password has been reset successfully. You can now log in
                  with your new password.
                </p>
              </div>

              <Link
                href="/log_in"
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#00a37b] py-3 text-sm font-semibold text-white shadow-md shadow-[#00a37b]/20 transition-all hover:bg-[#008f6c]"
              >
                Return to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
