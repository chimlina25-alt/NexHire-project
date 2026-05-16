"use client";

import { useState } from "react";
import { Check, Menu, X, Star, MoveRight, ChevronDown } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About Us", href: "/about" },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is adjusted on a pro-rata basis.",
  },
  {
    q: "Is there a contract or commitment?",
    a: "No contracts. All paid plans are billed monthly and you can cancel anytime without penalties.",
  },
  {
    q: 'What counts as a "job post"?',
    a: "Each active job listing you publish to the platform counts as one post. You can edit and update posts freely without it counting toward your limit.",
  },
  {
    q: "Do job seekers pay anything?",
    a: "Absolutely not. NexHire is completely free for job seekers — searching, applying, and chatting with employers costs nothing.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. All transactions are secured via Stripe.",
  },
];

const plans = [
  {
    name: "BASIC",
    price: "Free",
    period: "",
    description: "Post 1 job per month for free. Best for occasional hiring.",
    features: [
      "1 active job post per month",
      "Applicant management dashboard",
      "Basic candidate profiles",
      "Email notifications",
      "Standard support",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "STANDARD",
    price: "$6.99",
    period: "/month",
    description: "Post up to 5 jobs per month. Great for small businesses.",
    features: [
      "5 active job posts per month",
      "Applicant management dashboard",
      "Full candidate profiles",
      "In-app chat with applicants",
      "Email & chat support",
    ],
    cta: "Start Standard",
    highlight: false,
  },
  {
    name: "PREMIUM",
    price: "$12.99",
    period: "/month",
    description:
      "Post up to 10 jobs per month. Ideal for companies hiring frequently.",
    features: [
      "10 active job posts per month",
      "Priority applicant placement",
      "Full candidate profiles",
      "In-app chat with applicants",
      "Featured company profile",
      "Priority support",
    ],
    cta: "Go Premium",
    highlight: true,
  },
];

export default function PricingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased font-sans">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10">
                <img
                  src="/logo.png"
                  alt="NexHire Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-2xl text-[#1f4e3d]">
                NexHire
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-10">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`font-medium transition-colors ${
                    l.href === "/pricing"
                      ? "text-[#0d9488]"
                      : "text-gray-600 hover:text-[#1f4e3d]"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <button className="px-5 py-2 text-gray-700 font-semibold">
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-6 py-2.5 bg-[#0d9488] text-white rounded-full font-semibold shadow-md hover:bg-[#0b8377] transition-colors">
                  Get Started
                </button>
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-4 space-y-3 bg-white">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block text-gray-700 font-medium py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login">
                <button className="w-full py-2 text-gray-700 font-semibold border border-gray-200 rounded-lg">
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button className="w-full py-2 bg-[#0d9488] text-white rounded-lg font-semibold">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Premium Redesigned Hero ── */}
      <section className="px-4 py-16 md:py-24 bg-gradient-to-b from-[#f0fff9]/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-block px-4 py-1 bg-[#f0fff9] text-[#0d9488] text-xs font-bold tracking-wider uppercase rounded-full">
            Simple, Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1f4e3d] leading-[1.15]">
            Plans Crafted for Every <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d9488] to-[#1f4e3d]">
              Hiring Scale
            </span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Whether you hire once a year or build out teams weekly, find a structure that fits. Zero hidden configurations. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── Pricing Cards Section ── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 items-stretch">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-[32px] p-8 md:p-10 flex flex-col gap-8 transition-all duration-300 hover:-translate-y-2 ${
                  plan.highlight
                    ? "bg-[#1f4e3d] text-white shadow-xl shadow-[#1f4e3d]/10 lg:scale-105 z-10"
                    : "bg-white border border-gray-100 shadow-sm hover:shadow-lg"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-yellow-400 text-[#1f4e3d] text-xs font-extrabold px-5 py-1.5 rounded-full shadow-md tracking-wider">
                    <Star size={12} className="fill-[#1f4e3d]" /> MOST POPULAR
                  </div>
                )}

                <div className="space-y-2">
                  <h3
                    className={`text-lg font-bold tracking-widest uppercase ${
                      plan.highlight ? "text-[#3db28c]" : "text-[#0d9488]"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      plan.highlight ? "text-gray-300/90" : "text-gray-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 border-b border-gray-100/10 pb-6">
                  <span
                    className={`text-5xl font-black tracking-tight ${
                      plan.highlight ? "text-white" : "text-[#1f4e3d]"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm font-medium ${
                        plan.highlight ? "text-gray-400" : "text-gray-400"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-4 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3.5">
                      <div
                        className={`p-0.5 rounded-full mt-0.5 flex-shrink-0 ${
                          plan.highlight ? "bg-[#3db28c]/20" : "bg-[#0d9488]/10"
                        }`}
                      >
                        <Check
                          size={14}
                          className={plan.highlight ? "text-[#3db28c]" : "text-[#0d9488]"}
                        />
                      </div>
                      <span
                        className={`text-sm leading-normal ${
                          plan.highlight ? "text-gray-200" : "text-gray-600"
                        }`}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="mt-4">
                  <button
                    className={`w-full py-4 rounded-2xl font-bold tracking-wide transition-all shadow-sm ${
                      plan.highlight
                        ? "bg-white text-[#1f4e3d] hover:bg-gray-50 hover:shadow-md"
                        : "bg-[#1f4e3d] text-white hover:bg-[#173d2e] hover:shadow-md"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Job Seekers Banner ── */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto bg-[#f0fff9]/60 border border-[#1f4e3d]/5 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold text-[#1f4e3d]">
              Job seekers always get in free
            </h3>
            <p className="text-gray-500 max-w-xl">
              Browse thousands of listings, apply instantly, and chat directly with verified employers — at zero cost.
            </p>
          </div>
          <Link href="/signup" className="w-full md:w-auto">
            <button className="w-full md:w-auto px-8 py-3.5 bg-[#0d9488] text-white rounded-full font-bold shadow-md hover:bg-[#0b8377] hover:shadow-lg transition-all whitespace-nowrap">
              Find Jobs Free
            </button>
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-[#1f4e3d]">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400">
              Everything you need to know about our plans and billing structures.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white"
              >
                <button
                  className="w-full flex justify-between items-center px-6 md:px-8 py-5 text-left bg-white hover:bg-gray-50/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-[#1f4e3d] pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-[#0d9488] flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 md:px-8 pb-6 text-gray-500 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4 bg-[#042f27]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Ready to find your next hire?
          </h2>
          <p className="text-gray-300 text-lg max-w-lg mx-auto">
            Start with our functional basic tier today — no card configurations required.
          </p>
          <div className="pt-4">
            <Link href="/signup">
              <button className="group inline-flex items-center gap-3 px-10 py-4 font-bold text-white bg-[#0d9488] hover:bg-[#0b8377] rounded-xl hover:scale-105 transition-all shadow-lg">
                Get Started Free{" "}
                <MoveRight className="transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
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