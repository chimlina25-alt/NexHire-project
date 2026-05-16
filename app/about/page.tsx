"use client";

import { useState } from "react";
import { Menu, X, MoveRight, Target, Users, Zap, Heart } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About Us", href: "/about" },
];

const values = [
  {
    icon: <Target size={24} />,
    title: "Precision Matching",
    desc: "We go beyond keywords. Our engine understands context, potential, and culture fit to connect the right people.",
  },
  {
    icon: <Users size={24} />,
    title: "People First",
    desc: "Every feature we build starts with a simple question: does this make the hiring experience better for a real human?",
  },
  {
    icon: <Zap size={24} />,
    title: "Speed & Simplicity",
    desc: "Hiring shouldn't be a second job. We strip away complexity so you can focus on what matters — great people.",
  },
  {
    icon: <Heart size={24} />,
    title: "Inclusive by Design",
    desc: "Opportunity should be accessible to everyone. NexHire is built to level the playing field for all job seekers.",
  },
];

const team = [
  {
    name: "Chim Lina",
    img: "/team1.jpg",
    bio: "Passionate about creating fluid user experiences and bridging the gap between student talent and modern organizations.",
  },
  {
    name: "Srun ChanKhemara",
    img: "/team2.jpg",
    bio: "Dedicated to building scalable, robust architectures that make automated system integrations smooth and dependable.",
  },
  {
    name: "Sokha Marady",
    img: "/team3.jpg",
    bio: "Focused on human-centric product strategy, ensuring every system feature solves real friction for our community.",
  },
];

const stats = [
  { value: "50K+", label: "Job Seekers" },
  { value: "3K+", label: "Companies Hiring" },
  { value: "120K+", label: "Applications Sent" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased font-sans">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-20">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-10 h-10">
          <img src="/logo.png" alt="NexHire Logo" className="w-full h-full object-contain" />
        </div>
        <span className="font-bold text-2xl text-[#1f4e3d]">NexHire</span>
      </Link>

      <nav className="hidden md:flex items-center gap-15">
  <a href="/" className="text-gray-600 hover:text-[#1f4e3d] font-medium">Home</a>
  <a href="/pricing" className="text-gray-600 hover:text-[#1f4e3d] font-medium">Pricing</a>
  <a href="/about" className="text-[#0d9488] font-medium">About Us</a>
</nav>

      <div className="hidden md:flex items-center gap-4">
        <Link href="/login">
          <button className="px-5 py-2 text-gray-700 font-semibold">Sign In</button>
        </Link>
        <Link href="/signup">
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

      {/* ── Beautiful Redesigned Hero ── */}
      <section className="px-4 py-12 md:py-20 bg-gradient-to-b from-[#f0fff9]/40 to-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-block px-4 py-1 bg-[#f0fff9] text-[#0d9488] text-xs font-bold tracking-wider uppercase rounded-full">
              Our Origin
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1f4e3d] leading-[1.15]">
              Built to Bridge <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d9488] to-[#1f4e3d]">
                Ambition & Opportunity
              </span>
            </h1>
            <div className="border-l-4 border-[#0d9488] pl-6 my-6">
              <p className="text-xl sm:text-2xl text-gray-700 font-medium leading-relaxed italic">
                "NexHire was born from a simple belief — that finding the right job, or the right person, shouldn't be this hard."
              </p>
            </div>
          </div>
          <div className="lg:col-span-5 relative h-[350px] sm:h-[400px] w-full rounded-3xl overflow-hidden shadow-xl">
            <img
              src="/picture 1.webp"
              alt="Team collaboration"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f4e3d]/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-[#1f4e3d]">Our Mission</h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              We started NexHire because the hiring process was broken — flooded
              with noise, bias, and friction on both sides of the table. Employers
              were drowning in unqualified applications. Job seekers were sending
              résumés into a void.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed">
              Our mission is simple: use intelligent technology to create
              meaningful connections between people and companies — faster,
              fairer, and with less stress for everyone involved.
            </p>
            <Link href="/signup">
              <button className="group inline-flex items-center gap-2 px-8 py-3 bg-[#1f4e3d] text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md mt-2">
                Join NexHire{" "}
                <MoveRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </Link>
          </div>
          <div className="flex gap-4">
            <img
              src="/picture 2.avif"
              alt="Team collaboration"
              className="w-1/2 rounded-3xl shadow-lg h-72 object-cover"
            />
            <img
              src="/picture 3.jpg"
              alt="Working"
              className="w-1/2 rounded-3xl shadow-lg h-72 object-cover mt-12"
            />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-4 bg-[#042f27]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                {s.value}
              </div>
              <div className="text-gray-400 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1f4e3d] mb-4">
              What We Stand For
            </h2>
            <p className="text-gray-400">
              The principles that guide every decision we make at NexHire.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="p-8 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-[#1f4e3d] text-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {v.icon}
                </div>
                <h4 className="font-bold text-xl mb-3 text-[#1f4e3d]">
                  {v.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Updated Team Section (Clean Styles) ── */}
      <section className="py-24 px-4 bg-[#f0fff9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1f4e3d] mb-4">
              Meet the Team
            </h2>
            <p className="text-gray-400">
              The builders and minds crafted around making hiring more human.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group"
              >
                <div className="h-64 overflow-hidden bg-[#1f4e3d]/5 relative">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {/* Fallback avatar block */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1f4e3d]/10 to-[#0d9488]/10 absolute inset-0">
                    <div className="w-20 h-20 rounded-full bg-[#1f4e3d] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                </div>
                <div className="p-8 text-center md:text-left">
                  <h4 className="font-bold text-2xl text-[#1f4e3d] mb-3">
                    {member.name}
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-8 pb-16">
        <div className="max-w-7xl mx-auto bg-[#042f27] rounded-[32px] overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between min-h-[220px] p-12 md:p-16 gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Ready to be part of the story?
              </h2>
              <p className="text-gray-300 text-lg">
                Join thousands of people already hiring and getting hired on
                NexHire.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
              <Link href="/home_page">
                <button className="px-8 py-3 bg-[#0d9488] text-white rounded-full font-bold hover:bg-[#0b8377] transition-colors shadow-lg whitespace-nowrap">
                  Find Jobs
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="px-8 py-3 bg-white text-[#042f27] rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg whitespace-nowrap">
                  Post a Job
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#1f4e3d] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 border-b border-white/10 pb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-xl">NexHire</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              We make it easy for students, job seekers and companies to find
              the right match through automated working systems.
            </p>
            <Link href="/signup">
              <button className="px-6 py-2 border border-white/20 rounded-full text-sm hover:bg-white/10 transition-colors">
                Join us
              </button>
            </Link>
          </div>
          <div>
            <h4 className="font-bold mb-8">Platform</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Browse Jobs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Post a Job
                </a>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-8">Explore</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Internships
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Companies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Career Tips
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-8">Resources</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs gap-4">
          <p>© 2026 NexHire. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}