import { appConfig } from "@career-os/config";

export type PublicRoute = { label: string; href: string; description?: string };
const employerLogin = `${appConfig.employerUrl.replace(/\/$/, "")}/employer/login`;

export const publicRoutes = {
  primary: [
    { label: "Jobs", href: "/jobs" },
    { label: "Companies", href: "/companies" },
    { label: "Pricing", href: "/plans" },
    { label: "Salary", href: "/salary/calculator" }
  ],
  explore: [
    { label: "10th pass jobs", href: "/jobs?q=10th+pass" },
    { label: "12th pass jobs", href: "/jobs?q=12th+pass" },
    { label: "ITI jobs", href: "/jobs?q=ITI" },
    { label: "Fresher jobs", href: "/jobs?q=fresher" },
    { label: "Remote jobs", href: "/jobs?mode=remote" },
    { label: "Career guides", href: "/career-guides" }
  ],
  tools: [
    { label: "Resume Builder", href: "/resume-builder" },
    { label: "Salary Calculator", href: "/salary/calculator" },
    { label: "Career Guidance", href: "/guidance" },
    { label: "Interview Preparation", href: "/interview-hub" },
    { label: "Learning Center", href: "/learning-center" }
  ],
  support: [
    { label: "Help", href: "/help" }, { label: "Contact", href: "/contact" },
    { label: "Feedback", href: "/feedback" }, { label: "Report an issue", href: "/report-issue" }
  ],
  legal: [
    { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" }, { label: "Accessibility", href: "/accessibility" }
  ],
  ourServices: [
    { label: "Our Services Hub", href: "/our-services", description: "Explore our full suite of commercial recruitment services and solutions." },
    { label: "Sell / Purchasing & Assets", href: "/our-services/sell-purchasing", description: "Marketplace for recruitment agencies, HR software licenses, and asset exchange." },
    { label: "Latest Jobs News", href: "/our-services/latest-jobs-news", description: "Real-time employment market intelligence, salary shifts, and corporate hiring momentum." },
    { label: "Seminars & Training Programs", href: "/our-services/seminars-training", description: "Executive recruiting workshops, AI candidate bootcamps, and workforce certifications." },
    { label: "Digital Marketing & Branding", href: "/our-services/digital-marketing", description: "Targeted social media talent funnels, employer branding, and growth marketing." }
  ],
  employer: { label: "For employers", href: employerLogin }
} satisfies Record<string, PublicRoute[] | PublicRoute>;

export const allNavbarRoutes = [...publicRoutes.primary, ...publicRoutes.ourServices, ...publicRoutes.explore, ...publicRoutes.tools];
