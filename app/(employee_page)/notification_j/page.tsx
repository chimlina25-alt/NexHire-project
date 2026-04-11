import React from 'react';
import { CheckCircle2, MoreVertical, ArrowRight, Video, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const NotificationsInterviews = () => {
  const alerts = [
    {
      id: 1,
      category: 'INTERVIEW',
      title: 'Technical Interview for 30m',
      description: 'Your session with Stripe for Full Stack Developer is starting soon.',
      time: '30m ago',
      buttonText: 'Join Meeting',
      icon: <Video size={18} />,
    },
    {
      id: 2,
      category: 'MESSAGE',
      title: 'New message form Mars',
      description: "Mars toaboa: 'I've attached the interview preparation guide..'",
      time: '1h ago',
      buttonText: 'View Message',
      icon: <MessageSquare size={18} />,
    }
  ];

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
          <Link href="/my_job">
             <button className="hover:text-gray-300 transition-colors">My Jobs</button>
           </Link> 
           <Link href="/message_j">
          <button className="hover:text-gray-300 transition-colors">Messages</button>
          </Link>
          <Link href="/notification_j">
            <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Notification</button>
          </Link>
          <Link href="/setting_j">
          <button className="hover:text-gray-300 transition-colors">Settings</button>
          </Link>
        </nav>
        
<Link href="/profile_j">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">User name</p>
            <p className="text-sm font-bold">Profile</p>
          </div>
          <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold text-white">U</div>
        </div>
      </Link>
      </header>

      <main className="max-w-4xl mx-auto p-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-5xl font-extrabold text-[#1a1a1a] mb-2">Notifications</h1>
            <p className="text-gray-500 font-medium text-lg">Keep track of your professional journey.</p>
          </div>
          <button className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] font-bold text-sm transition-colors">
            <CheckCircle2 size={20} />
            Mark all read
          </button>
        </div>

        {/* NOTIFICATION CARDS */}
        <div className="space-y-6">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className="bg-white rounded-[25px] border border-gray-100 shadow-sm p-8 flex items-start justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <p className="text-xs font-extrabold text-[#1a1a1a] mb-1 uppercase tracking-widest">
                  {alert.category}
                </p>
                <h2 className="text-xl font-extrabold text-[#1a1a1a] mb-1">
                  {alert.title}
                </h2>
                <p className="text-gray-400 font-medium text-sm mb-6">
                  {alert.description}
                </p>
                
                <button className="bg-[#153a30] text-white px-6 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2 hover:bg-[#0d2a23] transition-all">
                  {alert.buttonText}
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="flex flex-col items-end justify-between self-stretch">
                <span className="text-xs font-bold text-gray-300">{alert.time}</span>
                <button className="text-gray-400 hover:text-black mt-auto">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default NotificationsInterviews;