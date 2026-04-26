"use client";

import React, { useState } from 'react';
import { CheckCircle, Clock, MoreVertical, ArrowRight, Bell, User, Zap } from 'lucide-react';
import Link from 'next/link';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'Applicant',
      icon: User,
      title: 'Sok Rathana applied for Frontend Developer',
      description: 'New applicant profile ready for your review.',
      time: '20m ago',
      actionText: 'View Profile',
      read: false,
    },
    {
      id: 2,
      type: 'NexHire',
      icon: Zap,
      title: 'Your Standard Plan has been activated!',
      description: 'You now have access to 3 active job slots per month.',
      time: '1h ago',
      actionText: 'View Billing',
      read: false,
    },
    {
      id: 3,
      type: 'Applicant',
      icon: User,
      title: 'Pi Sari applied for Data Analyst',
      description: 'New applicant profile ready for your review.',
      time: '2h ago',
      actionText: 'View Profile',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const typeStyle: Record<string, { badge: string; iconBg: string; iconColor: string }> = {
    Applicant: {
      badge:     'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      iconBg:    'bg-[#051612]',
      iconColor: 'text-[#40b594]',
    },
    NexHire: {
      badge:     'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      iconBg:    'bg-[#40b594]',
      iconColor: 'text-[#051612]',
    },
  };

  return (
    <div className="min-h-screen font-sans pb-16" style={{ background: '#f0f4f3' }}>

      {/* ── HEADER ── */}
      <header className="bg-[#051612] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexHire" className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">NexHire</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="/dashboard">
            <button className="text-gray-300 hover:text-white transition-colors">Dashboard</button>
          </Link>
          <Link href="/post_job">
            <button className="text-gray-300 hover:text-white transition-colors">Post Job</button>
          </Link>
          <Link href="/employer_message">
            <button className="text-gray-300 hover:text-white transition-colors">Messages</button>
          </Link>
          <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Notification</button>
          <Link href="/subscription">
            <button className="text-gray-300 hover:text-white transition-colors">Subscription</button>
          </Link>
          <Link href="/employer_setting">
            <button className="text-gray-300 hover:text-white transition-colors">Settings</button>
          </Link>
        </nav>

        <Link href="/employer_profile">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Company</p>
              <p className="text-sm font-bold text-white group-hover:text-[#40b594] transition-colors">Profile</p>
            </div>
            <div className="w-10 h-10 bg-[#40b594] rounded-full flex items-center justify-center font-extrabold text-[#051612] text-sm">C</div>
          </div>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 md:px-10 py-10">

        {/* ── PAGE TITLE ── */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#40b594] mb-1">Activity</p>
            <h1 className="text-4xl font-extrabold text-[#071a15] leading-tight">Notifications</h1>
            <p className="text-[#4a5a55] font-medium mt-1">Keep track of your hiring activity</p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                <Bell size={15} className="text-[#40b594]" />
                <span className="text-sm font-extrabold text-[#071a15]">{unreadCount} unread</span>
              </div>
            )}
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 bg-white border border-gray-200 text-[#071a15] px-4 py-2 rounded-xl font-bold text-sm hover:border-[#40b594] hover:text-[#40b594] transition-all shadow-sm"
            >
              <CheckCircle size={16} />
              Mark all read
            </button>
          </div>
        </div>

        {/* ── NOTIFICATION LIST ── */}
        <div className="space-y-4">
          {notifications.map((notif) => {
            const style = typeStyle[notif.type] ?? typeStyle['Applicant'];
            const Icon = notif.icon;

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden ${
                  notif.read
                    ? 'border-gray-100'
                    : 'border-l-4 border-l-[#40b594] border-t-gray-100 border-r-gray-100 border-b-gray-100'
                } hover:shadow-md hover:border-l-[#40b594]`}
              >
                <div className="p-7">

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={style.iconColor} />
                      </div>

                      <div>
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${style.badge}`}>
                          {notif.type}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock size={12} className="text-[#6b7f79]" />
                          <span className="text-xs font-semibold text-[#6b7f79]">{notif.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notif.read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#40b594] flex-shrink-0" />
                      )}
                      <button
                        onClick={() => markOneRead(notif.id)}
                        className="p-1.5 rounded-lg text-[#6b7f79] hover:bg-[#f0f4f3] hover:text-[#071a15] transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="pl-13 ml-1">
                    <h3 className="text-base font-extrabold text-[#071a15] leading-snug mb-1">
                      {notif.title}
                    </h3>
                    <p className="text-sm text-[#4a5a55] font-medium leading-relaxed">
                      {notif.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <button className="flex items-center gap-2 bg-[#051612] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0d2a23] transition-all shadow-sm">
                      {notif.actionText}
                      <ArrowRight size={16} />
                    </button>

                    {!notif.read && (
                      <button
                        onClick={() => markOneRead(notif.id)}
                        className="text-xs font-bold text-[#6b7f79] hover:text-[#40b594] transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
              <Bell size={28} className="text-[#40b594]" />
            </div>
            <p className="text-lg font-extrabold text-[#071a15]">All caught up!</p>
            <p className="text-sm text-[#4a5a55] mt-1">No new notifications right now.</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default Notifications;