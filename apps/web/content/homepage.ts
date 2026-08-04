export const homepage = {
  seo: {
    title: "Jobs View India | Premium Job Search, Hiring and Career Growth",
    description:
      "Discover premium jobs, verified companies, career services, salary insights and AI-ready search across India with Jobs View.",
    canonicalPath: "/",
    ogImage: "/images/home-hero-india-careers.png"
  },
  nav: {
    logo: "Jobs View",
    megaLabel: "Explore",
    searchPlaceholder: "Search jobs, skills, companies",
    links: [
      { label: "Jobs", href: "/jobs" },
      { label: "Companies", href: "/companies" },
      { label: "Services", href: "/career-services" },
      { label: "Guides", href: "/career-guides" }
    ],
    mega: [
      {
        title: "For Candidates",
        items: ["Remote jobs", "Government jobs", "Walk-in jobs", "Internships", "Salary reports"]
      },
      {
        title: "For Employers",
        items: ["Post a job", "Talent search", "Company branding", "Recruiter dashboard", "Hiring analytics"]
      },
      {
        title: "Popular in India",
        items: ["Bengaluru IT jobs", "Delhi NCR sales jobs", "Hyderabad product jobs", "Mumbai finance jobs"]
      }
    ],
    actions: {
      login: "Login",
      candidate: "Build profile",
      employer: "Post a job"
    }
  },
  hero: {
    eyebrow: "India's premium jobs platform",
    headline: "Find better jobs. Build sharper teams. Move careers forward.",
    subheading:
      "Jobs View brings job discovery, verified employers, career services and hiring intelligence into one premium platform built for India.",
    image: "/images/home-hero-india-careers.png",
    imageAlt: "Indian professionals using a premium digital hiring platform",
    stats: [
      { label: "Curated jobs", value: 128000, suffix: "+" },
      { label: "Verified companies", value: 18500, suffix: "+" },
      { label: "Career profiles", value: 2400000, suffix: "+" },
      { label: "Cities covered", value: 900, suffix: "+" }
    ],
    popularSearches: ["Remote product manager", "Fresher software engineer", "Data analyst", "HR recruiter", "Govt jobs"]
  },
  search: {
    title: "Search across India's opportunity graph",
    aiPlaceholder: "Ask AI to find roles matching your goals",
    voicePlaceholder: "Voice search ready",
    fields: [
      { label: "Keyword", placeholder: "Role, skill, company" },
      { label: "Location", placeholder: "City, state, remote" },
      { label: "Experience", placeholder: "0-2 years" },
      { label: "Salary", placeholder: "₹8L - ₹25L" }
    ],
    toggles: ["Remote", "Hybrid", "Easy apply"]
  },
  trending: {
    title: "Trending now",
    groups: [
      { label: "Jobs", items: ["AI Engineer", "Frontend Developer", "Product Manager", "Business Analyst"] },
      { label: "Skills", items: ["React", "Go", "GenAI", "Cloud", "Salesforce"] },
      { label: "Companies", items: ["Fintech", "SaaS", "Healthtech", "EV", "Edtech"] },
      { label: "Locations", items: ["Bengaluru", "Hyderabad", "Pune", "Gurugram", "Chennai"] },
      { label: "Salaries", items: ["₹6-10 LPA", "₹10-18 LPA", "₹18-35 LPA", "₹35L+"] }
    ]
  },
  companies: {
    title: "Top companies hiring today",
    subtitle: "Verified employers with active hiring momentum.",
    items: [
      { name: "Aarunya Cloud", sector: "Enterprise SaaS", rating: 4.8, openJobs: 128, hiringNow: true },
      { name: "NexaPay", sector: "Fintech", rating: 4.7, openJobs: 84, hiringNow: true },
      { name: "MedNova India", sector: "Healthcare", rating: 4.6, openJobs: 61, hiringNow: true },
      { name: "Vistara Works", sector: "Manufacturing Tech", rating: 4.5, openJobs: 47, hiringNow: false },
      { name: "LearnGrid", sector: "Education", rating: 4.7, openJobs: 93, hiringNow: true }
    ]
  },
  recommendedJobs: {
    title: "Recommended jobs",
    subtitle: "Large-format cards ready for personalization and AI match scoring.",
    filters: ["Best match", "Remote", "High salary", "Freshers", "Urgent"],
    items: [
      {
        title: "Senior Frontend Engineer",
        company: "Aarunya Cloud",
        location: "Bengaluru / Hybrid",
        salary: "₹24L - ₹38L",
        experience: "5-8 yrs",
        tags: ["React", "TypeScript", "Design Systems"],
        match: 92
      },
      {
        title: "Product Marketing Manager",
        company: "NexaPay",
        location: "Mumbai",
        salary: "₹18L - ₹30L",
        experience: "4-7 yrs",
        tags: ["B2B", "Growth", "Fintech"],
        match: 86
      },
      {
        title: "Data Analyst",
        company: "MedNova India",
        location: "Remote India",
        salary: "₹10L - ₹18L",
        experience: "2-4 yrs",
        tags: ["SQL", "Python", "Healthcare"],
        match: 81
      }
    ]
  },
  categories: {
    title: "Browse by category",
    items: [
      "IT",
      "Government",
      "Healthcare",
      "Finance",
      "Marketing",
      "Sales",
      "Engineering",
      "Education",
      "Remote",
      "Internship",
      "Walk-in"
    ]
  },
  services: {
    title: "Career services",
    subtitle: "Premium tools for candidates who want a sharper next move.",
    items: [
      "Resume Builder",
      "Resume Review",
      "Career Guidance",
      "Interview Preparation",
      "Salary Calculator",
      "Future Ready"
    ]
  },
  guides: {
    title: "Career guides and insights",
    items: [
      { title: "2026 India Salary Report", type: "Salary Report", readTime: "9 min" },
      { title: "Roadmap to Product Engineering", type: "Roadmap", readTime: "12 min" },
      { title: "How AI is changing hiring", type: "Industry Insight", readTime: "7 min" },
      { title: "Interview preparation for freshers", type: "Guide", readTime: "6 min" }
    ]
  },
  testimonials: {
    title: "Trusted by candidates and hiring teams",
    stats: [
      { label: "Candidate satisfaction", value: "94%" },
      { label: "Employer response lift", value: "3.2x" },
      { label: "Profile completion lift", value: "58%" }
    ],
    items: [
      {
        quote: "Jobs View made premium roles discoverable without endless filtering.",
        name: "Riya Sharma",
        role: "Product Designer"
      },
      {
        quote: "The verified company layer and hiring workflow are exactly what recruiters need.",
        name: "Arjun Mehta",
        role: "Talent Lead"
      }
    ]
  },
  cta: {
    candidate: {
      title: "Build a profile that works harder for you",
      action: "Start as candidate"
    },
    employer: {
      title: "Hire with a premium employer workspace",
      action: "Start hiring"
    },
    app: {
      title: "Mobile app foundation ready",
      action: "Get notified"
    }
  },
  footer: {
    columns: [
      { title: "Popular Cities", links: ["Bengaluru", "Hyderabad", "Pune", "Mumbai", "Delhi NCR", "Chennai"] },
      { title: "Popular Skills", links: ["React", "Java", "Python", "Go", "Digital Marketing", "Sales"] },
      { title: "Popular Searches", links: ["Remote jobs", "Fresher jobs", "Walk-in jobs", "Govt jobs", "Internships"] },
      { title: "Companies", links: ["Top companies", "Verified employers", "Hiring now", "Company reviews"] },
      { title: "Career", links: ["Career guides", "Salary reports", "Resume review", "Interview prep"] },
      { title: "Support", links: ["Help center", "Contact", "Feedback", "Report issue"] },
      { title: "Legal", links: ["Privacy", "Terms", "Cookie policy", "Accessibility"] }
    ]
  }
} as const;
