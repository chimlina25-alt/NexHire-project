"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Radio, MessageSquare, LogOut, Loader2, Bell,
} from "lucide-react";

const sidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin_dashboard" },
  { name: "Manage Users", icon: Users, href: "/manage_user" },
  { name: "Employers", icon: Building2, href: "/admin_employer" },
  { name: "Job Posts", icon: FileText, href: "/job_station" },
  { name: "Subscription", icon: CreditCard, href: "/admin_subscription" },
  { name: "Broadcast", icon: Radio, href: "/broadcast" },
  { name: "Messages", icon: MessageSquare, href: "/admin_message" },
  { name: "Notifications", icon: Bell, href: "/admin_notifications" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    // Poll pending payments count every 30 seconds
    const fetchCounts = async () => {
      try {
        const [paymentsRes, notifsRes] = await Promise.all([
          fetch("/api/admin/payment"),
          fetch("/api/admin/my-notifications/count"),
        ]);
        if (paymentsRes.ok) {
          const payments = await paymentsRes.json();
          setPendingPayments(Array.isArray(payments) ? payments.filter((p: any) => p.status === "pending").length : 0);
        }
        if (notifsRes.ok) {
          const { count } = await notifsRes.json();
          setUnreadNotifs(count || 0);
        }
      } catch (e) { /* ignore */ }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch { /* ignore */ }
    window.location.replace("/login");
  };

  return (
    <aside className="w-64 bg-[#0d1f1a] flex flex-col py-8 px-5 fixed h-full z-10">
      <div className="flex items-center gap-2.5 mb-10 px-2">
        <div className="w-8 h-8 bg-[#00ffa3] rounded-lg flex items-center justify-center">
          <span className="text-[#0d1f1a] font-black text-xs">N</span>
        </div>
        <span className="text-white font-black text-lg tracking-tight">NexHire</span>
      </div>

      <p className="text-[#3a5a4f] text-[9px] font-black uppercase tracking-[0.2em] mb-3 px-2">
        Main Menu
      </p>

      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          // Badge count for each item
          const badge =
            item.href === "/admin_subscription" ? pendingPayments :
            item.href === "/admin_notifications" ? unreadNotifs : 0;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isActive
                  ? "bg-[#00ffa3] text-[#0d1f1a]"
                  : "text-[#6b9e8a] hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={17} />
              <span className="flex-1">{item.name}</span>
              {badge > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-[#0d1f1a] text-[#00ffa3]" : "bg-amber-500 text-white"
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 pt-5 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-[#00ffa3] rounded-lg flex items-center justify-center font-black text-[#0d1f1a] text-xs">
            A
          </div>
          <div>
            <p className="text-white font-bold text-xs">Admin</p>
            <p className="text-[#3a5a4f] text-[10px]">admin@gmail.com</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="w-full bg-red-500/10 text-red-400 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loggingOut ? (
            <><Loader2 size={15} className="animate-spin" />Signing out...</>
          ) : (
            <><LogOut size={15} />Sign Out</>
          )}
        </button>
      </div>
    </aside>
  );
}