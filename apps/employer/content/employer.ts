export const employer = {
  company: {
    name: "Aarunya Cloud",
    tagline: "Enterprise SaaS for modern operations",
    website: "aarunyacloud.example",
    industry: "Enterprise SaaS",
    headquarters: "Bengaluru, India",
    status: "Verified",
    plan: "Growth",
    usage: 72,
    about: "Aarunya Cloud builds secure workflow software for teams across India and Southeast Asia.",
    mission: "Make enterprise operations simpler, faster and more measurable.",
    vision: "A trusted operating layer for every growing business.",
    culture: ["Ownership", "Product craft", "Customer empathy", "Remote-friendly"],
    branches: ["Bengaluru HQ", "Hyderabad Engineering", "Gurugram Sales"],
    departments: ["Engineering", "Product", "Sales", "Marketing", "Finance", "HR"],
    benefits: ["Health insurance", "Learning budget", "Hybrid work", "Parental leave"],
    documents: ["GST certificate", "CIN certificate", "Domain verification"],
    gallery: ["Office", "Team event", "Product sprint", "Leadership meetup"]
  },
  widgets: [
    { label: "Active Jobs", value: "18", detail: "4 featured" },
    { label: "Draft Jobs", value: "6", detail: "2 need review" },
    { label: "Applications Today", value: "43", detail: "+18% vs yesterday" },
    { label: "Total Applications", value: "2,840", detail: "Across 31 jobs" },
    { label: "Interviews Scheduled", value: "27", detail: "9 this week" },
    { label: "Offers Sent", value: "11", detail: "4 pending" },
    { label: "Hires", value: "38", detail: "This quarter" },
    { label: "Team Members", value: "14", detail: "6 recruiters" },
    { label: "Subscription Usage", value: "72%", detail: "Growth plan" },
    { label: "Notifications", value: "19", detail: "5 urgent" }
  ],
  charts: {
    applicationsTrend: [
      { name: "Mon", value: 40 },
      { name: "Tue", value: 58 },
      { name: "Wed", value: 76 },
      { name: "Thu", value: 64 },
      { name: "Fri", value: 92 }
    ],
    funnel: [
      { stage: "Applied", count: 840 },
      { stage: "Screening", count: 420 },
      { stage: "Shortlisted", count: 210 },
      { stage: "Interview", count: 96 },
      { stage: "Offer", count: 22 },
      { stage: "Hired", count: 12 }
    ],
    sources: ["LinkedIn", "Jobs View", "Referrals", "Naukri", "Campus"]
  },
  jobs: [
    { title: "Senior Frontend Engineer", status: "Published", applications: 284, views: 7200, type: "Full Time", location: "Bengaluru", seo: 92 },
    { title: "Product Manager", status: "Draft", applications: 0, views: 0, type: "Full Time", location: "Remote India", seo: 68 },
    { title: "Sales Development Representative", status: "Paused", applications: 142, views: 3900, type: "Full Time", location: "Gurugram", seo: 81 },
    { title: "Data Analyst Intern", status: "Published", applications: 520, views: 11800, type: "Internship", location: "Hyderabad", seo: 88 }
  ],
  pipeline: [
    { stage: "Applied", candidates: ["Riya Sharma", "Dev Patel", "Imran Khan"] },
    { stage: "Screening", candidates: ["Ananya Rao", "Kabir Sethi"] },
    { stage: "Shortlisted", candidates: ["Nisha Iyer", "Mehul Shah"] },
    { stage: "Assessment", candidates: ["Pooja Nair"] },
    { stage: "Interview", candidates: ["Aarav Menon", "Tara Singh"] },
    { stage: "Offer", candidates: ["Vikram Joshi"] },
    { stage: "Hired", candidates: ["Sana Ali"] },
    { stage: "Rejected", candidates: ["Archived profiles"] }
  ],
  candidateProfile: {
    name: "Aarav Menon",
    role: "Senior Frontend Engineer",
    atsScore: 88,
    rating: 4.6,
    skills: ["React", "TypeScript", "Design Systems", "Accessibility"],
    experience: ["Senior Frontend Engineer at FinOps", "Frontend Engineer at SaaSWorks"],
    education: ["B.Tech Computer Science"],
    projects: ["Design system migration", "Hiring analytics dashboard"],
    notes: ["Strong architecture depth", "Needs compensation alignment"],
    tags: ["High intent", "Remote-friendly", "Notice 30 days"],
    interviews: ["Technical Round", "System Design", "Leadership"]
  },
  interviews: [
    { candidate: "Aarav Menon", role: "Senior Frontend Engineer", round: "System Design", date: "2026-07-08", mode: "Google Meet ready", interviewer: "Priya N." },
    { candidate: "Tara Singh", role: "Product Manager", round: "Case Study", date: "2026-07-10", mode: "Zoom ready", interviewer: "Rohan M." },
    { candidate: "Vikram Joshi", role: "Data Analyst", round: "Offer Discussion", date: "2026-07-12", mode: "Teams ready", interviewer: "Neha K." }
  ],
  team: [
    { name: "Priya Nair", role: "Owner", permission: "All access", activity: "Approved job" },
    { name: "Rohan Mehta", role: "Recruiter", permission: "Pipeline", activity: "Moved candidate" },
    { name: "Neha Kapoor", role: "HR", permission: "Interviews", activity: "Scheduled interview" },
    { name: "Ishaan Roy", role: "Finance", permission: "Billing", activity: "Downloaded invoice" }
  ],
  analytics: [
    { title: "Time To Hire", value: "24 days", detail: "6 days faster than last quarter" },
    { title: "Application Conversion", value: "12.8%", detail: "From view to application" },
    { title: "Recruiter Performance", value: "91%", detail: "SLA adherence" },
    { title: "Top Skills", value: "React, SQL, Sales", detail: "Most common matches" }
  ],
  billing: {
    plan: "Growth",
    renewal: "2026-08-01",
    invoices: [
      { id: "INV-2026-071", amount: "₹9,999", status: "Paid" },
      { id: "INV-2026-070", amount: "₹9,999", status: "Paid" },
      { id: "INV-2026-069", amount: "₹9,999", status: "Paid" }
    ],
    payments: ["UPI Autopay", "GST invoice enabled", "Coupon FUTURE10 ready"]
  },
  notifications: [
    { channel: "Email", status: "Enabled", detail: "Recruitment and verification alerts" },
    { channel: "SMS", status: "Enabled", detail: "Interview reminders" },
    { channel: "Push", status: "Enabled", detail: "Application spikes" },
    { channel: "In-App", status: "Enabled", detail: "Subscription and team updates" }
  ],
  settings: [
    { title: "Brand", detail: "Logo, banner, colors, public page" },
    { title: "Security", detail: "Password, sessions, 2FA placeholder" },
    { title: "Notification Preferences", detail: "Email, SMS, push, in-app" },
    { title: "API Keys", detail: "Future integration ready" },
    { title: "Webhooks", detail: "Future automation ready" }
  ],
  help: [
    { title: "Support Tickets", detail: "Track open and resolved tickets" },
    { title: "Documentation", detail: "Employer portal guide" },
    { title: "Knowledge Base", detail: "Hiring workflow articles" },
    { title: "Release Notes", detail: "Latest product changes" },
    { title: "Contact Support", detail: "Priority support for Growth plan" }
  ]
} as const;
