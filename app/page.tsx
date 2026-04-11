"use client";

import { useState } from 'react';
import {
  Check, Menu, X, Star,
  UserPlus, Search, Send, Sparkles, MoveRight,
  Square
} from 'lucide-react';
import Link from 'next/link';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10">
                <img src="/logo.png" alt="NexHire Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-2xl text-[#1f4e3d]">NexHire</span>
            </div>

            <nav className="hidden md:flex items-center gap-10">
              <a href="#" className="text-gray-600 hover:text-[#1f4e3d] font-medium">Home</a>
              <a href="#" className="text-gray-600 hover:text-[#1f4e3d] font-medium">Companies</a>
              <a href="#" className="text-gray-600 hover:text-[#1f4e3d] font-medium">Pricing</a>
              <a href="#" className="text-gray-600 hover:text-[#1f4e3d] font-medium">About Us</a>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/log_in">
                <button className="px-5 py-2 text-gray-700 font-semibold">Sign In</button>
              </Link>
              <Link href="/home_page">
              <button className="px-6 py-2.5 bg-[#0d9488] text-white rounded-full font-semibold shadow-md">
                Get Started
              </button>
              </Link>
            </div>

            <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto relative rounded-[40px] overflow-hidden">
          <div className="relative h-[550px] md:h-[600px] w-full">
            <img
              src="/picture 1.webp"
              alt="Team Meeting"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
              <h1 className="text-4xl md:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-5xl leading-tight">
                THE FUTURE OF CAREER<br />CONNECTIONS
              </h1>
              <p className="text-gray-200/90 text-lg md:text-xl max-w-2xl mb-10">
                NexHire is the gold between ambition and opportunity with an intelligent matching engine
                that understands human potential beyond the resume.
              </p>

      {/* if user already have account directly go to their hoome page if nt we will asking them to sign up */}
              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/home_page">
                  <button className="px-10 py-4 bg-[#0d9488] text-white rounded-lg font-bold flex items-center gap-2 transition-transform hover:scale-105">
                    For Job Seekers <MoveRight size={20} />
                  </button>
                </Link>
                <Link href="/dashboard">
                  <button className="px-10 py-4 bg-white text-[#1f4e3d] rounded-lg font-bold transition-all hover:bg-gray-100">
                    For Employer
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Platform Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex gap-4">
            <img src="/picture 2.avif" alt="Resume" className="w-1/2 rounded-3xl shadow-lg h-64 object-cover" />
            <img src="/picture 3.jpg" alt="User Working" className="w-1/2 rounded-3xl shadow-lg h-64 object-cover mt-12" />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-[#1f4e3d]">Why Choose Our Platform?</h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Our platform connects job seekers and employers in one place, making it easy to post jobs and apply. We provide tools to help you succeed in your career journey.
            </p>
          </div>
        </div>
      </section>

      {/* YOUR NEXT OPPORTUNITY BANNER */}
<section className="px-4 py-8">
  <div className="max-w-7xl mx-auto bg-[#042f27] rounded-[32px] overflow-hidden relative">
    
    <div className="flex flex-col md:flex-row items-stretch min-h-[300px] md:h-[350px]">

      {/* Left Content: Centered vertically */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 z-10">
        <h2 className="text-2xl md:text-4xl font-normal text-white mb-2 leading-tight">
          Your next opportunity is here
        </h2>
        <p className="text-gray-300 text-base md:text-lg mb-8">
          Apply to jobs or post listings and connect instantly.
        </p>
        <div>
          <Link href="/home_page">
          <button className="px-10 py-3 bg-white text-[#042f27] rounded-full font-bold text-sm transition-all hover:bg-gray-100 active:scale-95 shadow-lg">
            Start now!
          </button>
         </Link>
        </div>
      </div>

      {/* Right Content: Laptop and Logo Overlay */}
      <div className="w-full md:w-1/2 relative flex items-end justify-end pr-4 md:pr-10">
        
        {/* The Laptop Image (as the base layer) */}
        <img 
          src="/computer.png" 
          alt="NexHire Laptop" 
          className="w-[85%] md:w-[95%] h-auto object-contain object-bottom translate-y-1" 
        />

        {/* 🌟 NEW: Absolute overlay to center the logo on the screen area */}
        <div className="absolute inset-0 z-20 flex items-center justify-center p-8 md:p-12 mb-10 gap-2">
          <img 
            src="/logo.png" 
            alt="NexHire Logo" 
            className="w-16 h-16 object-contain" // Adjust w- and h- to resize the logo
          />
          <span className="font-bold text-2xl text-white">NexHire</span>
        </div>
      </div>

    </div>
  </div>
</section>

      {/* FOR JOB SEEKERS (From nh9.PNG) */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-[#1f4e3d]">For Job Seekers</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <Square className="mt-1 text-[#1f4e3d] fill-[#1f4e3d]" size={16} />
                <p className="text-gray-600 font-medium">Search and apply for jobs, view job details</p>
              </li>
              <li className="flex items-start gap-4">
                <Square className="mt-1 text-[#1f4e3d] fill-[#1f4e3d]" size={16} />
                <p className="text-gray-600 font-medium">Track application status (pending / accepted / rejected)</p>
              </li>
              <li className="flex items-start gap-4 ">
                <Square className="mt-1 text-[#1f4e3d] fill-[#1f4e3d]" size={16} />
                <p className="text-gray-600 font-medium">Chat with employers and manage profile</p>
              </li>
            </ul>
          </div>
          <div className="rounded-[40px] overflow-hidden shadow-xl">
            <img src="/photo4.jpg" alt="Job Seekers" className="w-full h-auto object-cover" />
          </div>
        </div>
      </section>

      {/* FOR EMPLOYERS (From nh9.PNG) */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 rounded-[40px] overflow-hidden shadow-xl">
            <img src="/photo5.jpg" alt="Employers" className="w-full h-auto object-cover" />
          </div>
          <div className="order-1 md:order-2 space-y-8 md:pl-12">
            <h2 className="text-4xl font-bold text-[#1f4e3d] text-right md:text-left">For Employers</h2>
            <ul className="space-y-6 flex flex-col items-end md:items-start">
              <li className="flex items-center gap-4">
                <p className="text-gray-600 font-medium">Post, edit, and manage job listings</p>
                <Check className="text-white bg-[#3db28c] rounded-sm p-0.5" size={18} />
              </li>
              <li className="flex items-center gap-4">
                <p className="text-gray-600 font-medium">Review applicants and accept or reject candidates</p>
                <Check className="text-white bg-[#3db28c] rounded-sm p-0.5" size={18} />
              </li>
              <li className="flex items-center gap-4">
                <p className="text-gray-600 font-medium">Chat with job seekers and manage company profile</p>
                <Check className="text-white bg-[#3db28c] rounded-sm p-0.5" size={18} />
              </li>
              <li className="flex items-center gap-4">
                <p className="text-gray-600 font-medium">Subscription required for continued posting</p>
                <Check className="text-white bg-[#3db28c] rounded-sm p-0.5" size={18} />
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="py-24 bg-[#f0fff9] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1f4e3d] mb-4">Subscription Plans</h2>
            <p className="text-gray-500">Transparent pricing tailored for teams of all sizes.</p>
          </div>

          <div className="space-y-6">
            {/* Basic */}
            <div className="bg-white rounded-3xl p-10 flex justify-between items-center shadow-sm border border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-[#1f4e3d]">BASIC</h3>
                <p className="text-gray-400 text-sm mt-1">Post 1 job per month for free. Best for occasional hiring.</p>
              </div>
              <div className="text-3xl font-bold text-[#1f4e3d]">Free Plan</div>
            </div>

            {/* Standard */}
            <div className="bg-white rounded-3xl p-10 flex justify-between items-center shadow-sm border border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-[#1f4e3d]">STANDARD</h3>
                <p className="text-gray-400 text-sm mt-1">Post up to 5 jobs per month. Great for small businesses.</p>
              </div>
              <div className="text-3xl font-bold text-[#1f4e3d]">$6.99/month</div>
            </div>

            {/* Premium */}
            <div className="bg-[#1f4e3d] rounded-3xl p-10 flex justify-between items-center shadow-xl text-white">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">PREMIUM</h3>
                  <Star className="fill-yellow-400 text-yellow-400 w-5 h-5" />
                </div>
                <p className="text-gray-300 text-sm mt-1">Post up to 10 jobs per month. Ideal for companies hiring frequently.</p>
              </div>
              <div className="text-3xl font-bold">$12.99/month</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-[#1f4e3d] mb-3">How It works</h2>
            <p className="text-gray-400">Start your job search journey in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-32">
            {[
              { icon: <UserPlus />, title: "Create Account", text: "Sign up in seconds and build your professional profile to stand out to employers." },
              { icon: <Search />, title: "Search Jobs", text: "Browse thousands of job listings tailored to your skills and preference." },
              { icon: <Send />, title: "Apply Instantly", text: "Submit your application with one click using your save profile and resume." },
              { icon: <Sparkles />, title: "Get Hired", text: "Connect with employers and land your dream job faster than ever before." }
            ].map((step, i) => (
              <div key={i} className="p-8 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-[#1f4e3d] text-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h4 className="font-bold text-xl mb-4 text-[#1f4e3d]">{step.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="text-center max-w-3xl mx-auto pb-20">
            <div className="w-16 h-1.5 bg-[#1f4e3d] mx-auto mb-16 rounded-full opacity-60"></div>
            <h2 className="text-5xl font-bold text-[#1f4e3d] mb-6">Ready to start your career journey?</h2>
            <p className="text-gray-500 text-lg mb-12">Find internships, apply easily, or post job openings in just a few steps.</p>
             <Link href="/home_page">
            <button className="group inline-flex items-center gap-3 px-12 py-4 font-bold text-white bg-gradient-to-r from-[#1f4e3d] to-[#3db28c] rounded-xl hover:scale-105 transition-all shadow-lg">
              Get Started <MoveRight className="transition-transform group-hover:translate-x-1" />
            </button>
            </Link>
            <p className="mt-6 text-gray-400 text-sm italic">It only takes a minute to get started.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1f4e3d] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 border-b border-white/10 pb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl">NexHire</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              We make it easy for students, job seekers and companies to find the right match through automated working systems.
            </p>
            <button className="px-6 py-2 border border-white/20 rounded-full text-sm hover:bg-white/10 transition-colors">Join us</button>
          </div>

          <div>
            <h4 className="font-bold mb-8">Platform</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Post a Job</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-8">Explore</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Internships</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Companies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Career Tips</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-8">Resources</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs gap-4">
          <p>© 2026 NexHire. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}