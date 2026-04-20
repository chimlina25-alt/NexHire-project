"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import FormInput from "@/components/ui/FormInput";

const signUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1a1a] px-4 py-4 md:px-8">
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/au.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute top-[-10%] left-[-5%] h-1/2 w-1/2 rounded-full bg-[#00a37b]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-1/2 w-1/2 rounded-full bg-black/40 blur-[120px]" />
      </div>

      {/* CARD */}
      <div className="relative z-10 mx-auto flex h-full max-w-5xl items-center justify-center">
        <div className="flex h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-[34px] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] md:h-[calc(100vh-4rem)] md:flex-row">
          {/* LEFT: Image */}
          <div className="p-4 md:w-1/2 md:p-5">
            <div className="relative h-full w-full overflow-hidden rounded-[28px]">
              <img
                src="/au.jpg"
                alt="Workspace"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute top-7 left-7 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                  <img src="/logo.png" alt="NexHire" className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                  NexHire
                </span>
              </div>

              <div className="absolute bottom-7 left-7">
                <Link
                  href="/log_in"
                  className="inline-block rounded-full border border-white/50 bg-black/30 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white hover:text-black"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="flex items-center overflow-y-auto px-6 py-8 md:w-1/2 md:px-10 md:py-8">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-6 text-center">
                <h1 className="mb-2 text-[28px] font-bold leading-tight text-[#00a37b] md:text-[30px]">
                  Get Started Now!
                </h1>
                <p className="text-sm leading-6 text-gray-500">
                  Get started with your free account today
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormInput
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  registration={register("email")}
                  error={errors.email}
                />
                <FormInput
                  label="Password"
                  placeholder="Enter your password"
                  toggleable
                  registration={register("password")}
                  error={errors.password}
                />
                <FormInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  toggleable
                  registration={register("confirmPassword")}
                  error={errors.confirmPassword}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 w-full rounded-lg bg-[#00a37b] py-3 text-sm font-semibold text-white shadow-md shadow-[#00a37b]/20 transition-all hover:bg-[#008f6c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating account..." : "Sign Up"}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative mb-4 flex items-center justify-center">
                  <div className="w-full border-t border-gray-200" />
                  <span className="absolute bg-white px-4 text-[10px] uppercase tracking-widest text-gray-400">
                    Or continue with
                  </span>
                </div>

                <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-100 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
                  <img src="/gogo.png" alt="Google" className="h-5 w-5" />
                  <span>Sign up with Google</span>
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/log_in"
                  className="font-semibold text-[#00a37b] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
