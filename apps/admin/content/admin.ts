export const admin = {
  platform: {
    name: "Jobs View",
    environment: "Production",
    region: "India",
    operator: "Super Admin",
    uptime: "99.98%",
    risk: "Normal",
    release: "2026.07"
  },
  widgets: [
    { label: "Total Users", value: "4.82M", change: "+12.4%", detail: "Across candidate, employer and admin roles", tone: "info" },
    { label: "Active Users", value: "812K", change: "+8.1%", detail: "30-day active accounts", tone: "success" },
    { label: "New Users Today", value: "18,420", change: "+2.8%", detail: "Candidate-led growth", tone: "success" },
    { label: "Companies", value: "72,140", change: "+5.3%", detail: "8,420 verified", tone: "info" },
    { label: "Active Jobs", value: "186K", change: "+9.7%", detail: "31K boosted listings", tone: "success" },
    { label: "Applications", value: "3.4M", change: "+14.2%", detail: "This month", tone: "success" },
    { label: "Interviews", value: "92,800", change: "+6.6%", detail: "Scheduled and completed", tone: "info" },
    { label: "Hires", value: "18,950", change: "+4.9%", detail: "Confirmed in platform", tone: "success" },
    { label: "Revenue", value: "INR 8.4Cr", change: "+11.6%", detail: "MRR plus services", tone: "success" },
    { label: "Active Plans", value: "24,310", change: "+7.4%", detail: "Starter, Growth and Enterprise", tone: "info" },
    { label: "Support Tickets", value: "214", change: "-18.2%", detail: "42 high priority", tone: "warning" },
    { label: "System Health", value: "Healthy", change: "All green", detail: "API, database, Redis and queues", tone: "success" }
  ],
  charts: {
    userGrowth: [
      { name: "Jan", users: 210, jobs: 80, revenue: 42 },
      { name: "Feb", users: 260, jobs: 96, revenue: 49 },
      { name: "Mar", users: 340, jobs: 120, revenue: 58 },
      { name: "Apr", users: 410, jobs: 148, revenue: 63 },
      { name: "May", users: 520, jobs: 186, revenue: 76 },
      { name: "Jun", users: 640, jobs: 230, revenue: 84 }
    ],
    funnel: [
      { name: "Views", value: 980 },
      { name: "Applies", value: 520 },
      { name: "Screened", value: 260 },
      { name: "Interview", value: 112 },
      { name: "Offer", value: 46 },
      { name: "Hire", value: 24 }
    ],
    traffic: [
      { name: "Organic", value: 52 },
      { name: "Direct", value: 19 },
      { name: "Social", value: 11 },
      { name: "Referral", value: 10 },
      { name: "Paid", value: 8 }
    ]
  },
  quickActions: ["Create Admin", "Approve Company", "Approve Jobs", "Publish CMS", "Emergency Broadcast"],
  users: [
    { name: "Riya Sharma", role: "JOB_SEEKER", status: "Active", city: "Bengaluru", sessions: 4, lastLogin: "12 minutes ago", device: "Chrome on Android" },
    { name: "Priya Nair", role: "EMPLOYER", status: "Active", city: "Mumbai", sessions: 2, lastLogin: "28 minutes ago", device: "Safari on macOS" },
    { name: "Aman Gupta", role: "SUPER_ADMIN", status: "Protected", city: "Delhi", sessions: 1, lastLogin: "1 hour ago", device: "Edge on Windows" },
    { name: "Imran Khan", role: "JOB_SEEKER", status: "Suspended", city: "Hyderabad", sessions: 0, lastLogin: "4 days ago", device: "Firefox on Windows" }
  ],
  companies: [
    { name: "Aarunya Cloud", status: "Verified", gst: "Valid", cin: "Valid", domain: "Matched", jobs: 18, recruiters: 14, city: "Bengaluru" },
    { name: "Northstar Fintech", status: "Pending", gst: "Review", cin: "Valid", domain: "Pending", jobs: 9, recruiters: 6, city: "Mumbai" },
    { name: "Kaveri Health", status: "Manual Review", gst: "Valid", cin: "Mismatch", domain: "Matched", jobs: 12, recruiters: 8, city: "Chennai" },
    { name: "UrbanGrid Labs", status: "Suspended", gst: "Flagged", cin: "Flagged", domain: "Blocked", jobs: 0, recruiters: 2, city: "Pune" }
  ],
  jobs: [
    { title: "Senior Frontend Engineer", company: "Aarunya Cloud", status: "Review", seo: 94, google: "Ready", duplicate: "Low", spam: "Clean" },
    { title: "Growth Marketing Lead", company: "Northstar Fintech", status: "Pending", seo: 82, google: "Needs salary", duplicate: "Medium", spam: "Clean" },
    { title: "Remote Data Entry Executive", company: "UrbanGrid Labs", status: "Flagged", seo: 41, google: "Blocked", duplicate: "High", spam: "Suspicious" },
    { title: "Clinical Operations Manager", company: "Kaveri Health", status: "Approved", seo: 88, google: "Ready", duplicate: "Low", spam: "Clean" }
  ],
  recruitment: [
    { metric: "Applications", value: "3.4M", detail: "This month" },
    { metric: "Interviews", value: "92.8K", detail: "28% from shortlist" },
    { metric: "Offers", value: "24.6K", detail: "72% accepted" },
    { metric: "Time To Hire", value: "21.4 days", detail: "Enterprise median" },
    { metric: "Withdrawals", value: "8.2%", detail: "Down 1.1%" },
    { metric: "Rejected", value: "1.9M", detail: "Policy compliant" }
  ],
  billing: [
    { plan: "Free", accounts: "48,920", mrr: "INR 0", usage: "Starter funnel" },
    { plan: "Starter", accounts: "14,260", mrr: "INR 1.8Cr", usage: "72%" },
    { plan: "Growth", accounts: "8,420", mrr: "INR 4.1Cr", usage: "64%" },
    { plan: "Enterprise", accounts: "1,630", mrr: "INR 2.5Cr", usage: "81%" }
  ],
  cms: [
    { area: "Homepage", status: "Published", owner: "Content Ops", updated: "Today" },
    { area: "Career Guides", status: "Draft", owner: "Editorial", updated: "Yesterday" },
    { area: "Announcements", status: "Scheduled", owner: "Marketing", updated: "Jul 4" },
    { area: "Footer", status: "Published", owner: "SEO", updated: "Jul 2" }
  ],
  seo: [
    { asset: "Metadata Templates", status: "Healthy", coverage: "98%" },
    { asset: "Sitemaps", status: "Generated", coverage: "3.8M URLs" },
    { asset: "Google Jobs", status: "Ready", coverage: "186K jobs" },
    { asset: "LLM Templates", status: "Draft", coverage: "AEO/GEO ready" },
    { asset: "Redirects", status: "Clean", coverage: "12 active rules" }
  ],
  reports: [
    { name: "User Growth Report", format: "CSV / Excel / PDF", schedule: "Weekly" },
    { name: "Company Verification Report", format: "CSV / Excel", schedule: "Daily" },
    { name: "Revenue Report", format: "Excel / PDF", schedule: "Monthly" },
    { name: "SEO Coverage Report", format: "CSV / PDF", schedule: "Weekly" }
  ],
  support: [
    { ticket: "Billing invoice mismatch", priority: "High", owner: "Finance Ops", status: "Open" },
    { ticket: "Company verification delay", priority: "Medium", owner: "Trust Team", status: "In progress" },
    { ticket: "Job rejected appeal", priority: "High", owner: "Moderation", status: "Waiting" },
    { ticket: "Feature request: bulk import", priority: "Low", owner: "Product", status: "Triaged" }
  ],
  audit: [
    { event: "Admin role assigned", actor: "Aman Gupta", area: "Permissions", time: "9 minutes ago" },
    { event: "Company approved", actor: "Trust Team", area: "Verification", time: "22 minutes ago" },
    { event: "Data export requested", actor: "Finance Ops", area: "Reports", time: "1 hour ago" },
    { event: "Failed login blocked", actor: "Security Engine", area: "Security", time: "2 hours ago" }
  ],
  settings: [
    { name: "Branding", value: "Jobs View India", status: "Active" },
    { name: "Feature Flags", value: "18 enabled", status: "Controlled rollout" },
    { name: "Storage", value: "Cloudflare R2", status: "Healthy" },
    { name: "Mail", value: "Transactional enabled", status: "Healthy" },
    { name: "SMS", value: "OTP and alerts", status: "Healthy" },
    { name: "Maintenance Mode", value: "Off", status: "Ready" }
  ],
  monitoring: [
    { service: "API Health", value: "99.99%", status: "Operational", detail: "p95 142ms" },
    { service: "Database", value: "38%", status: "Operational", detail: "Pool utilization" },
    { service: "Redis", value: "22%", status: "Operational", detail: "Cache hit 91%" },
    { service: "Queue", value: "812", status: "Operational", detail: "Jobs pending" },
    { service: "Storage", value: "64%", status: "Operational", detail: "R2 bucket usage" },
    { service: "CPU", value: "41%", status: "Normal", detail: "Cluster average" },
    { service: "Memory", value: "58%", status: "Normal", detail: "Cluster average" },
    { service: "Disk", value: "46%", status: "Normal", detail: "Primary volume" }
  ],
  topLists: {
    cities: ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune"],
    skills: ["React", "Java", "Sales", "Python", "Digital Marketing"],
    companies: ["Aarunya Cloud", "Northstar Fintech", "Kaveri Health", "BrightHire", "Stacklane"]
  }
};
