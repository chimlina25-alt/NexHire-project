"use client";

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Configure Google Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About Us", href: "/about" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <html 
      lang="en" 
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
        
        {/* ── Global Header ── */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              
              {/* Logo Area (Straight Line Configuration) */}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10">
                  <img src="/logo.png" alt="NexHire Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-2xl text-[#1f4e3d]">NexHire</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-10">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`font-medium transition-colors ${
                        isActive ? "text-[#0d9488]" : "text-gray-600 hover:text-[#1f4e3d]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Action Buttons */}
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login">
                  <button className="px-5 py-2 text-gray-700 font-semibold">Sign In</button>
                </Link>
                <Link href="/signup">
                  <button className="px-6 py-2.5 bg-[#0d9488] text-white rounded-full font-semibold shadow-md hover:bg-[#0b8377] transition-colors">
                    Get Started
                  </button>
                </Link>
              </div>

              {/* Mobile Burger Icon */}
              <button 
                className="md:hidden p-2 text-gray-600" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 px-4 py-4 space-y-3 bg-white">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-700 font-medium py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2 text-gray-700 font-semibold border border-gray-200 rounded-lg">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2 bg-[#0d9488] text-white rounded-lg font-semibold">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* ── Main Page Content ── */}
        <main className="flex-grow">{children}</main>

        {/* ── Global Footer ── */}
        <footer className="bg-[#1f4e3d] text-white py-20 px-4 mt-auto">
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
              <Link href="/signup">
                <button className="px-6 py-2 border border-white/20 rounded-full text-sm hover:bg-white/10 transition-colors">
                  Join us
                </button>
              </Link>
            </div>

            <div>
              <h4 className="font-bold mb-8">Platform</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
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

      </body>
    </html>
  );
}