import postgres from "postgres";
const sql = postgres(
  "postgresql://postgres.dnqomorishchdrfjfvlt:KingR%4012345%40%23@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres",
  { ssl: "require", max: 1 }
);

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function run() {
  // 1. Clean up leftover test companies from earlier session testing (no real jobs attached to them)
  const deleted = await sql`DELETE FROM companies WHERE name ILIKE 'Test Employer Co%' OR name ILIKE 'Final Check Co%' RETURNING id`;
  console.log("Removed test companies:", deleted.length);

  // 2. Ensure job_types exist
  const jobTypes = [
    ["Full Time", "full-time"],
    ["Part Time", "part-time"],
    ["Internship", "internship"],
    ["Contract", "contract"],
    ["Freelance", "freelance"]
  ];
  for (const [name, slug] of jobTypes) {
    await sql`INSERT INTO job_types (name, slug) VALUES (${name}, ${slug}) ON CONFLICT (slug) DO NOTHING`;
  }
  const typeRows = await sql`SELECT id, slug FROM job_types`;
  const typeId = Object.fromEntries(typeRows.map(r => [r.slug, r.id]));

  // 3. Insert real-looking companies
  const companies = [
    { name: "Northstar Logistics", industry: "Logistics", website: "https://northstarlogistics.example.com", city: "Mumbai", state: "Maharashtra" },
    { name: "Aarav Digital Solutions", industry: "IT Services", website: "https://aaravdigital.example.com", city: "Bengaluru", state: "Karnataka" },
    { name: "MedCare Hospitals Group", industry: "Healthcare", website: "https://medcarehospitals.example.com", city: "Pune", state: "Maharashtra" },
    { name: "Sunrise Retail Ventures", industry: "Retail", website: "https://sunriseretail.example.com", city: "Delhi", state: "Delhi" },
    { name: "QuickServe Facilities", industry: "Facility Management", website: "https://quickservefacilities.example.com", city: "Hyderabad", state: "Telangana" },
    { name: "BrightPath EdTech", industry: "Education Technology", website: "https://brightpathedtech.example.com", city: "Chennai", state: "Tamil Nadu" },
    { name: "Vertex Manufacturing", industry: "Manufacturing", website: "https://vertexmanufacturing.example.com", city: "Indore", state: "Madhya Pradesh" },
    { name: "CloudNova Technologies", industry: "Software", website: "https://cloudnova.example.com", city: "Bengaluru", state: "Karnataka" }
  ];

  const companyIds = {};
  for (const c of companies) {
    const slug = slugify(c.name) + "-" + Math.floor(1000 + Math.random() * 9000);
    const rows = await sql`
      INSERT INTO companies (name, slug, website, industry, status, is_verified, verified_at)
      VALUES (${c.name}, ${slug}, ${c.website}, ${c.industry}, 'approved', true, NOW())
      RETURNING id
    `;
    companyIds[c.name] = { id: rows[0].id, city: c.city, state: c.state };
    console.log("Created company:", c.name);
  }

  // 4. Insert jobs
  const jobs = [
    {
      company: "Northstar Logistics", title: "Delivery Executive", type: "full-time", workMode: "on_site",
      short: "Deliver packages across the city with a two-wheeler or company vehicle.",
      full: "Northstar Logistics is hiring Delivery Executives for last-mile delivery operations. You will pick up parcels from the local hub and deliver them to customers within assigned zones, using our routing app for navigation and proof of delivery.",
      salaryMin: 18000, salaryMax: 25000, period: "monthly", expMin: 0, expMax: 2, education: "10th Pass",
      skills: ["Two-wheeler driving", "Local area knowledge", "Time management"],
      requirements: ["Valid driving license", "Own two-wheeler preferred", "Smartphone with internet access"],
      benefits: ["Fuel allowance", "Weekly incentives", "PF and ESI"],
      city: "Mumbai", openings: 15, featured: false, urgent: true
    },
    {
      company: "Northstar Logistics", title: "Warehouse Associate", type: "full-time", workMode: "on_site",
      short: "Manage inventory, picking, and packing at our regional fulfillment center.",
      full: "We are looking for Warehouse Associates to support daily operations including receiving, put-away, picking, packing, and dispatch. Training provided for warehouse management systems.",
      salaryMin: 16000, salaryMax: 22000, period: "monthly", expMin: 0, expMax: 1, education: "10th Pass",
      skills: ["Inventory management", "Physical stamina", "Basic computer literacy"],
      requirements: ["Ability to lift up to 25kg", "Willingness to work in shifts"],
      benefits: ["PF and ESI", "Overtime pay", "Annual bonus"],
      city: "Mumbai", openings: 10, featured: false, urgent: false
    },
    {
      company: "Aarav Digital Solutions", title: "React Frontend Developer", type: "full-time", workMode: "hybrid",
      short: "Build responsive, accessible web applications using React and TypeScript.",
      full: "Aarav Digital Solutions is looking for a React Frontend Developer to join our product engineering team. You will work on customer-facing dashboards, collaborate with designers and backend engineers, and help maintain our component library.",
      salaryMin: 800000, salaryMax: 1400000, period: "annual", expMin: 2, expMax: 5, education: "Graduate",
      skills: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
      requirements: ["2+ years of React experience", "Strong understanding of responsive design", "Experience with Git workflows"],
      benefits: ["Health insurance", "Hybrid work model", "Learning stipend"],
      city: "Bengaluru", openings: 3, featured: true, urgent: false
    },
    {
      company: "Aarav Digital Solutions", title: "Backend Engineer (Node.js)", type: "full-time", workMode: "remote",
      short: "Design and maintain scalable APIs powering our SaaS platform.",
      full: "We are expanding our backend team and looking for a Node.js engineer comfortable with PostgreSQL, REST API design, and cloud deployment. You will own services end-to-end alongside a small, senior team.",
      salaryMin: 1000000, salaryMax: 1800000, period: "annual", expMin: 3, expMax: 7, education: "Graduate",
      skills: ["Node.js", "PostgreSQL", "REST APIs", "AWS"],
      requirements: ["3+ years backend development experience", "Experience with relational databases", "Comfort working fully remote"],
      benefits: ["Fully remote", "Health insurance", "Flexible hours"],
      city: "Remote", openings: 2, featured: true, urgent: false
    },
    {
      company: "MedCare Hospitals Group", title: "Staff Nurse", type: "full-time", workMode: "on_site",
      short: "Provide patient care across general wards and ICU rotations.",
      full: "MedCare Hospitals is hiring registered Staff Nurses for our multi-specialty hospital. Responsibilities include patient monitoring, medication administration, and coordinating with physicians on care plans.",
      salaryMin: 22000, salaryMax: 35000, period: "monthly", expMin: 0, expMax: 5, education: "GNM / B.Sc Nursing",
      skills: ["Patient care", "Vital signs monitoring", "Medical documentation"],
      requirements: ["Valid nursing council registration", "GNM or B.Sc Nursing degree", "Willingness to work rotational shifts"],
      benefits: ["PF and ESI", "On-site accommodation available", "Annual health checkup"],
      city: "Pune", openings: 8, featured: false, urgent: true
    },
    {
      company: "MedCare Hospitals Group", title: "Nursing Home Care Attendant", type: "full-time", workMode: "on_site",
      short: "Support elderly and recovering patients with daily care needs.",
      full: "We are hiring compassionate care attendants for our nursing home care division, assisting patients with daily living activities, mobility support, and basic health monitoring under nursing supervision.",
      salaryMin: 14000, salaryMax: 20000, period: "monthly", expMin: 0, expMax: 3, education: "12th Pass",
      skills: ["Patient assistance", "Compassionate care", "Basic first aid"],
      requirements: ["Certificate in home care or caregiving preferred", "Patience and good communication"],
      benefits: ["PF and ESI", "Meals provided on duty"],
      city: "Pune", openings: 6, featured: false, urgent: false
    },
    {
      company: "Sunrise Retail Ventures", title: "Retail Store Associate", type: "full-time", workMode: "on_site",
      short: "Assist customers, manage stock, and support billing at our retail outlet.",
      full: "Sunrise Retail is hiring Store Associates to deliver a great in-store customer experience, including greeting customers, restocking shelves, maintaining store cleanliness, and operating the billing counter.",
      salaryMin: 15000, salaryMax: 20000, period: "monthly", expMin: 0, expMax: 2, education: "12th Pass",
      skills: ["Customer service", "Cash handling", "Stock management"],
      requirements: ["Good communication skills", "Willingness to work weekends"],
      benefits: ["PF and ESI", "Employee discount", "Festival bonus"],
      city: "Delhi", openings: 12, featured: false, urgent: false
    },
    {
      company: "Sunrise Retail Ventures", title: "Digital Marketing Executive", type: "full-time", workMode: "hybrid",
      short: "Run paid campaigns and manage social media for our retail brand.",
      full: "Looking for a Digital Marketing Executive to manage our Meta and Google Ads campaigns, plan social media content calendars, and report on campaign performance across our retail store network.",
      salaryMin: 300000, salaryMax: 500000, period: "annual", expMin: 1, expMax: 4, education: "Graduate",
      skills: ["Google Ads", "Meta Ads Manager", "Content planning", "Analytics"],
      requirements: ["1+ years of hands-on ad campaign experience", "Familiarity with Canva or similar design tools"],
      benefits: ["Hybrid work model", "Performance bonus"],
      city: "Delhi", openings: 2, featured: false, urgent: false
    },
    {
      company: "QuickServe Facilities", title: "Security Guard", type: "full-time", workMode: "on_site",
      short: "Ensure premises safety through monitoring, patrolling, and access control.",
      full: "QuickServe Facilities is hiring Security Guards for residential and commercial sites. Duties include monitoring CCTV, controlling entry and exit, and maintaining incident logs.",
      salaryMin: 14000, salaryMax: 18000, period: "monthly", expMin: 0, expMax: 5, education: "10th Pass",
      skills: ["Vigilance", "Access control", "Incident reporting"],
      requirements: ["Physically fit", "Willingness to work night shifts", "Basic literacy for logbooks"],
      benefits: ["PF and ESI", "Uniform provided"],
      city: "Hyderabad", openings: 20, featured: false, urgent: true
    },
    {
      company: "QuickServe Facilities", title: "Facility Housekeeping Staff", type: "full-time", workMode: "on_site",
      short: "Maintain cleanliness and hygiene standards across client office premises.",
      full: "We are hiring Housekeeping Staff to maintain office premises for our corporate clients, including cleaning, waste management, and restocking supplies.",
      salaryMin: 13000, salaryMax: 16000, period: "monthly", expMin: 0, expMax: 3, education: "8th Pass",
      skills: ["Cleaning equipment operation", "Attention to detail"],
      requirements: ["Willingness to work in shifts"],
      benefits: ["PF and ESI", "Uniform provided"],
      city: "Hyderabad", openings: 8, featured: false, urgent: false
    },
    {
      company: "BrightPath EdTech", title: "Customer Support Executive (Work From Home)", type: "full-time", workMode: "remote",
      short: "Resolve student and parent queries via chat and phone from home.",
      full: "BrightPath EdTech is hiring remote Customer Support Executives to handle inbound queries from students and parents about our online courses, via phone and chat support tools.",
      salaryMin: 18000, salaryMax: 25000, period: "monthly", expMin: 0, expMax: 3, education: "12th Pass",
      skills: ["Communication", "CRM tools", "Problem solving"],
      requirements: ["Stable internet connection at home", "Good spoken English and Hindi"],
      benefits: ["Fully remote", "Flexible shifts", "Performance incentives"],
      city: "Remote", openings: 10, featured: true, urgent: false
    },
    {
      company: "BrightPath EdTech", title: "Content Writer - Career Guidance", type: "part-time", workMode: "remote",
      short: "Write career guidance articles and job-market content for our platform.",
      full: "We are looking for a part-time Content Writer to produce career guidance articles, salary insights, and interview preparation content for our education platform, optimized for readability and SEO.",
      salaryMin: 15000, salaryMax: 25000, period: "monthly", expMin: 1, expMax: 4, education: "Graduate",
      skills: ["Content writing", "SEO basics", "Research"],
      requirements: ["Portfolio of published writing", "Strong English writing skills"],
      benefits: ["Fully remote", "Flexible hours"],
      city: "Remote", openings: 2, featured: false, urgent: false
    },
    {
      company: "Vertex Manufacturing", title: "ITI Fitter", type: "full-time", workMode: "on_site",
      short: "Perform fitting, assembly, and maintenance work on the shop floor.",
      full: "Vertex Manufacturing is hiring ITI-qualified Fitters for our production unit, responsible for assembly line fitting work, basic maintenance, and quality checks.",
      salaryMin: 16000, salaryMax: 22000, period: "monthly", expMin: 0, expMax: 3, education: "ITI Fitter",
      skills: ["Fitting", "Blueprint reading", "Hand tools"],
      requirements: ["ITI certificate in Fitter trade", "Willingness to work in shifts"],
      benefits: ["PF and ESI", "Canteen facility", "Annual bonus"],
      city: "Indore", openings: 6, featured: false, urgent: false
    },
    {
      company: "Vertex Manufacturing", title: "Electrician (ITI)", type: "full-time", workMode: "on_site",
      short: "Maintain and troubleshoot electrical systems across the plant.",
      full: "We are hiring ITI-qualified Electricians to handle preventive maintenance, wiring, and troubleshooting of electrical systems and machinery at our manufacturing plant.",
      salaryMin: 17000, salaryMax: 24000, period: "monthly", expMin: 1, expMax: 5, education: "ITI Electrician",
      skills: ["Electrical wiring", "Preventive maintenance", "Safety protocols"],
      requirements: ["ITI certificate in Electrician trade", "Knowledge of industrial safety standards"],
      benefits: ["PF and ESI", "Safety gear provided"],
      city: "Indore", openings: 4, featured: false, urgent: false
    },
    {
      company: "CloudNova Technologies", title: "DevOps Engineer", type: "full-time", workMode: "hybrid",
      short: "Own CI/CD pipelines and cloud infrastructure for our SaaS products.",
      full: "CloudNova Technologies is hiring a DevOps Engineer to manage our AWS infrastructure, CI/CD pipelines, and observability stack. You will work closely with the engineering team to improve deployment reliability.",
      salaryMin: 1200000, salaryMax: 2000000, period: "annual", expMin: 3, expMax: 6, education: "Graduate",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      requirements: ["3+ years DevOps experience", "Hands-on Kubernetes experience", "Scripting in Python or Bash"],
      benefits: ["Hybrid work model", "Health insurance", "Stock options"],
      city: "Bengaluru", openings: 2, featured: true, urgent: false
    },
    {
      company: "CloudNova Technologies", title: "QA Automation Engineer", type: "full-time", workMode: "hybrid",
      short: "Build and maintain automated test suites for our web and API products.",
      full: "We are looking for a QA Automation Engineer to design and maintain our Playwright and API test automation suites, working closely with developers to catch regressions before release.",
      salaryMin: 700000, salaryMax: 1200000, period: "annual", expMin: 2, expMax: 5, education: "Graduate",
      skills: ["Playwright", "API testing", "JavaScript"],
      requirements: ["2+ years QA automation experience", "Familiarity with CI pipelines"],
      benefits: ["Hybrid work model", "Health insurance"],
      city: "Bengaluru", openings: 1, featured: false, urgent: false
    },
    {
      company: "CloudNova Technologies", title: "Software Engineering Intern", type: "internship", workMode: "hybrid",
      short: "6-month internship building real features on our production codebase.",
      full: "CloudNova Technologies offers a 6-month Software Engineering Internship for final-year students and recent graduates, working alongside our engineering team on real production features with mentorship.",
      salaryMin: 15000, salaryMax: 25000, period: "monthly", expMin: 0, expMax: 0, education: "Pursuing/Recent Graduate",
      skills: ["JavaScript", "Git", "Willingness to learn"],
      requirements: ["Final year student or recent graduate", "Basic understanding of web development"],
      benefits: ["Mentorship", "Pre-placement offer potential", "Certificate of completion"],
      city: "Bengaluru", openings: 5, featured: false, urgent: false
    },
    {
      company: "Aarav Digital Solutions", title: "Freelance UI/UX Designer", type: "freelance", workMode: "remote",
      short: "Design interfaces for client projects on a per-project basis.",
      full: "We are looking for a Freelance UI/UX Designer to collaborate on client projects, delivering wireframes, prototypes, and final UI designs in Figma on a project-by-project basis.",
      salaryMin: 25000, salaryMax: 60000, period: "monthly", expMin: 2, expMax: 6, education: "Graduate",
      skills: ["Figma", "UI Design", "Prototyping"],
      requirements: ["Strong design portfolio", "Experience with client projects"],
      benefits: ["Flexible schedule", "Remote work"],
      city: "Remote", openings: 2, featured: false, urgent: false
    },
    {
      company: "Sunrise Retail Ventures", title: "Delivery & Sales Trainee (Fresher)", type: "full-time", workMode: "on_site",
      short: "Entry-level role combining in-store sales support and local deliveries.",
      full: "A great entry point for freshers. This role combines in-store customer assistance with local delivery support during peak hours. Full training provided.",
      salaryMin: 13000, salaryMax: 17000, period: "monthly", expMin: 0, expMax: 0, education: "12th Pass",
      skills: ["Customer service", "Two-wheeler driving"],
      requirements: ["Freshers welcome", "Valid driving license preferred"],
      benefits: ["PF and ESI", "On-the-job training"],
      city: "Delhi", openings: 8, featured: false, urgent: false
    }
  ];

  let created = 0;
  for (const j of jobs) {
    const co = companyIds[j.company];
    if (!co) { console.error("Missing company for job:", j.title); continue; }
    const slug = slugify(`${j.title}-${j.company}`) + "-" + Math.floor(1000 + Math.random() * 9000);
    const publishedAt = new Date(Date.now() - Math.floor(Math.random() * 20) * 86400000).toISOString();
    const inserted = await sql`
      INSERT INTO jobs (
        company_id, job_type_id, title, slug, short_description, full_description,
        responsibilities, requirements, qualifications, benefits,
        salary_min, salary_max, currency, salary_period, salary_basis,
        experience_min, experience_max, education, openings,
        work_mode, country, state, city, status, visibility,
        is_featured, is_urgent, job_types_list, published_at
      ) VALUES (
        ${co.id}, ${typeId[j.type] || null}, ${j.title}, ${slug}, ${j.short}, ${j.full},
        '[]'::jsonb, ${j.requirements}::jsonb, '[]'::jsonb, ${j.benefits}::jsonb,
        ${j.salaryMin}, ${j.salaryMax}, 'INR', ${j.period}, 'ctc',
        ${j.expMin}, ${j.expMax}, ${j.education}, ${j.openings},
        ${j.workMode}, 'India', ${co.state}, ${j.city === "Remote" ? null : j.city}, 'published', 'public',
        ${j.featured}, ${j.urgent}, ${[j.type]}::jsonb, ${publishedAt}
      )
      RETURNING id
    `;
    const jobId = inserted[0].id;
    for (const skill of j.skills) {
      await sql`INSERT INTO job_skills (job_id, name, requirement_type, level) VALUES (${jobId}, ${skill}, 'required', 'intermediate') ON CONFLICT DO NOTHING`;
    }
    created++;
    console.log("Created job:", j.title, "@", j.company);
  }
  console.log(`Done. Created ${created} jobs across ${companies.length} companies.`);
  await sql.end();
}

run().catch((err) => { console.error(err); process.exit(1); });
