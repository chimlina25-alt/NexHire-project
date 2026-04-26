"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CreditCard,
  Radio,
  MessageSquare,
  LogOut,
  Search,
  Trash2,
} from "lucide-react";

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  href: string;
}

type UserRow = {
  id: string;
  email: string;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
};

const ManageUsers = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const sidebarItems: SidebarItem[] = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin_dashboard" },
    { name: "Manage Users", icon: <Users size={20} />, href: "/manage_user" },
    { name: "Employers", icon: <Building2 size={20} />, href: "/admin_emplyer" },
    { name: "Job Posts", icon: <FileText size={20} />, href: "/job_station" },
    { name: "Subscription", icon: <CreditCard size={20} />, href: "/admin_subscription" },
    { name: "Broadcast", icon: <Radio size={20} />, href: "/broadcast" },
    { name: "Messages", icon: <MessageSquare size={20} />, href: "/admin_message" },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const filtered = users.filter((u) => {
    const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase();
    const email = u.email.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      <aside className="w-72 bg-[#f1fcf9] border-r border-gray-100 flex flex-col p-8 fixed h-full">
        <div className="flex items-center gap-3 mb-12 ml-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <img src="/logo.png" alt="NexHire" />
          </div>
          <span className="text-2xl font-black text-[#153a30] tracking-tight">NexHire</span>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all ${
                  isActive
                    ? "bg-[#dcfce7] text-[#16a34a]"
                    : "text-[#153a30]/70 hover:bg-white hover:shadow-sm"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-[#dcfce7] p-4 rounded-2xl flex items-center gap-3 border border-green-100">
            <div className="w-10 h-10 bg-[#00ffa3] rounded-xl flex items-center justify-center font-black text-[#153a30]">
              A
            </div>
            <div>
              <p className="font-bold text-sm text-[#153a30]">Admin</p>
              <p className="text-[10px] text-gray-500 truncate">admin@nexhire.com</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full bg-[#ff4b4b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-1">Manage Users</h1>
          <p className="text-gray-400 font-bold tracking-wide uppercase text-sm">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="bg-white rounded-[35px] border border-gray-100 shadow-sm p-8">
          <div className="relative mb-10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f1fcf9] border-none rounded-full py-4 pl-16 pr-6 text-sm font-medium focus:ring-2 focus:ring-[#00ffa3]/20 transition-all outline-none"
              placeholder="Search users..."
            />
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left text-xs font-black text-[#1a1a1a] uppercase tracking-wider">
                    <th className="px-6 pb-2">Name</th>
                    <th className="px-6 pb-2">Email</th>
                    <th className="px-6 pb-2">Joined</th>
                    <th className="px-6 pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="group border-b border-gray-50 last:border-none">
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-[#1a1a1a] text-sm">
                          {user.firstName || user.lastName
                            ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-600">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No users found.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;