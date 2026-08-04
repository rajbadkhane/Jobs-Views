export const candidate = {
  person: {
    name: "Aarav Menon",
    title: "Senior Frontend Engineer",
    location: "Bengaluru, India",
    email: "aarav.menon@example.com",
    phone: "+91 98765 43210",
    portfolio: "aarav.dev",
    availability: "Open to remote and hybrid roles",
    profileUrl: "/candidate/aarav-menon"
  },
  widgets: [
    { label: "Recommended Jobs", value: "38", detail: "9 new today" },
    { label: "Applications", value: "12", detail: "3 in interview" },
    { label: "Profile Strength", value: "86%", detail: "4 fields missing" },
    { label: "Resume Score", value: "78", detail: "ATS placeholder" },
    { label: "Saved Jobs", value: "24", detail: "5 archived" },
    { label: "Interviews", value: "3", detail: "2 this week" },
    { label: "Notifications", value: "17", detail: "4 unread" }
  ],
  recommendedJobs: [
    {
      title: "Senior Frontend Engineer",
      company: "Aarunya Cloud",
      location: "Bengaluru / Hybrid",
      salary: "₹24L - ₹38L",
      match: 92,
      skills: ["React", "TypeScript", "Design Systems"]
    },
    {
      title: "Product Engineer",
      company: "NexaPay",
      location: "Remote India",
      salary: "₹20L - ₹32L",
      match: 88,
      skills: ["Next.js", "Node", "Fintech"]
    },
    {
      title: "UI Platform Lead",
      company: "LearnGrid",
      location: "Pune",
      salary: "₹28L - ₹42L",
      match: 84,
      skills: ["Accessibility", "Frontend", "Mentoring"]
    }
  ],
  applications: [
    { company: "Aarunya Cloud", role: "Senior Frontend Engineer", status: "Interview Scheduled", date: "2026-07-09", stage: 4 },
    { company: "NexaPay", role: "Product Engineer", status: "Shortlisted", date: "2026-07-12", stage: 3 },
    { company: "MedNova India", role: "Design Systems Engineer", status: "Offer Sent", date: "2026-07-16", stage: 6 }
  ],
  timeline: [
    "Application created",
    "Recruiter viewed profile",
    "Shortlisted",
    "Interview scheduled",
    "Feedback pending",
    "Offer placeholder"
  ],
  profile: {
    sections: [
      { title: "Personal Details", items: ["Full name", "Email", "Phone", "Location", "Availability"] },
      { title: "Education", items: ["B.Tech Computer Science", "National Institute of Technology", "2016-2020"] },
      { title: "Experience", items: ["Senior Frontend Engineer", "Frontend Engineer", "UI Intern"] },
      { title: "Skills", items: ["React", "TypeScript", "Go", "Accessibility", "Testing"] },
      { title: "Languages", items: ["English", "Hindi", "Malayalam"] },
      { title: "Projects", items: ["Design system migration", "Hiring analytics dashboard"] },
      { title: "Certifications", items: ["AWS Cloud Practitioner", "Advanced React Patterns"] },
      { title: "Social Links", items: ["LinkedIn", "GitHub", "Portfolio"] }
    ],
    missing: ["Profile video", "Two project outcomes", "One certification proof", "Preferred salary"]
  },
  resume: {
    active: "Aarav_Menon_Resume_v4.pdf",
    score: 78,
    versions: ["v4 - Active", "v3 - Product roles", "v2 - Frontend roles", "v1 - Fresher archive"],
    metadata: ["PDF", "428 KB", "Updated 2 days ago", "Virus scan hook ready"]
  },
  savedJobs: [
    { folder: "Dream Companies", count: 8, note: "Follow up after portfolio refresh" },
    { folder: "Remote India", count: 11, note: "Compare salary bands" },
    { folder: "Archived", count: 5, note: "Older roles" }
  ],
  alerts: [
    { keyword: "Frontend Engineer", location: "Bengaluru", salary: "₹20L+", frequency: "Daily", channels: ["Email", "Push"] },
    { keyword: "Remote React", location: "India", salary: "₹18L+", frequency: "Weekly", channels: ["Email", "SMS"] }
  ],
  notifications: [
    { type: "Applications", message: "Aarunya Cloud scheduled your technical interview.", unread: true },
    { type: "Recruiters", message: "NexaPay recruiter viewed your portfolio.", unread: true },
    { type: "Offers", message: "MedNova India offer letter is ready to download.", unread: false },
    { type: "System", message: "Resume score recalculated.", unread: false }
  ],
  messages: [
    { from: "Recruiter Chat", subject: "Interview availability", preview: "Please confirm your preferred slot." },
    { from: "Interview Messages", subject: "Round 2 brief", preview: "System design and frontend architecture." },
    { from: "Offer Messages", subject: "Compensation discussion", preview: "Updated offer package attached." },
    { from: "System Messages", subject: "Profile verification", preview: "Your email is verified." }
  ],
  growth: [
    { title: "Salary Insights", detail: "Market range for your profile: ₹22L - ₹40L" },
    { title: "Learning Recommendations", detail: "Deepen system design and web performance." },
    { title: "Interview Tips", detail: "Prepare frontend architecture examples." },
    { title: "Career Guides", detail: "Read the 2026 India frontend career roadmap." }
  ],
  settings: [
    { title: "Privacy", detail: "Public profile, resume link, recruiter visibility" },
    { title: "Security", detail: "Password, sessions, devices" },
    { title: "Notifications", detail: "Email, push, SMS, marketing" },
    { title: "Language", detail: "English, Hindi and regional language readiness" },
    { title: "Theme", detail: "Light, dark, system" },
    { title: "Delete Account", detail: "Request permanent account deletion" }
  ]
} as const;
