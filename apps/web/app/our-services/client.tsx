"use client";

import Link from "next/link";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Megaphone, Newspaper, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { Badge, Button, Card } from "@career-os/ui";
import { cn } from "@career-os/utils";
import { Footer, Navbar } from "../components/public-home";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export function OurServicesClient() {
  const [activeTab, setActiveTab] = useState<"all" | "agency" | "candidate" | "employer">("all");

  const services = [
    {
      title: "Sell / Purchasing & Asset Exchange",
      category: "agency",
      icon: <Briefcase className="h-8 w-8 text-emerald-500" />,
      badge: "Commercial M&A",
      tone: "verified" as const,
      description:
        "The premier Indian recruiting asset marketplace. Securely buy, sell, or merge staffing businesses, HR tech intellectual property, software licenses, and verified corporate client portfolios.",
      features: ["Confidential zero-trust escrow", "Recruitment agency M&A valuation modeling", "Verified buyer & seller network", "Seamless database & client transitions"],
      href: "/our-services/sell-purchasing",
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 hover:border-emerald-500"
    },
    {
      title: "Latest Jobs News & Market Intelligence",
      category: "candidate",
      icon: <Newspaper className="h-8 w-8 text-blue-500" />,
      badge: "Live Market Intel",
      tone: "info" as const,
      description:
        "Stay ahead with real-time Indian employment marketplace updates, salary shift analysis, emerging technology hiring trends, and verified breaking government job notifications.",
      features: ["Daily corporate hiring pulse reports", "Emerging AI & tech skill demand maps", "Government & PSU opportunity trackers", "Verified executive compensation shifts"],
      href: "/our-services/latest-jobs-news",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/30 hover:border-blue-500"
    },
    {
      title: "Seminars & Training Programs",
      category: "candidate",
      icon: <Users className="h-8 w-8 text-indigo-500" />,
      badge: "Executive Upskilling",
      tone: "premium" as const,
      description:
        "Elevate recruitment teams and candidates through expert-led bootcamps, executive system design workshops, talent acquisition certifications, and modern AI hiring seminars.",
      features: ["Mastering AI recruitment workflows", "POSH & Indian Labor Law compliance 2026", "Live interactive hands-on bootcamps", "Industry-verified certification badges"],
      href: "/our-services/seminars-training",
      gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/30 hover:border-indigo-500"
    },
    {
      title: "Digital Marketing & Employer Branding",
      category: "employer",
      icon: <Megaphone className="h-8 w-8 text-amber-500" />,
      badge: "Growth Marketing",
      tone: "urgent" as const,
      description:
        "Supercharge your talent attraction engine. Our growth team engineers precision targeted social talent funnels on LinkedIn, YouTube, and Instagram to magnetize top tier 1 Indian engineers.",
      features: ["Employer brand perception overhauls", "Precision retargeting talent ads", "Automated high-velocity candidate funnels", "Measurable ROI & reduced cost-per-hire"],
      href: "/our-services/digital-marketing",
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30 hover:border-amber-500"
    }
  ];

  const filtered = activeTab === "all" ? services : services.filter((s) => s.category === activeTab || s.category === "all");

  return (
    <div className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]">
      <Navbar />
      
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-[var(--cos-outline-variant)] py-20 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400 via-indigo-600 to-transparent pointer-events-none" />
        <div className={cn(container, "relative z-10 text-center max-w-4xl mx-auto")}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-career-md">
              <Sparkles size={14} className="text-amber-400 fill-current" /> Jobs View Enterprise &amp; Commercial Solutions
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              Powering India&apos;s Career Ecosystem <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-500">Beyond Job Searching</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-8 max-w-3xl mx-auto">
              From commercial business &amp; software acquisitions to executive training bootcamps, real-time news intelligence, and high-velocity recruitment marketing funnels.
            </p>
          </motion.div>

          {/* Interactive Filter Tabs */}
          <div className="mt-10 inline-flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 shadow-xl">
            {[
              { id: "all", label: "All Offerings" },
              { id: "agency", label: "For Agencies & Business" },
              { id: "employer", label: "For Employers & Brands" },
              { id: "candidate", label: "Intelligence & Upskilling" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-bold text-sm transition sm:min-w-32",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg scale-105"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-24 bg-[var(--cos-surface)]">
        <div className={cn(container, "grid gap-8 md:grid-cols-2")}>
          {filtered.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={cn("flex flex-col justify-between h-full p-8 rounded-2xl border-2 transition-all duration-300 shadow-lg hover:shadow-2xl bg-gradient-to-br", s.gradient)}>
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="p-3 rounded-2xl bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)] shadow-md">
                      {s.icon}
                    </div>
                    <Badge tone={s.tone}>{s.badge}</Badge>
                  </div>
                  <h2 className="mt-6 text-2xl font-extrabold">{s.title}</h2>
                  <p className="mt-3 text-base leading-7 text-[var(--cos-on-surface-variant)]">
                    {s.description}
                  </p>
                  <div className="mt-6 border-t border-[var(--cos-outline-variant)] pt-6">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--cos-primary)] mb-3">Key Solution Pillars</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-semibold">
                      {s.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2 text-[var(--cos-on-surface)]">
                          <Zap size={14} className="text-amber-500 shrink-0 fill-current" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-4">
                  <Link
                    href={s.href}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--cos-primary)] px-6 py-3.5 text-base font-extrabold text-white shadow-md hover:bg-[var(--cos-primary-container)] transition-all hover:scale-[1.01]"
                  >
                    <span>Explore Detailed Service</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust & Metrics Section */}
      <section className="py-16 bg-[var(--cos-surface-container-low)] border-t border-[var(--cos-outline-variant)]">
        <div className={cn(container, "text-center")}>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Why Industry Leaders Rely on Jobs View Commercial Services</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="p-6 rounded-2xl bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)] shadow-sm">
              <TrendingUp className="mx-auto h-8 w-8 text-amber-500" />
              <div className="mt-3 text-3xl font-extrabold">₹420Cr+</div>
              <p className="mt-1 text-sm font-semibold text-[var(--cos-on-surface-variant)]">Agency Asset M&amp;A Valuations Modeled</p>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)] shadow-sm">
              <Users className="mx-auto h-8 w-8 text-indigo-500" />
              <div className="mt-3 text-3xl font-extrabold">14,500+</div>
              <p className="mt-1 text-sm font-semibold text-[var(--cos-on-surface-variant)]">HR Leaders &amp; Recruiters Trained</p>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)] shadow-sm">
              <Sparkles className="mx-auto h-8 w-8 text-emerald-500" />
              <div className="mt-3 text-3xl font-extrabold">3.8x</div>
              <p className="mt-1 text-sm font-semibold text-[var(--cos-on-surface-variant)]">Avg. Talent Funnel ROI Lift</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
