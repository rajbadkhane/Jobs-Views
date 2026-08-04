"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Award, Calendar, Check, CheckCircle2, Clock, Globe, GraduationCap, MapPin, Sparkles, Users, Video, Zap } from "lucide-react";
import { Badge, Button, Card } from "@career-os/ui";
import { cn } from "@career-os/utils";
import { Footer, Navbar } from "../../components/public-home";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export function SeminarsTrainingClient() {
  const [selectedSeminar, setSelectedSeminar] = useState<string | null>(null);
  const [registeringSeminar, setRegisteringSeminar] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [ticketType, setTicketType] = useState<"individual" | "corporate">("individual");
  const [registered, setRegistered] = useState(false);

  const seminars = [
    {
      id: "ai-recruitment-bootcamp",
      title: "Mastering AI-Driven Recruitment & Automated Sourcing 2026",
      badge: "Fast Filling",
      tone: "urgent" as const,
      date: "August 24, 2026",
      time: "10:00 AM - 4:00 PM IST",
      location: "Live Interactive Stream (Zoom)",
      price: "₹3,499 per seat",
      desc: "Transform your talent acquisition lifecycle using modern generative AI agents, programmatic Boolean pipelines, and ethical algorithmic screening without compromising human candidate rapport.",
      targetAudience: "HR Directors, Talent Acquisition Specialists, Technical Recruiters",
      faculty: "Dr. Arvind Mehta (ex-VPE Talent AI, Infosys) & Priya Nair (Principal Global Sourcing)",
      modules: [
        "Module 1: Building Custom RAG AI Agents for Autonomous Candidate Sourcing",
        "Module 2: Advanced LinkedIn & GitHub Programmatic Boolean Scraping",
        "Module 3: Overcoming AI Hallucinations & Eliminating Algorithmic Gender/Age Bias",
        "Module 4: Live Hands-On Workshop: Automating Your ATS Funnel in 4 Hours"
      ]
    },
    {
      id: "executive-system-design",
      title: "Executive System Design & Technical Interview Architecture",
      badge: "Bestseller",
      tone: "premium" as const,
      date: "September 5, 2026",
      time: "9:00 AM - 5:00 PM IST",
      location: "Bengaluru Innovation Hub & Hybrid",
      price: "₹6,999 (Includes Networking Lunch & Recording)",
      desc: "An intensive 8-hour masterclass designed for engineering managers and architects tasked with designing world-class, anti-bias technical hiring assessment rubrics for distributed cloud systems.",
      targetAudience: "VPs of Engineering, Engineering Managers, Tech Leads, Founders",
      faculty: "Sanjay Kulkarni (Distinguished Architect & Staff Author)",
      modules: [
        "Module 1: Designing Anti-Fragile Systems Assessment Scenarios",
        "Module 2: Replacing Trivial Whiteboard LeetCode with Architectural Realism",
        "Module 3: Calibrating Engineering Offer Multiples in Global Capability Centers",
        "Module 4: Peer Mock Interview Evaluations & Rubric Standardization"
      ]
    },
    {
      id: "posh-labor-law-2026",
      title: "Indian Labor Law, POSH & DPDP Privacy Compliance Masterclass",
      badge: "Mandatory Certification",
      tone: "verified" as const,
      date: "September 18, 2026",
      time: "2:00 PM - 6:00 PM IST",
      location: "Live Masterclass (With Digital Certificate)",
      price: "₹2,499 per seat",
      desc: "Navigate the intricate intersection of the Digital Personal Data Protection (DPDP) Act 2023, revised Indian Labor Codes, and POSH committee compliance for modern hybrid workplaces.",
      targetAudience: "Chief Human Resources Officers, In-House Legal Counsel, HR Operations",
      faculty: "Advocate Meenakshi Sundaram (Senior High Court Labor Law Counsel)",
      modules: [
        "Module 1: Implementing DPDP Compliant Resume Retention & Candidate Consent Vaults",
        "Module 2: Revised Indian Labor Codes 2026: Gratuity, PF, and Remote Work Contracts",
        "Module 3: Constituting & Auditing Internal Complaints Committees (POSH)",
        "Module 4: Legal Q&A Clinic: Defending Against Wrongful Termination & NDA Disputes"
      ]
    },
    {
      id: "employer-branding-summit",
      title: "High-Velocity Talent Branding for GCC & Growth Tech Leaders",
      badge: "Executive Summit",
      tone: "info" as const,
      date: "October 2, 2026",
      time: "11:00 AM - 3:00 PM IST",
      location: "Hyderabad Tech Park & Online Stream",
      price: "₹4,999 per seat",
      desc: "Learn how top 1% employers engineer high-converting developer career pages, engineer-led YouTube engineering blogs, and social proof funnels that reduce cost-per-hire by up to 50%.",
      targetAudience: "CMOs, Head of Talent Branding, Startup Founders, Talent Partners",
      faculty: "Rohan Vohra (Former VP Marketing, Flipkart & Employer Brand Strategist)",
      modules: [
        "Module 1: Turning Engineering Teams into Authentic Brand Ambassadors",
        "Module 2: Architecting Low-CPA LinkedIn Retargeting Ads for Passive Tier-1 Engineers",
        "Module 3: Glassdoor & AmbitionBox Brand Reputation Repair Tactics",
        "Module 4: Case Study Deconstruct: How a GCC Reduced Time-to-Hire from 45 to 14 Days"
      ]
    }
  ];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistered(true);
  };

  return (
    <div className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white border-b border-[var(--cos-outline-variant)]">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-400 via-purple-600 to-transparent pointer-events-none" />
        <div className={cn(container, "relative z-10 text-center max-w-4xl mx-auto")}>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shadow-career-md">
              <GraduationCap size={15} className="text-indigo-400" /> Executive Upskilling &amp; Corporate Bootcamps
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              Seminars, Workshops &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-500">Training Programs</span>
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-slate-300 leading-8 max-w-3xl mx-auto">
              Empower your recruiting leadership and technical interviewers with expert-led masterclasses in AI sourcing algorithms, architectural assessment, labor law compliance, and talent branding.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="#upcoming-seminars"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lg hover:bg-indigo-500 transition-all hover:scale-105"
              >
                <span>Browse Upcoming Bootcamps</span>
                <ArrowRight size={18} />
              </a>
              <a
                href="#corporate-inquiry"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/50 bg-indigo-950/40 px-6 py-3.5 text-base font-extrabold text-indigo-200 shadow-md hover:bg-indigo-900/60 transition"
              >
                <span>Request Custom In-House Team Training</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seminars Deck */}
      <section id="upcoming-seminars" className="py-20 bg-[var(--cos-surface)]">
        <div className={cn(container)}>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge tone="premium">Live Q3 2026 Schedule</Badge>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Immersive Technical &amp; Leadership Masterclasses</h2>
            <p className="mt-3 text-base text-[var(--cos-on-surface-variant)]">
              Each participant receives live instructor mentorship, comprehensive training slides, Python/Boolean templates, and an industry-recognized Jobs View Certified Badge.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {seminars.map((sem) => (
              <Card key={sem.id} className="p-8 rounded-2xl border-2 border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] hover:border-indigo-500 transition-all shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--cos-outline-variant)] pb-4 mb-5">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm flex items-center gap-1.5">
                      <Calendar size={16} /> {sem.date}
                    </span>
                    <Badge tone={sem.tone}>{sem.badge}</Badge>
                  </div>

                  <h3 className="text-2xl font-extrabold tracking-tight">{sem.title}</h3>
                  
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-[var(--cos-on-surface-variant)]">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock size={14} className="text-indigo-500 shrink-0" /> {sem.time}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      {sem.location.includes("Zoom") || sem.location.includes("Online") ? <Video size={14} className="text-emerald-500 shrink-0" /> : <MapPin size={14} className="text-amber-500 shrink-0" />}
                      {sem.location}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[var(--cos-on-surface-variant)] font-medium">
                    {sem.desc}
                  </p>

                  <div className="mt-5 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs">
                    <div className="font-extrabold text-indigo-600 dark:text-indigo-300">Target Cohort:</div>
                    <div className="font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{sem.targetAudience}</div>
                    <div className="font-extrabold text-indigo-600 dark:text-indigo-300 mt-2">Distinguished Faculty:</div>
                    <div className="font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{sem.faculty}</div>
                  </div>

                  {/* Syllabus Toggle */}
                  <div className="mt-5">
                    <button
                      onClick={() => setSelectedSeminar(selectedSeminar === sem.id ? null : sem.id)}
                      className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>{selectedSeminar === sem.id ? "Hide Detailed Module Curriculum ▲" : "View Detailed Module Curriculum ▼"}</span>
                    </button>

                    <AnimatePresence>
                      {selectedSeminar === sem.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 overflow-hidden"
                        >
                          <ul className="space-y-2 p-4 rounded-xl bg-[var(--cos-surface)] border border-[var(--cos-outline-variant)] text-xs font-bold">
                            {sem.modules.map((mod) => (
                              <li key={mod} className="flex items-start gap-2 text-[var(--cos-on-surface)]">
                                <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>{mod}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-[var(--cos-outline-variant)] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase text-slate-500 block">Tuition / Registration</span>
                    <span className="text-xl font-extrabold text-[var(--cos-on-surface)]">{sem.price}</span>
                  </div>
                  <button
                    onClick={() => { setRegisteringSeminar(sem.title); setRegistered(false); }}
                    className="rounded-xl bg-[var(--cos-primary)] hover:bg-[var(--cos-primary-container)] px-6 py-3 font-extrabold text-white text-sm shadow-md transition-all hover:scale-105"
                  >
                    Reserve Seat &amp; Enroll
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Modal / Drawer */}
      <AnimatePresence>
        {registeringSeminar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-3xl bg-[var(--cos-surface-container-lowest)] border-2 border-indigo-500 p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--cos-outline-variant)] pb-4">
                <h3 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Award size={22} /> Seminar Registration
                </h3>
                <button onClick={() => setRegisteringSeminar(null)} className="text-slate-400 hover:text-white font-bold text-xl px-2">✕</button>
              </div>

              {registered ? (
                <div className="py-8 text-center space-y-4">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                  <h4 className="text-2xl font-extrabold">Seat Successfully Reserved!</h4>
                  <p className="text-sm text-[var(--cos-on-surface-variant)]">
                    You have enrolled in <strong>{registeringSeminar}</strong> ({ticketType === "individual" ? "Individual Pass" : "Corporate Team Cohort"}). An instant calendar invite with payment &amp; preparation materials has been dispatched to <strong>{email}</strong>.
                  </p>
                  <Button onClick={() => setRegisteringSeminar(null)} className="w-full font-bold mt-4">
                    Return to Schedule
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-extrabold">
                    Enrolling In: <span className="text-indigo-600 dark:text-indigo-300">{registeringSeminar}</span>
                  </div>

                  <div className="flex gap-2 p-1 rounded-xl bg-[var(--cos-surface)] border border-[var(--cos-outline-variant)]">
                    <button
                      type="button"
                      onClick={() => setTicketType("individual")}
                      className={cn("flex-1 py-2 rounded-lg font-extrabold text-xs transition", ticketType === "individual" ? "bg-indigo-600 text-white" : "text-slate-400")}
                    >
                      Individual Seat
                    </button>
                    <button
                      type="button"
                      onClick={() => setTicketType("corporate")}
                      className={cn("flex-1 py-2 rounded-lg font-extrabold text-xs transition", ticketType === "corporate" ? "bg-indigo-600 text-white" : "text-slate-400")}
                    >
                      Corporate Team Billing
                    </button>
                  </div>

                  <label className="block">
                    <span className="text-xs font-bold uppercase">Participant Full Name *</span>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anaya Mehta" className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-indigo-500" />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold uppercase">Professional Email (For Calendar Invite) *</span>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="anaya@enterprise.in" className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-indigo-500" />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold uppercase">Company / Organization *</span>
                    <input type="text" required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. CloudTech Bangalore" className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-indigo-500" />
                  </label>

                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setRegisteringSeminar(null)} className="w-1/3 rounded-xl border border-[var(--cos-outline-variant)] py-3 font-bold text-sm">
                      Cancel
                    </button>
                    <button type="submit" className="w-2/3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-3 font-extrabold text-sm shadow-md transition">
                      Confirm Seat Reservation
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom In-House Corporate Training CTA */}
      <section id="corporate-inquiry" className="py-20 bg-[var(--cos-surface-container-low)] border-t border-[var(--cos-outline-variant)]">
        <div className={cn(container, "max-w-4xl mx-auto text-center")}>
          <Badge tone="verified">Enterprise Solutions</Badge>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Require Customized In-House Bootcamp Cohorts?</h2>
          <p className="mt-3 text-base text-[var(--cos-on-surface-variant)] leading-7 max-w-2xl mx-auto">
            Our faculty partners directly with HR executives at top Indian enterprises and Global Capability Centers to curate proprietary learning sprints tailored precisely to your specific internal tech stack &amp; hiring targets.
          </p>
          <div className="mt-8 inline-flex items-center gap-4 bg-[var(--cos-surface-container-lowest)] p-4 sm:p-6 rounded-2xl border border-[var(--cos-outline-variant)] shadow-lg flex-wrap justify-center">
            <div className="text-left">
              <div className="font-extrabold text-base">Dedicated Enterprise Academic Advisor</div>
              <div className="text-xs font-semibold text-[var(--cos-on-surface-variant)]">Available for customized curriculum consultations across India</div>
            </div>
            <a
              href="mailto:corporate-seminars@jobsview.in?subject=In-House%20Bootcamp%20Inquiry"
              className="rounded-xl bg-indigo-600 px-6 py-3.5 font-extrabold text-white shadow-md hover:bg-indigo-500 transition"
            >
              Email Corporate Desk: corporate-seminars@jobsview.in
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
