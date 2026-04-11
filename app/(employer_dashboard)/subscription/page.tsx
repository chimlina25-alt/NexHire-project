import React from 'react';
import { Settings, Check, Mail, BarChart2, Layers, Briefcase, FileText } from 'lucide-react';
import Link from 'next/link';

const SubscriptionPlans = () => {
  const plans = [
    {
      name: 'Normal (Free)',
      price: '0',
      description: 'Free one-time job post per month. Perfect for casual hiring.',
      buttonText: 'Start Free',
      buttonVariant: 'secondary',
      icon: <Layers className="text-blue-400" size={32} />,
      features: []
    },
    {
      name: 'Standard (Paid)',
      price: '4.99',
      description: 'Post up to 3 jobs per month. Best for growing teams.',
      buttonText: 'Subscribe Standard',
      buttonVariant: 'primary',
      highlight: '3x Jobs!',
      icon: <FileText className="text-blue-300" size={32} />,
      features: [
        { icon: <Briefcase size={18} />, text: 'Standard Visibility' },
        { icon: <Mail size={18} />, text: 'Email Support' },
      ]
    },
    {
      name: 'Premium (Paid)',
      price: '10.99',
      subPrice: 'premium price',
      description: 'Post up to 7 jobs per month. For high-volume hiring.',
      buttonText: 'Go Premium',
      buttonVariant: 'primary',
      highlight: '7x Jobs!',
      icon: <Briefcase className="text-teal-500" size={32} />,
      features: [
        { icon: <Layers size={18} />, text: 'Feature Job Posting' },
        { icon: <Check size={18} />, text: 'Priority Support' },
        { icon: <BarChart2 size={18} />, text: 'Candidate Analytics' },
      ]
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
           <Link href="/dashboard">
             <button className="hover:text-gray-300 transition-colors">Dashboard</button>
           </Link>
          <Link href="/post_job">
            <button className="hover:text-gray-300 transition-colors">Post Job</button>
          </Link>
          <Link href="/message_er">
            <button className="hover:text-gray-300 transition-colors">Messages</button>
          </Link>
          <Link href="/subscription">
            <button className="text-[#40b594] border-b-2 border-[#40b594] pb-1">Subscription</button>
          </Link>
          <Link href="/notification">
            <button className="hover:text-gray-300 transition-colors">Notification</button>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <Link href="/profile">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">User name</p>
              <p className="text-sm font-bold">Profile</p>
            </Link>
          </div>
          <div className="w-10 h-10 bg-[#2d4f45] rounded-full flex items-center justify-center font-bold">U</div>
          <Link href="/setting">
            <Settings className="text-gray-400 cursor-pointer" size={24} />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 pt-16 text-center">
        <h1 className="text-5xl font-bold text-[#1a1a1a] mb-4">Subscription Plans</h1>
        <p className="text-gray-500 text-lg mb-16">Select the plan that fit your hiring needs.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div key={idx} className="bg-white rounded-[25px] p-10 border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="mb-6">{plan.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">{plan.name}</h3>
              
              {plan.subPrice && <p className="text-gray-400 text-sm mb-1">{plan.subPrice}</p>}
              
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-black">${plan.price}</span>
                <span className="text-gray-400 font-medium">/ month</span>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-8 h-12">
                {plan.description}
              </p>

              {plan.highlight && (
                <div className="w-full bg-[#00a37b] text-white py-2 rounded-lg font-bold text-sm mb-6">
                  {plan.highlight}
                </div>
              )}

              <div className="flex-1 w-full space-y-4 mb-10">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3 text-gray-500 text-sm ml-4">
                    <span className="text-gray-400">{feature.icon}</span>
                    <span className="font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-full font-bold transition-all ${
                plan.buttonVariant === 'primary' 
                ? 'bg-[#153a30] text-white hover:bg-[#0d2a23]' 
                : 'bg-[#f1fcf9] text-[#153a30] border border-[#e4f6f1] hover:bg-[#e4f6f1]'
              }`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPlans;