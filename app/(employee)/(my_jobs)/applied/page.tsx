"use client";
import React, { useEffect, useState } from "react";
import { MoreVertical, Archive } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserNavProfile from "@/components/ui/UserNavProfile";

type AppliedJob = {
  id: string;
  jobId: string;
  title: string;
  company: string;
  description: string;
  salary: string;
  status: string;
};

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return "Negotiable";
  if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  if (min) return `From $${(min / 1000).toFixed(0)}k`;
  return `Up to $${(max! / 1000).toFixed(0)}k`;
}

const MyApplicationsApplied = () => {
  const pathname = usePathname();
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const tabs = [
    { name: "Saved", path: "/saved" },
    { name: "Applied", path: "/applied" },
    { name: "Interviews", path: "/interviews" },
    { name: "Archived", path: "/archived" },
  ];

  useEffect(() => {
    const fetchApplied = async () => {
      try {
        const res = await fetch("/api/applications", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) return;
        const mapped = (data || [])
          .filter((item: any) => item.status !== "archived" && item.status !== "withdrawn")
          .map((item: any) => ({
            id: item.id,
            jobId: item.jobId,
            title: item.jobTitle,
            company: item.companyName ?? item.company ?? "",
            description: item.description ?? "",
            salary: formatSalary(item.salaryMin, item.salaryMax),
            status: item.status,
          }));
        setAppliedJobs(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplied();
  }, []);

  // Archive by applicationId (the real application ID)
  const handleArchive = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/archive`, { method: "POST" });
      if (res.ok) {
        setAppliedJobs((prev) => prev.filter((j) => j.id !== applicationId));
        setMenuOpen(null);
      } else {
        alert("Failed to archive application");
      }
    } catch (error) {
      console.error("Archive error:", error);
      alert("Error archiving application");
    }
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700",
    accepted: "bg-green-50 text-green-700",
    interview: "bg-blue-50 text-blue-700",
    rejected: "bg-red-50 text-red-700",
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
        <UserNavProfile />
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
                  <span className="text-xs font-bold mb-1">{tab.name === "Applied" ? appliedJobs.length : 0}</span>
                  <span className="text-lg font-bold">{tab.name}</span>
                  {isActive && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#153a30] rounded-full" />}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="flex gap-8 mb-8 text-sm font-bold text-gray-600">
          <span>Total: {appliedJobs.length}</span>
          <span>Accepted: {appliedJobs.filter((j) => j.status === "accepted").length}</span>
          <span>Interview: {appliedJobs.filter((j) => j.status === "interview").length}</span>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading applications...</div>
        ) : appliedJobs.length === 0 ? (
          <div className="text-sm text-gray-500">No applications yet.</div>
        ) : (
          <div className="space-y-4">
            {appliedJobs.map((job) => (
              <div key={job.id} className="py-6 border-b border-gray-400">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#1a1a1a] mb-1">{job.title}</h2>
                    <p className="text-gray-400 text-sm font-bold mb-4">{job.company}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full font-bold text-xs ${statusColor[job.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {job.status}
                    </span>
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === job.id ? null : job.id)} className="text-gray-400 hover:text-black transition-colors">
                        <MoreVertical size={22} />
                      </button>
                      {menuOpen === job.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
                          <button
                            onClick={() => handleArchive(job.id)}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-[#6b7f79] hover:bg-[#f0f9f6] rounded-xl transition-colors"
                          >
                            <Archive size={14} /> Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-6 max-w-2xl line-clamp-2">{job.description}</p>
                <div className="flex items-center gap-6">
                  <span className="text-lg font-extrabold text-[#1a1a1a]">{job.salary}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyApplicationsApplied;