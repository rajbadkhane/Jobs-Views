"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Calculator, Check, CheckCircle2, Globe, Megaphone, Play, Sparkles, Target, TrendingUp, Users, Video, Zap } from "lucide-react";
import { Badge, Button, Card } from "@career-os/ui";
import { cn } from "@career-os/utils";
import { Footer, Navbar } from "../../components/public-home";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export function DigitalMarketingClient() {
  // Calculator state
  const [openPositions, setOpenPositions] = useState(15);
  const [currentCpa, setCurrentCpa] = useState(120); // in thousands INR (120k = 1.2 Lakh)
  const [channels, setChannels] = useState<{ linkedin: boolean; youtube: boolean; instagram: boolean }>({
    linkedin: true,
    youtube: true,
    instagram: true
  });

  // Proposal form state
  const [companyName, setCompanyName] = useState("");
  const [roleTypes, setRoleTypes] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Dynamic calculations
  const totalTraditionalCostLakhs = Math.round((openPositions * currentCpa) / 100);
  const efficiencyGain = (channels.linkedin ? 0.25 : 0) + (channels.youtube ? 0.20 : 0) + (channels.instagram ? 0.15 : 0);
  const projectedSavingsLakhs = Math.round(totalTraditionalCostLakhs * efficiencyGain * 10) / 10;
  const projectedApplications = Math.round(openPositions * 68 * (1 + efficiencyGain));

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const marketingPillars = [
    {
      title: "Precision Social Retargeting Funnels",
      badge: "Highest Velocity",
      tone: "urgent" as const,
      icon: <Target className="h-8 w-8 text-amber-500" />,
      desc: "Stop relying exclusively on active job boards. We deploy custom pixel-tracked retargeting funnels across LinkedIn, GitHub, and Instagram to magnetize top-decile passive engineers.",
      metrics: "4.2x Higher Qualified Application Rate vs. Traditional Job Portals"
    },
    {
      title: "Engineering Brand Documentaries & Reels",
      badge: "Video Excellence",
      tone: "premium" as const,
      icon: <Video className="h-8 w-8 text-orange-500" />,
      desc: "Our production desk films high-impact engineering culture interviews, technical deep dives, and authentic office walkthrough reels designed for virality on YouTube & Instagram.",
      metrics: "65% Increase in Offer Acceptance Rates via Enhanced Brand Trust"
    },
    {
      title: "Glassdoor & AmbitionBox Reputation Optimization",
      badge: "Trust Shield",
      tone: "verified" as const,
      icon: <Sparkles className="h-8 w-8 text-emerald-500" />,
      desc: "Systematic auditing and employee engagement frameworks to improve your employer promoter score, address constructive review patterns, and present an undeniable competitive rating.",
      metrics: "Avg. +0.8 Star Employer Rating Lift in 90 Days"
    },
    {
      title: "Programmatic Featured Banners & Newsletter Takeovers",
      badge: "Direct Distribution",
      tone: "info" as const,
      icon: <Megaphone className="h-8 w-8 text-blue-500" />,
      desc: "Instant priority placement across Jobs View's homepage hero carousels, command center job listings, and the daily Executive Digest newsletter reaching 1.85L+ subscribed talent.",
      metrics: "2,50,000+ Verified Impression Reach Across Indian Talent Hubs"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-b from-slate-950 via-amber-950/70 to-slate-950 text-white border-b border-[var(--cos-outline-variant)]">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400 via-orange-600 to-transparent pointer-events-none" />
        <div className={cn(container, "relative z-10 grid gap-12 lg:grid-cols-2 items-center")}>
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-career-md">
              <Megaphone size={15} className="text-amber-400" /> Employer Growth &amp; Talent Attraction Engine
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-white leading-tight">
              Digital Marketing &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-500">Employer Branding</span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-8">
              Transform how top Indian tier-1 engineers perceive your company. We combine precision social ad funnels, documentary storytelling, and programmatic talent distribution to halve your hiring costs.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#strategy-call"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-base font-extrabold text-slate-950 shadow-lg hover:from-amber-400 hover:to-orange-400 transition-all hover:scale-105"
              >
                <span>Request Growth Consultation</span>
                <ArrowRight size={18} />
              </a>
              <a
                href="#roi-simulator"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/50 bg-amber-950/40 px-6 py-3.5 text-base font-extrabold text-amber-300 shadow-md hover:bg-amber-900/60 transition"
              >
                <Calculator size={18} />
                <span>Simulate ROI Savings</span>
              </a>
            </div>
          </motion.div>

          {/* Interactive Widget: ROI Simulator */}
          <motion.div id="roi-simulator" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="p-7 rounded-2xl border border-amber-500/40 bg-slate-900/90 backdrop-blur-xl text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5 font-extrabold text-lg text-amber-400">
                  <TrendingUp size={22} />
                  <span>Talent Funnel ROI Simulator</span>
                </div>
                <Badge tone="urgent">Growth Engine</Badge>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    <span>Monthly Open Vacancies (Hiring Target)</span>
                    <span className="text-amber-400 text-sm font-extrabold">{openPositions} Positions</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={100}
                    step={1}
                    value={openPositions}
                    onChange={(e) => setOpenPositions(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-1">
                    <span>3 roles</span>
                    <span>50 roles</span>
                    <span>100 roles</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    <span>Current Avg. Agency / Sourcing Cost per Hire</span>
                    <span className="text-amber-400 text-sm font-extrabold">₹{currentCpa}k (₹{(currentCpa/100).toFixed(2)}L)</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={350}
                    step={10}
                    value={currentCpa}
                    onChange={(e) => setCurrentCpa(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Active Growth Channels</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "linkedin", label: "LinkedIn Ads (+25% Eff.)" },
                      { key: "youtube", label: "YouTube Video (+20% Eff.)" },
                      { key: "instagram", label: "Insta Reels (+15% Eff.)" }
                    ].map((chan) => {
                      const active = channels[chan.key as keyof typeof channels];
                      return (
                        <button
                          key={chan.key}
                          type="button"
                          onClick={() => setChannels({ ...channels, [chan.key]: !active })}
                          className={cn(
                            "p-2.5 rounded-xl text-xs font-extrabold border transition-all text-center flex flex-col items-center justify-center gap-1",
                            active
                              ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm"
                              : "bg-slate-800 border-slate-700 text-slate-500 opacity-60"
                          )}
                        >
                          <span className="text-[11px] leading-snug">{chan.label}</span>
                          <span className="text-[10px] font-bold">{active ? "✓ ENABLED" : "+ ADD"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-gradient-to-r from-amber-950 to-orange-950 p-5 border border-amber-500/30 grid grid-cols-2 gap-4 text-center">
                  <div className="border-r border-amber-500/20">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Projected Agency Savings</div>
                    <div className="mt-1 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                      ₹{projectedSavingsLakhs} Lakhs
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">Saved over traditional staffing firms</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-orange-300">Expected 30-Day Pipeline</div>
                    <div className="mt-1 text-3xl font-extrabold text-white">
                      {projectedApplications.toLocaleString()}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">High-intent targeted candidate profiles</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Services Pillars Deck */}
      <section className="py-20 bg-[var(--cos-surface)]">
        <div className={cn(container)}>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge tone="premium">Comprehensive Branding Engine</Badge>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">How We Accelerate Your Hiring Velocity</h2>
            <p className="mt-3 text-base text-[var(--cos-on-surface-variant)]">
              Traditional job listings wait passively for job seekers. Our growth marketing architecture actively targets high-performing passive engineers where they already spend their time.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {marketingPillars.map((p) => (
              <Card key={p.title} className="p-8 rounded-2xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] hover:border-amber-500 transition-all shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-[var(--cos-surface)] border border-[var(--cos-outline-variant)] shadow-sm">
                      {p.icon}
                    </div>
                    <Badge tone={p.tone}>{p.badge}</Badge>
                  </div>
                  <h3 className="text-2xl font-extrabold">{p.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--cos-on-surface-variant)]">{p.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--cos-outline-variant)] bg-amber-500/5 -mx-8 -mb-8 p-6 rounded-b-2xl">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Verified Client Performance Benchmark:</div>
                  <div className="text-sm font-extrabold text-[var(--cos-on-surface)] mt-1 flex items-center gap-1.5">
                    <Zap size={15} className="text-amber-500 fill-current shrink-0" />
                    <span>{p.metrics}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy Consultation & Campaign Proposal Form */}
      <section id="strategy-call" className="py-20 bg-[var(--cos-surface-container-low)] border-t border-[var(--cos-outline-variant)]">
        <div className={cn(container, "max-w-3xl mx-auto")}>
          <Card className="p-8 sm:p-10 rounded-3xl border-2 border-amber-500/40 bg-[var(--cos-surface-container-lowest)] shadow-2xl">
            <div className="text-center">
              <Badge tone="urgent">Zero-Obligation Proposal</Badge>
              <h2 className="mt-3 text-3xl font-extrabold">Schedule Your Free Growth &amp; Branding Audit</h2>
              <p className="mt-2 text-sm text-[var(--cos-on-surface-variant)]">
                Our talent marketing directors will analyze your current employer brand profile, audit competitor developer funnels, and present an immediate 30-day candidate attraction roadmap.
              </p>
            </div>

            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500 mb-4" />
                <h3 className="text-2xl font-extrabold">Audit Request Received!</h3>
                <p className="mt-2 text-sm text-[var(--cos-on-surface-variant)] max-w-md mx-auto leading-6">
                  Thank you from <strong>{companyName}</strong>. Our Head of Employer Branding has begun compiling your talent attraction blueprint and will telephone you within 2 business hours to confirm your Zoom presentation slot.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6 font-bold">
                  Submit Another Request
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleProposalSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider">Company / Brand Name *</span>
                    <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme FinTech India" className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-amber-500" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider">Target Role Profiles *</span>
                    <input type="text" required value={roleTypes} onChange={(e) => setRoleTypes(e.target.value)} placeholder="e.g. Senior Backend / AI Tech Leads" className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-amber-500" />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider">Work Email Address *</span>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.in" className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-amber-500" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider">Phone / WhatsApp Number *</span>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-amber-500" />
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4 text-base font-extrabold text-slate-950 shadow-lg hover:opacity-95 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                  >
                    <Target size={19} />
                    <span>Generate Customized Talent Funnel Blueprint</span>
                  </button>
                  <p className="mt-3 text-center text-xs text-[var(--cos-on-surface-variant)]">
                    All audit requests are handled directly by our Senior Growth Partners under full commercial confidence.
                  </p>
                </div>
              </form>
            )}
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
