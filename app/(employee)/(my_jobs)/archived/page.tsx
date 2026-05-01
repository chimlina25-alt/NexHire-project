"use client";
import React, { useEffect, useState } from "react";
import { Calendar, Ban, MoreVertical, Archive } from "lucide-react"; // Added Archive icon
import Link from "next/link";
import { usePathname } from "next/navigation";

type ArchivedJob = {
  id: string;
  title: string;
  company: string;
  archivedDate: string;
  salary: string;
  tags: string[];
  status: string;
};

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return "Negotiable";
  if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  if (min) return `From $${(min / 1000).toFixed(0)}k`;
  return `Up to $${(max! / 1000).toFixed(0)}k`;
}

const MyApplicationsArchived = () => {
  const pathname = usePathname();
  const [archivedJobs, setArchivedJobs] = useState<ArchivedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const tabs = [
    { name: "Saved", path: "/saved" },
    { name: "Applied", path: "/applied" },
    { name: "Interviews", path: "/interviews" },
    { name: "Archived", path: "/archived" },
  ];

  useEffect(() => {
    const fetchArchived = async () => {
      try {
        const res = await fetch("/api/archived-applications", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) return;
        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          title: item.jobTitle,
          company: item.company,
          archivedDate: new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          salary: formatSalary(item.salaryMin, item.salaryMax),
          tags: [item.status],
          status: item.status,
        }));
        setArchivedJobs(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchArchived();
  }, []);

  // ✅ NEW: Handle Unarchive Action
  const handleUnarchive = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/unarchive`, {
        method: "POST",
      });
      if (res.ok) {
        // Remove from Archived UI immediately (it will reappear in Applied)
        setArchivedJobs((prev) => prev.filter((j) => j.id !== applicationId));
        setMenuOpen(null);
      } else {
        alert("Failed to unarchive job");
      }
    } catch (error) {
      console.error("Unarchive error:", error);
      alert("Error unarchiving job");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">NexHire</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/home_page"><button className="hover:text-gray-300 transition-colors">Home</button></Link>
          <Link href="/saved"><button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">My Jobs</button></Link>
          <Link href="/message"><button className="hover:text-gray-300 transition-colors">Messages</button></Link>
          <Link href="/notification"><button className="hover:text-gray-300 transition-colors">Notification</button></Link>
          <Link href="/setting"><button className="hover:text-gray-300 transition-colors">Settings</button></Link>
        </nav>
        <Link href="/profile">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">User name</p>
              <p className="text-sm font-bold">Profile</p>
            </div>
            <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold text-white">U</div>
          </div>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-2">My Applications</h1>
          <p className="text-gray-400 font-medium">Track and manage your job applications</p>
        </div>
        <div className="flex gap-10 border-b border-gray-400 mb-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link key={tab.name} href={tab.path}>
                <button className={`pb-4 px-1 flex flex-col items-start relative transition-all ${isActive ? "text-[#153a30]" : "text-gray-400 hover:text-gray-600"}`}>
                  <span className="text-xs font-bold mb-1">{tab.name === "Archived" ? archivedJobs.length : 0}</span>
                  <span className="text-lg font-bold">{tab.name}</span>
                  {isActive && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#153a30] rounded-full" />}
                </button>
              </Link>
            );
          })}
        </div>
        
        {loading ? (
          <div className="text-sm text-gray-500">Loading archived applications...</div>
        ) : archivedJobs.length === 0 ? (
          <div className="text-sm text-gray-500">No archived applications.</div>
        ) : (
          <div className="space-y-8">
            {archivedJobs.map((job) => (
              <div key={job.id} className="pb-8 border-b border-gray-400 opacity-60">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-500 line-through mb-1">{job.title}</h2>
                    <p className="text-gray-400 text-sm font-bold mb-4">{job.company}</p>
                    <div className="flex items-center gap-4 text-gray-400 text-[11px] font-bold">
                      <div className="flex items-center gap-1"><Calendar size={14} />Archived on {job.archivedDate}</div>
                      <div className="flex items-center gap-1"><Ban size={14} />{job.status === "rejected" ? "Rejected" : "Withdrawn"}</div>
                    </div>
                  </div>
                  
                  {/* ✅ UPDATED: Dropdown Menu with Unarchive */}
                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === job.id ? null : job.id)} className="text-gray-400 hover:text-black transition-colors">
                      <MoreVertical size={24} />
                    </button>
                    {menuOpen === job.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
                        <button 
                          onClick={() => handleUnarchive(job.id)} 
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-[#40b594] hover:bg-[#f0f9f6] rounded-xl transition-colors"
                        >
                          <Archive size={14} /> Unarchive
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <span className="text-xl font-extrabold text-gray-400">{job.salary}</span>
                  <span className="bg-gray-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-md grayscale">{job.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
export default MyApplicationsArchived;