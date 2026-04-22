"use client";
import React from 'react';
import { 
  Settings, 
  Mail, 
  Phone, 
  MapPin, 
  // FIXED: Lowercase 'h'
  Globe, 
  Download, 
  Briefcase, 
  GraduationCap, 
  Award, 
  CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

const EmployeeProfile = () => {
  const user = {
    name: "Marsslu SMC",
    role: "Senior Full Stack Developer",
    location: "Phnom Penh, Cambodia",
    email: "rathana.dev@example.com",
    phone: "+855 12 345 678",
    bio: "Passionate developer with over 5 years of experience building scalable web applications. Expert in React, Node.js, and Cloud Architecture. Committed to writing clean, maintainable code.",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Tailwind CSS", "UI/UX Design"],
    experience: [
      { company: "TechFlow Co.", role: "Lead Developer", period: "2022 - Present" },
      { company: "Digital Wave", role: "Junior Developer", period: "2020 - 2022" }
    ]
  };

 return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      {/* HEADER NAVIGATION */}
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">NexHire</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/home_page">
            <button className="hover:text-gray-300 transition-colors">
              Home
            </button>
          </Link>
          <Link href="/saved">
             <button className="hover:text-gray-300 transition-colors">My Jobs</button>
           </Link> 
           <Link href="/message">
          <button className="hover:text-gray-300 transition-colors">Messages</button>
          </Link>
          <Link href="/notification">
            <button className="hover:text-gray-300 transition-colors">Notification</button>
          </Link>
          <Link href="/my_profile">
            <button className="hover:text-gray-300 transition-colors">Settings</button>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">User name</p>
            <p className="text-sm font-bold">Profile</p>
          </div>
          <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold text-white">U</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: PERSONAL CARD */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm text-center">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-[#f1fcf9] rounded-[32px] flex items-center justify-center border-4 border-white shadow-md mx-auto overflow-hidden">
                  <img src="/avatar-placeholder.png" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#40b594] text-white p-1.5 rounded-full border-4 border-white">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              
              <h1 className="text-2xl font-black text-[#1a1a1a]">{user.name}</h1>
              <p className="text-[#40b594] font-bold text-sm">{user.role}</p>
              
              <div className="mt-8 space-y-4">
                <button className="w-full bg-[#153a30] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                  <Download size={18} /> Download CV
                </button>
              </div>

              <hr className="my-8 border-gray-50" />

              <div className="text-left space-y-5">
                <div className="flex items-center gap-4 text-gray-500">
                  <Mail size={18} className="text-[#40b594]" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  <Phone size={18} className="text-[#40b594]" />
                  <span className="text-sm font-medium">{user.phone}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  <MapPin size={18} className="text-[#40b594]" />
                  <span className="text-sm font-medium">{user.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RESUME CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-[#1a1a1a] mb-4">About Me</h2>
              <p className="text-gray-500 leading-relaxed font-medium">
                {user.bio}
              </p>
            </section>

            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-[#1a1a1a] mb-6 flex items-center gap-2">
                <Award className="text-[#40b594]" size={24} /> Professional Skills
              </h2>
              <div className="flex flex-wrap gap-3">
                {user.skills.map((skill) => (
                  <span key={skill} className="px-5 py-2.5 bg-[#f1fcf9] text-[#153a30] rounded-xl font-bold text-sm border border-green-50 hover:bg-[#40b594] hover:text-white transition-all cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-[#1a1a1a] mb-8 flex items-center gap-2">
                <Briefcase className="text-[#40b594]" size={24} /> Work Experience
              </h2>
              <div className="space-y-10 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                {user.experience.map((exp, index) => (
                  <div key={index} className="relative pl-14">
                    <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-[#40b594] border-4 border-white shadow-sm z-10"></div>
                    <div>
                      <h4 className="text-lg font-black text-[#1a1a1a]">{exp.role}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[#40b594] font-bold text-sm">{exp.company}</p>
                        <span className="text-xs font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{exp.period}</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                        Leading the development of core platforms, optimizing performance by 40%, and managing a team of 5 developers.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-[#1a1a1a] mb-6 flex items-center gap-2">
                <GraduationCap className="text-[#40b594]" size={24} /> Education
              </h2>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                   <GraduationCap size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a]">Bachelor of Computer Science</h4>
                  <p className="text-sm text-gray-400 font-medium">Royal University of Phnom Penh • 2016 - 2020</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfile;