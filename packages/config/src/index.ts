export const appConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "https://jobs-view-api-edge.career-os-cloudflare-edge.workers.dev/api/v1",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  employerUrl: process.env.NEXT_PUBLIC_EMPLOYER_URL ?? "http://localhost:3002",
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
  brand: {
    name: "Jobs View",
    tagline: "YOUR CAREER. OUR MISSION.",
    primaryBlue: "#0A3A7A",
    primaryBlueHover: "#082E61",
    primaryOrange: "#F59E0B",
    primaryOrangeHover: "#D97706"
  },
  developmentAccounts: {
    admin: {
      email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "admin.one@jobsview.local",
      password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? "Admin@One2026!"
    },
    employer: {
      email: process.env.NEXT_PUBLIC_DEMO_EMPLOYER_EMAIL ?? "employer@jobsview.local",
      password: process.env.NEXT_PUBLIC_DEMO_EMPLOYER_PASSWORD ?? "Employer@123"
    },
    candidate: {
      email: process.env.NEXT_PUBLIC_DEMO_CANDIDATE_EMAIL ?? "candidate@jobsview.local",
      password: process.env.NEXT_PUBLIC_DEMO_CANDIDATE_PASSWORD ?? "Candidate@123"
    }
  },
  hardcodedAdmins: [
    { email: "admin.one@jobsview.local", password: "Admin@One2026!" },
    { email: "admin.two@jobsview.local", password: "Admin@Two2026!" },
    { email: "admin.three@jobsview.local", password: "Admin@Three2026!" }
  ],
  uploadMaxBytes: Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_BYTES ?? 10_485_760),
  analytics: {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
    clarityId: process.env.NEXT_PUBLIC_CLARITY_ID ?? ""
  },
  monitoring: {
    endpoint: process.env.NEXT_PUBLIC_MONITORING_ENDPOINT ?? "",
    sampleRate: Number(process.env.NEXT_PUBLIC_MONITORING_SAMPLE_RATE ?? 1),
    release: process.env.NEXT_PUBLIC_RELEASE ?? "local",
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development"
  },
  reliability: {
    sessionWarningMs: Number(process.env.NEXT_PUBLIC_SESSION_WARNING_MS ?? 55 * 60 * 1000),
    queryStaleMs: Number(process.env.NEXT_PUBLIC_QUERY_STALE_MS ?? 60_000),
    queryGcMs: Number(process.env.NEXT_PUBLIC_QUERY_GC_MS ?? 10 * 60_000)
  }
};

export const navigation = {
  public: [
    { label: "Jobs", href: "/jobs" },
    { label: "Companies", href: "/companies" },
    { label: "Resources", href: "/resources" }
  ],
  candidate: [
    { label: "Dashboard", href: "/candidate" },
    { label: "Find Jobs", href: "/candidate/jobs/recommended" },
    { label: "Profile", href: "/candidate/profile" },
    { label: "Resume", href: "/candidate/resume" },
    { label: "Applications", href: "/candidate/jobs/applied" },
    { label: "Saved Jobs", href: "/candidate/jobs/saved" },
    { label: "Recently Viewed", href: "/candidate/jobs/history" },
    { label: "Messages", href: "/candidate/messages" },
    { label: "Career Intelligence", href: "/candidate/career-intelligence" },
    { label: "Career Health", href: "/candidate/career-health" },
    { label: "Salary", href: "/candidate/salary" },
    { label: "Guidance", href: "/candidate/guidance" },
    { label: "Interviews", href: "/candidate/interviews" },
    { label: "Offers", href: "/candidate/offers" },
    { label: "Notifications", href: "/candidate/notifications" },
    { label: "Settings", href: "/candidate/settings" }
  ],
  employer: [
    { label: "Dashboard", href: "/employer" },
    { label: "Company", href: "/employer/company" },
    { label: "Jobs", href: "/employer/jobs" },
    { label: "Pipeline", href: "/employer/pipeline" },
    { label: "Candidates", href: "/employer/candidates" },
    { label: "Interviews", href: "/employer/interviews" },
    { label: "Team", href: "/employer/team" },
    { label: "Analytics", href: "/employer/analytics" },
    { label: "Billing", href: "/employer/billing" },
    { label: "Notifications", href: "/employer/notifications" },
    { label: "Settings", href: "/employer/settings" },
    { label: "Help", href: "/employer/help" }
  ],
  admin: [
    { label: "Dashboard", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Candidates", href: "/admin/candidates" },
    { label: "Employers", href: "/admin/employers" },
    { label: "Companies", href: "/admin/companies" },
    { label: "Jobs", href: "/admin/jobs" },
    { label: "Recruitment", href: "/admin/recruitment" },
    { label: "Billing", href: "/admin/billing" },
    { label: "Subscriptions", href: "/admin/subscriptions" },
    { label: "Marketplace", href: "/admin/marketplace" },
    { label: "CMS", href: "/admin/cms" },
    { label: "Advertisements", href: "/admin/advertisements" },
    { label: "SEO", href: "/admin/seo" },
    { label: "Reports", href: "/admin/reports" },
    { label: "Support", href: "/admin/support" },
    { label: "Audit", href: "/admin/audit" },
    { label: "Monitoring", href: "/admin/monitoring" },
    { label: "Settings", href: "/admin/settings" }
  ]
};
