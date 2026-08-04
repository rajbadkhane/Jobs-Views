"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, BarChart3, Bell, CheckCircle2, ChevronDown, Clock, Filter, Globe, Newspaper, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Badge, Button, Card } from "@career-os/ui";
import { cn } from "@career-os/utils";
import { Footer, Navbar } from "../../components/public-home";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export function LatestJobsNewsClient() {
  const [activeCategory, setActiveCategory] = useState<string>("All News");
  const [selectedHub, setSelectedHub] = useState<"Bengaluru" | "Delhi NCR" | "Hyderabad" | "Mumbai" | "Remote">("Bengaluru");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const categories = ["All News", "Tech & AI Hiring", "Government & PSU", "Banking & Fintech", "Salary & Economy"];

  const hubStats = {
    "Bengaluru": { growth: "+18.4%", avgSalary: "₹18.5 LPA", topSkills: ["GenAI", "Go", "Kubernetes", "React", "Data Engineering"], hotSector: "Enterprise SaaS & AI" },
    "Delhi NCR": { growth: "+14.2%", avgSalary: "₹15.2 LPA", topSkills: ["Outside Sales", "Product Management", "Fintech Compliance", "Node.js"], hotSector: "Consumer Tech & Retail" },
    "Hyderabad": { growth: "+21.7%", avgSalary: "₹17.8 LPA", topSkills: ["Distributed Systems", "Python", "Cloud Architecture", "VLSI Design"], hotSector: "GCC & Global Analytics" },
    "Mumbai": { growth: "+12.1%", avgSalary: "₹19.4 LPA", topSkills: ["Quantitative Risk", "Investment Banking", "Corporate Law", "ESG Reporting"], hotSector: "Banking & Financial Markets" },
    "Remote": { growth: "+28.9%", avgSalary: "₹24.0 LPA", topSkills: ["Full Stack Dev", "TypeScript", "AI Agents", "Remote Sales"], hotSector: "US/Europe Offshore Teams" }
  };

  const newsArticles = [
    {
      id: "ai-campus-hiring-2026",
      title: "Tier-1 Indian IT Giants Pivot to Specialized GenAI Campus Cohorts for Q3 2026",
      category: "Tech & AI Hiring",
      source: "Jobs View Research Bureau",
      timestamp: "2 hours ago",
      readTime: "3 min read",
      urgent: true,
      summary: "Traditional generic systems engineering intake is dropping by 15%, replaced entirely by rapid onboarding tracks targeting students certified in LLM finetuning, PyTorch, and cloud inference engines.",
      fullText: "A strategic survey of over 40 Global Capability Centers (GCCs) across Bengaluru and Hyderabad reveals a massive reallocation of university training budgets. Candidates presenting verified GitHub portfolios demonstrating conversational agents and retrieval-augmented generation (RAG) are receiving starting packages averaging 35% above historic baselines. Human resource directors emphasize that foundational coding tests are being augmented with prompt engineering and LLM evaluation benchmarks."
    },
    {
      id: "psu-railway-recruitment",
      title: "Ministry of Railways & Public Sector Banks Advance Next-Gen Unified Digital Recruitment Portal",
      category: "Government & PSU",
      source: "Govt Notification Desk",
      timestamp: "6 hours ago",
      readTime: "4 min read",
      urgent: false,
      summary: "Over 1,40,000 Group B and Group C technical vacancies scheduled for computerized nationwide testing, introducing Aadhaar-verified instant hall tickets and transparent AI-based answer key challenges.",
      fullText: "To drastically curb examination delays and eliminate geographical inequities, the central recruitment authority has partnered with secure cloud infrastructures to deploy synchronized examination centers across 900+ cities. Aspirants can now link their DigiLocker credentials for real-time educational degree verification, cutting post-exam document verification timelines from 6 months down to less than 14 days."
    },
    {
      id: "salary-increment-outlook-2026",
      title: "2026 India Compensation Outlook: Double-Digit Hikes Preserved for High-Impact Engineers",
      category: "Salary & Economy",
      source: "Market Intelligence Group",
      timestamp: "1 day ago",
      readTime: "5 min read",
      urgent: false,
      summary: "While macroeconomic sentiment remains balanced, top-decile product developers and cybersecurity specialists in India are projected to log an average annual salary increment of 13.8%.",
      fullText: "Our latest statistical cross-tabulation of 18,500 verified employer payroll shifts demonstrates a sharp widening between niche talent and generalist operations. Companies are leaning aggressively into variable retention retention bonuses and stock appreciation rights (SARs) to prevent mid-level architectural talent from migrating to highly capitalized early-stage deeptech startups."
    },
    {
      id: "fintech-compliance-hiring",
      title: "Fintech Compliance & Risk Engineering Rolls Become Mumbai's Most Competed Vacancies",
      category: "Banking & Fintech",
      source: "Financial Sector Watch",
      timestamp: "2 days ago",
      readTime: "3 min read",
      urgent: false,
      summary: "Stricter digital lending regulatory norms have triggered a 60% hiring surge for legal technologist hybrid roles who can encode regulatory constraints directly into core banking transactional pipelines.",
      fullText: "With regulatory compliance evolving from manual audits to real-time API monitoring, financial institutions are co-locating compliance attorneys directly within agile software sprints. Professionals holding dual competencies in financial regulation and automated software quality assurance command immediate sign-on bonuses across Bandra-Kurla Complex and GIFT City."
    }
  ];

  const filteredArticles = activeCategory === "All News" 
    ? newsArticles 
    : newsArticles.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]">
      <Navbar />

      {/* Live Ticker Bar */}
      <div className="bg-[var(--cos-primary)] text-white text-xs font-extrabold py-2 px-4 border-b border-[var(--cos-outline-variant)] overflow-hidden">
        <div className={cn(container, "flex items-center gap-3")}>
          <span className="shrink-0 flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded uppercase font-extrabold text-[10px]">
            <Zap size={12} className="fill-current animate-pulse text-slate-950" /> Live Pulse
          </span>
          <p className="truncate sm:overflow-visible sm:whitespace-nowrap sm:animate-marquee">
            ⚡ BREAKING: Bengaluru &amp; Hyderabad GCCs report +21.7% surge in Q3 AI hiring • Central Railway announces 1.4L unified digital vacancies • Remote product engineering compensation averages reach ₹24.0 LPA across India!
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-white border-b border-[var(--cos-outline-variant)]">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-cyan-600 to-transparent pointer-events-none" />
        <div className={cn(container, "relative z-10 text-center max-w-4xl mx-auto")}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Newspaper size={14} className="text-blue-400" /> Jobs View Intelligence Desk
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              Latest Jobs News &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">Market Intelligence</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto leading-8">
              Real-time Indian recruitment journalism, macroeconomic salary shifts, emerging talent heatmaps, and breaking policy updates curated for career leaders.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Intelligence Widget: Regional Market Pulse */}
      <section className="py-12 bg-[var(--cos-surface-container-low)] border-b border-[var(--cos-outline-variant)]">
        <div className={cn(container)}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <Badge tone="info">Live Intelligence Radar</Badge>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl flex items-center gap-2">
                <BarChart3 className="text-blue-500" /> Regional Hiring &amp; Salary Pulse
              </h2>
            </div>

            {/* Hub selector tab buttons */}
            <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)] shadow-sm">
              {(["Bengaluru", "Delhi NCR", "Hyderabad", "Mumbai", "Remote"] as const).map((hub) => (
                <button
                  key={hub}
                  onClick={() => setSelectedHub(hub)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-extrabold transition",
                    selectedHub === hub
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "text-[var(--cos-on-surface-variant)] hover:text-[var(--cos-on-surface)]"
                  )}
                >
                  {hub} {hub === "Remote" ? "🇮🇳" : ""}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedHub}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 md:grid-cols-4 rounded-2xl p-6 bg-gradient-to-r from-blue-950/40 via-[var(--cos-surface-container-lowest)] to-blue-950/40 border border-blue-500/30 shadow-lg"
            >
              <div className="p-4 rounded-xl bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)]">
                <div className="text-xs font-extrabold text-[var(--cos-on-surface-variant)] uppercase">YoY Job Volume Lift</div>
                <div className="mt-2 text-3xl font-extrabold text-emerald-500 flex items-center gap-1">
                  <TrendingUp size={24} /> {hubStats[selectedHub].growth}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500">Active postings momentum</div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)]">
                <div className="text-xs font-extrabold text-[var(--cos-on-surface-variant)] uppercase">Median Experienced Package</div>
                <div className="mt-2 text-3xl font-extrabold text-blue-500 dark:text-blue-400">
                  {hubStats[selectedHub].avgSalary}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500">For 4-7 yrs verified talent</div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)]">
                <div className="text-xs font-extrabold text-[var(--cos-on-surface-variant)] uppercase">Primary Growth Engine</div>
                <div className="mt-2 text-xl font-extrabold text-amber-500 truncate">
                  {hubStats[selectedHub].hotSector}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500">Highest job creation velocity</div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)] flex flex-col justify-center">
                <div className="text-xs font-extrabold text-[var(--cos-on-surface-variant)] uppercase mb-2">In-Demand Skills &amp; Keywords</div>
                <div className="flex flex-wrap gap-1.5">
                  {hubStats[selectedHub].topSkills.map((sk) => (
                    <Badge key={sk} tone="verified">{sk}</Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* News Deck & Category Filter */}
      <section className="py-16 sm:py-24 bg-[var(--cos-surface)]">
        <div className={cn(container)}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--cos-outline-variant)] pb-6 mb-10">
            <h2 className="text-2xl font-extrabold sm:text-3xl flex items-center gap-2">
              <Filter size={20} className="text-blue-500" /> Executive Research Reports
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition",
                    activeCategory === cat
                      ? "bg-[var(--cos-primary)] text-white shadow-md"
                      : "bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)] hover:border-blue-500"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {filteredArticles.map((art) => (
              <Card key={art.id} className="p-7 rounded-2xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] hover:border-blue-500 transition-all shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[var(--cos-on-surface-variant)] mb-4">
                    <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-extrabold">
                      <Globe size={14} /> {art.source}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock size={13} /> {art.readTime}</span>
                      <span>• {art.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone="neutral">{art.category}</Badge>
                    {art.urgent ? <Badge tone="urgent">⚡ High Impact</Badge> : null}
                  </div>

                  <h3 className="text-xl font-extrabold hover:text-[var(--cos-primary)] cursor-pointer" onClick={() => setExpandedArticle(expandedArticle === art.id ? null : art.id)}>
                    {art.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[var(--cos-on-surface-variant)] font-medium">
                    {art.summary}
                  </p>

                  <AnimatePresence>
                    {expandedArticle === art.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-[var(--cos-outline-variant)] text-sm leading-6 text-[var(--cos-on-surface)] bg-blue-500/5 p-4 rounded-xl"
                      >
                        <p className="font-semibold">{art.fullText}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--cos-outline-variant)] flex items-center justify-between">
                  <button
                    onClick={() => setExpandedArticle(expandedArticle === art.id ? null : art.id)}
                    className="text-xs font-extrabold text-[var(--cos-primary)] hover:underline flex items-center gap-1"
                  >
                    <span>{expandedArticle === art.id ? "Close Full Research Analysis" : "Read Complete Analysis"}</span>
                    <ArrowUpRight size={15} />
                  </button>
                  <span className="text-xs font-semibold text-slate-500">Verified Citation</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Bar */}
      <section className="py-20 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white">
        <div className={cn(container, "max-w-3xl mx-auto text-center")}>
          <div className="p-10 rounded-3xl border border-blue-500/40 bg-slate-900/80 backdrop-blur shadow-2xl">
            <Bell className="mx-auto h-10 w-10 text-blue-400 mb-4 animate-bounce" />
            <h2 className="text-3xl font-extrabold">Receive the Daily Jobs View Executive Digest</h2>
            <p className="mt-3 text-sm text-slate-300 max-w-lg mx-auto leading-6">
              Join 1,85,000+ Indian recruiting directors, engineering leaders, and career strategists receiving our verified morning intelligence brief at 8:00 AM IST.
            </p>

            {subscribed ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-extrabold flex items-center justify-center gap-2">
                <CheckCircle2 size={20} />
                <span>Successfully Subscribed! Your first daily executive digest arrives tomorrow morning.</span>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your corporate or professional email..."
                  className="rounded-xl px-5 py-3.5 bg-slate-800 border border-slate-700 font-bold text-white outline-none focus:border-blue-400 sm:w-80"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 font-extrabold shadow-lg transition hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Zap size={17} className="fill-current" />
                  <span>Subscribe Instantly</span>
                </button>
              </form>
            )}
            <p className="mt-4 text-[11px] text-slate-400">No marketing spam or third-party tracking. Unsubscribe in one click anytime.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
