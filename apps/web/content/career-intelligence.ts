export const careerIntelligence = {
  profile: {
    name: "Aarav Menon",
    role: "Senior Frontend Engineer",
    focus: "Frontend Platform Leadership",
    city: "Bengaluru",
    aiState: "AI Intelligence Active",
    updated: "Updated today"
  },
  scores: [
    { label: "Career Health Score", value: 84, detail: "Strong trajectory with portfolio gaps", trend: "+6 pts" },
    { label: "Profile Score", value: 86, detail: "Missing salary preference and project outcomes", trend: "+4 pts" },
    { label: "Resume Score", value: 78, detail: "ATS-ready but keyword density can improve", trend: "+3 pts" },
    { label: "Skills Score", value: 82, detail: "React and accessibility are above market", trend: "+7 pts" },
    { label: "Interview Score", value: 74, detail: "System design practice recommended", trend: "+5 pts" },
    { label: "Salary Potential", value: 88, detail: "Likely range INR 28L to INR 42L", trend: "+9 pts" },
    { label: "Learning Progress", value: 61, detail: "Cloud roadmap in progress", trend: "+12 pts" },
    { label: "Application Success Rate", value: 31, detail: "3.1x above platform median", trend: "+2 pts" }
  ],
  healthBreakdown: [
    { name: "Profile", value: 86 },
    { name: "Resume", value: 78 },
    { name: "Skills", value: 82 },
    { name: "Projects", value: 68 },
    { name: "Portfolio", value: 72 },
    { name: "Experience", value: 91 },
    { name: "Education", value: 80 },
    { name: "Certifications", value: 58 },
    { name: "Languages", value: 76 }
  ],
  recommendations: [
    "Add two quantified project outcomes to improve senior role matching.",
    "Include system design keywords in resume summary and experience bullets.",
    "Complete one cloud certification to unlock platform engineering recommendations.",
    "Practice behavioral answers around ownership, conflict and mentoring.",
    "Publish a portfolio case study for the design system migration project."
  ],
  resumeInsights: {
    atsScore: 78,
    formatting: "Clean single-column structure",
    keywords: ["React", "TypeScript", "Design Systems", "Accessibility", "Performance"],
    missingSkills: ["GraphQL", "Cloudflare", "Observability"],
    missingSections: ["Impact summary", "Open-source links", "Leadership examples"],
    strengths: ["Strong frontend depth", "Clear progression", "Good role alignment"],
    weaknesses: ["Few measurable outcomes", "Limited cloud platform signals", "No salary preference"],
    versions: ["v4 Active", "v3 Product roles", "v2 Frontend roles", "v1 Fresher archive"]
  },
  salary: {
    current: "INR 24L",
    market: "INR 31L",
    projection: "INR 42L in 24 months",
    comparisons: [
      { name: "Current", value: 24 },
      { name: "Bengaluru Median", value: 31 },
      { name: "Remote India P75", value: 38 },
      { name: "Leadership Track", value: 42 }
    ],
    drivers: ["React premium +14%", "Accessibility premium +8%", "System design premium +11%", "Cloud gap -6%"]
  },
  skills: {
    trending: ["AI-assisted frontend", "Web performance", "Design systems", "Observability", "Edge deployments"],
    hotTech: ["Next.js", "TypeScript", "React Server Components", "Playwright", "Cloudflare"],
    demand: [
      { name: "React", value: 91 },
      { name: "Next.js", value: 84 },
      { name: "Testing", value: 72 },
      { name: "Cloud", value: 68 },
      { name: "AI UX", value: 63 }
    ],
    gaps: ["Cloud deployment", "GraphQL federation", "Technical leadership narratives"],
    certifications: ["AWS Cloud Practitioner", "Frontend Expert Interview Prep", "Web Performance Fundamentals"]
  },
  roadmaps: [
    "Frontend",
    "Backend",
    "Full Stack",
    "DevOps",
    "AI",
    "Cloud",
    "Cybersecurity",
    "Data Science",
    "UI/UX",
    "Product",
    "Digital Marketing",
    "HR",
    "Finance",
    "Government",
    "Healthcare"
  ].map((name, index) => ({
    name,
    timeline: `${3 + (index % 4)} months`,
    salary: `INR ${18 + index}L - INR ${32 + index}L`,
    skills: ["Learning", "Skills", "Projects", "Interview", "Salary"],
    project: `${name} portfolio project`,
    readiness: 58 + (index % 5) * 8
  })),
  interviews: {
    readiness: 74,
    groups: [
      { title: "Interview Questions", count: 120, detail: "Role and seniority mapped" },
      { title: "Coding Questions", count: 64, detail: "Frontend, DS and UI logic" },
      { title: "HR Questions", count: 42, detail: "Behavioral and culture fit" },
      { title: "Company Questions", count: 38, detail: "Aarunya, NexaPay and MedNova" },
      { title: "Mock Interview Practice", count: 15, detail: "Interactive voice and technical assessments" }
    ]
  },
  learning: [
    { type: "Course", title: "Advanced Frontend Architecture", progress: 68 },
    { type: "Book", title: "Designing Data-Intensive Applications", progress: 34 },
    { type: "Video", title: "Web Performance Masterclass", progress: 82 },
    { type: "Blog", title: "React Server Components in Production", progress: 100 },
    { type: "Community", title: "India Frontend Guild", progress: 46 },
    { type: "Certification", title: "AWS Cloud Practitioner", progress: 52 }
  ],
  analytics: [
    { label: "Applications", value: "42", detail: "+18% this month" },
    { label: "Interviews", value: "7", detail: "3 scheduled" },
    { label: "Offers", value: "2", detail: "1 active negotiation" },
    { label: "Response Rate", value: "48%", detail: "Above market" },
    { label: "Acceptance Rate", value: "33%", detail: "Offer stage" },
    { label: "Skill Growth", value: "+21%", detail: "Quarterly" },
    { label: "Salary Growth", value: "+16%", detail: "Projected" },
    { label: "Profile Views", value: "1,420", detail: "Recruiter discovery" },
    { label: "Recruiter Views", value: "186", detail: "Last 30 days" }
  ],
  recommendationGroups: [
    { title: "Jobs", items: ["Frontend Platform Lead", "Senior Product Engineer", "Design Systems Engineer"] },
    { title: "Companies", items: ["Aarunya Cloud", "NexaPay", "LearnGrid"] },
    { title: "Skills", items: ["Cloud deployments", "GraphQL", "Observability"] },
    { title: "Courses", items: ["System Design", "Web Performance", "AWS Foundations"] },
    { title: "Roadmaps", items: ["Frontend Leadership", "Cloud Frontend", "Full Stack"] },
    { title: "Interview Questions", items: ["Architecture tradeoffs", "Accessibility audits", "Mentoring stories"] },
    { title: "Career Articles", items: ["Frontend salaries in India", "Portfolio case studies", "Career switching guide"] }
  ],
  guides: [
    { title: "Frontend Developer Career Guide", type: "Career Page", status: "CMS ready" },
    { title: "Bengaluru Frontend Salary Guide", type: "Salary Page", status: "SEO ready" },
    { title: "React Interview Questions", type: "Interview Page", status: "Schema ready" },
    { title: "Cloud Skills Roadmap", type: "Roadmap", status: "LLM ready" },
    { title: "Learning Guide for Senior Engineers", type: "Learning Guide", status: "CMS ready" }
  ],
  architectureNotes: [
    "Scores reflect active benchmark analysis and market alignment algorithms.",
    "API route returns structured Career Intelligence JSON for real-time applications.",
    "Public guide pages are optimized with CMS, SEO, GEO, AEO and LLM structured intelligence.",
    "Recommendations are dynamically mapped by domain and role hierarchy."
  ]
} as const;
