"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Calculator, CheckCircle2, Lock, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Badge, Button, Card } from "@career-os/ui";
import { cn } from "@career-os/utils";
import { Footer, Navbar } from "../../components/public-home";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export function SellPurchasingClient() {
  // Valuation estimator state
  const [assetType, setAssetType] = useState("agency");
  const [revenue, setRevenue] = useState(250); // in lakhs INR
  const [profitMargin, setProfitMargin] = useState(20); // percentage

  // Lead form state
  const [formMode, setFormMode] = useState<"sell" | "buy">("sell");
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Calculate dynamic estimated multiple & value
  const multiple = assetType === "software" ? 4.5 : assetType === "agency" ? 1.8 : 2.2;
  const estimatedValuationLakhs = Math.round(revenue * multiple * (1 + profitMargin / 100));
  const formattedValuation = estimatedValuationLakhs >= 100 
    ? `₹${(estimatedValuationLakhs / 100).toFixed(2)} Cr` 
    : `₹${estimatedValuationLakhs} Lakhs`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const assetCategories = [
    {
      title: "Recruitment & Staffing Agencies",
      badge: "Highest Liquidity",
      desc: "Turn-key staffing firms with active corporate master service agreements (MSAs), verified recruiters, and ongoing contractor billing streams.",
      multiple: "1.5x - 2.8x Annual Revenue",
      tone: "verified" as const
    },
    {
      title: "HR Tech Software & Proprietary IP",
      badge: "Premium Multiples",
      desc: "SaaS job applicant tracking tools, candidate testing platforms, AI resume screening algorithms, and mobile employment apps.",
      multiple: "3.5x - 6.0x ARR",
      tone: "premium" as const
    },
    {
      title: "Verified Candidate Database Assets",
      badge: "Immediate Transition",
      desc: "Niche pre-assessed talent pools (e.g., tier 1 cybersecurity engineers, healthcare specialists, offshore maritime crew) with verified GDPR/DPDP consent.",
      multiple: "₹180 - ₹450 per Verified Record",
      tone: "info" as const
    },
    {
      title: "Corporate Client MSA Portfolios",
      badge: "Strategic Expansion",
      desc: "Standalone placement supplier contracts and vendor empanelment credentials for enterprise IT service giants and PSU tenders.",
      multiple: "2.0x Annual Net Gross Margin",
      tone: "urgent" as const
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--cos-outline-variant)] py-20 bg-gradient-to-b from-slate-950 via-emerald-950/80 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400 via-teal-600 to-transparent pointer-events-none" />
        <div className={cn(container, "relative z-10 grid gap-12 lg:grid-cols-2 items-center")}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-career-md">
              <ShieldCheck size={14} className="text-emerald-400 fill-current" /> Zero-Trust Confidential M&amp;A Exchange
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-white leading-tight">
              Sell or Acquire <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">Recruitment Assets</span> &amp; Businesses
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-8">
              India's specialized commercial marketplace for recruitment firms, HR software IP, client billing portfolios, and verified databases. Supported by rigorous legal due diligence and zero-leak anonymity escrow.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#inquiry-form"
                onClick={() => setFormMode("sell")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-extrabold text-slate-950 shadow-lg hover:bg-emerald-400 transition-all hover:scale-105"
              >
                <span>List an Asset for Sale</span>
                <ArrowRight size={18} />
              </a>
              <a
                href="#inquiry-form"
                onClick={() => setFormMode("buy")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-950/40 px-6 py-3.5 text-base font-extrabold text-emerald-300 shadow-md hover:bg-emerald-900/60 transition-all"
              >
                <span>Register as Verified Buyer</span>
              </a>
            </div>
          </motion.div>

          {/* Interactive Widget: Valuation Estimator */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="p-7 rounded-2xl border border-emerald-500/40 bg-slate-900/90 backdrop-blur-xl text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5 font-extrabold text-lg text-emerald-400">
                  <Calculator size={22} />
                  <span>Instant Asset Valuation Estimator</span>
                </div>
                <Badge tone="verified">Live Market Model</Badge>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Asset Category</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 font-bold text-white outline-none focus:border-emerald-500 transition"
                  >
                    <option value="agency">Turn-key Staffing Agency (Active MSAs)</option>
                    <option value="software">HR Tech SaaS / Proprietary Software IP</option>
                    <option value="portfolio">Client Contractor MSA Portfolio Only</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    <span>Annual Turnover / ARR</span>
                    <span className="text-emerald-400 text-sm font-extrabold">₹{revenue} Lakhs ({revenue >= 100 ? `${(revenue/100).toFixed(1)} Cr` : `${revenue} L`})</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={2000}
                    step={10}
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mt-1">
                    <span>₹20L</span>
                    <span>₹500L</span>
                    <span>₹2000L (₹20Cr)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    <span>Estimated Net EBITDA / Profit Margin</span>
                    <span className="text-emerald-400 text-sm font-extrabold">{profitMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={5}
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="mt-6 rounded-xl bg-gradient-to-r from-emerald-950 to-teal-950 p-5 border border-emerald-500/30 text-center">
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">Estimated Marketplace Valuation</div>
                  <div className="mt-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                    {formattedValuation}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Based on typical recent commercial closures at {multiple}x industry revenue multiples with +{profitMargin}% margin efficiency premiums.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Asset Categories Deck */}
      <section className="py-20 bg-[var(--cos-surface)]">
        <div className={cn(container)}>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold">Commercial Assets Exchanged Daily</h2>
            <p className="mt-3 text-base text-[var(--cos-on-surface-variant)]">
              Whether you are divesting non-core operations or embarking on strategic roll-up acquisitions, our curated exchange ensures standardized valuation &amp; seamless transitions.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {assetCategories.map((cat, i) => (
              <Card key={cat.title} className="p-7 rounded-2xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <Zap size={18} className="fill-current" /> {cat.multiple}
                    </span>
                    <Badge tone={cat.tone}>{cat.badge}</Badge>
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold">{cat.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--cos-on-surface-variant)]">{cat.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--cos-outline-variant)] flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Lock size={14} /> Confidential &amp; Anonymized Listing
                  </span>
                  <a href="#inquiry-form" className="font-extrabold text-sm text-[var(--cos-primary)] hover:underline flex items-center gap-1">
                    Inquire Now <ArrowRight size={15} />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Zero-Trust Escrow Feature Highlight */}
      <section className="py-16 bg-[var(--cos-surface-container-low)] border-y border-[var(--cos-outline-variant)]">
        <div className={cn(container, "grid gap-10 md:grid-cols-3 items-center")}>
          <div className="md:col-span-1">
            <Badge tone="verified">Rigorous Protection</Badge>
            <h2 className="mt-4 text-3xl font-extrabold">How We Protect Your Agency Brand During M&amp;A</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--cos-on-surface-variant)]">
              Premature leakage of a pending agency sale can cause recruiter attrition and client anxiety. Our zero-trust workflow ensures complete secrecy until formal NDAs and financial qualification are verified.
            </p>
          </div>
          <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
            <div className="p-6 rounded-xl bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)] shadow-sm">
              <Lock className="h-7 w-7 text-emerald-500 mb-3" />
              <h3 className="text-lg font-extrabold">Anonymous Blind Teasers</h3>
              <p className="mt-2 text-xs text-[var(--cos-on-surface-variant)] leading-5">
                Listings never disclose your company name or explicit client identities. We distribute standardized blind financial summaries to vetted purchasers only.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--cos-surface-container-lowest)] border border-[var(--cos-outline-variant)] shadow-sm">
              <ShieldCheck className="h-7 w-7 text-emerald-500 mb-3" />
              <h3 className="text-lg font-extrabold">Vetted Buyer KYC &amp; Proof of Funds</h3>
              <p className="mt-2 text-xs text-[var(--cos-on-surface-variant)] leading-5">
                Before any NDA or detailed prospectus is opened, potential buyers must pass rigorous financial capacity checks and organizational KYC verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Inquiry & Lead Capture Form */}
      <section id="inquiry-form" className="py-20 bg-[var(--cos-surface)]">
        <div className={cn(container, "max-w-3xl mx-auto")}>
          <Card className="p-8 sm:p-10 rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-[var(--cos-surface-container-lowest)] to-[var(--cos-surface)] shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold">Initiate Confidential Engagement</h2>
              <p className="mt-2 text-sm text-[var(--cos-on-surface-variant)]">
                Connect directly with our corporate M&amp;A transaction advisors. All discussions are covered by mutual legal non-disclosure.
              </p>

              {/* Toggle Buttons */}
              <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-[var(--cos-surface-container-low)] border border-[var(--cos-outline-variant)]">
                <button
                  type="button"
                  onClick={() => { setFormMode("sell"); setSubmitted(false); }}
                  className={cn(
                    "px-6 py-2.5 rounded-xl font-extrabold text-sm transition",
                    formMode === "sell"
                      ? "bg-emerald-600 text-white shadow-md scale-[1.02]"
                      : "text-[var(--cos-on-surface-variant)] hover:text-[var(--cos-on-surface)]"
                  )}
                >
                  I Want to Sell an Asset / Agency
                </button>
                <button
                  type="button"
                  onClick={() => { setFormMode("buy"); setSubmitted(false); }}
                  className={cn(
                    "px-6 py-2.5 rounded-xl font-extrabold text-sm transition",
                    formMode === "buy"
                      ? "bg-emerald-600 text-white shadow-md scale-[1.02]"
                      : "text-[var(--cos-on-surface-variant)] hover:text-[var(--cos-on-surface)]"
                  )}
                >
                  I Want to Acquire Businesses
                </button>
              </div>
            </div>

            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
                <h3 className="text-2xl font-extrabold">Confidential Mandate Received</h3>
                <p className="mt-2 text-sm text-[var(--cos-on-surface-variant)] max-w-md mx-auto leading-6">
                  Thank you, <strong>{name}</strong> from <strong>{company}</strong>. A Senior Commercial Advisor from our asset exchange team will reach out to you via secure phone/email within 12 hours with an executed NDA.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6 font-bold">
                  Submit Another Inquiry
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider">Full Name *</span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider">Organization / Agency *</span>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. TalentFirst Staffing"
                      className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-emerald-500"
                    />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider">Direct Phone / WhatsApp *</span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider">Target Asset Category *</span>
                    <select className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-emerald-500">
                      <option>Turn-Key Staffing Agency Operations</option>
                      <option>HR Tech SaaS &amp; Software Licenses</option>
                      <option>Corporate MSA Client Portfolio</option>
                      <option>Verified Candidate Database Access</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider">Confidential Notes / Specific Requirements</span>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={formMode === "sell" ? "Describe your approximate annual revenue, active contracts count, or specific asset details..." : "Describe your acquisition budget, target geographies in India, or industry sector preferences..."}
                    className="mt-1 w-full rounded-xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface)] p-3 font-semibold outline-none focus:border-emerald-500"
                  />
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 px-6 py-4 text-base font-extrabold text-white shadow-lg hover:bg-emerald-500 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                  >
                    <Lock size={18} />
                    <span>{formMode === "sell" ? "Submit Asset for Confidential Valuation" : "Register Acquisition Interest"}</span>
                  </button>
                  <p className="mt-3 text-center text-xs text-[var(--cos-on-surface-variant)]">
                    By clicking submit, you confirm your engagement in strict confidentiality under Jobs View Commercial terms.
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
