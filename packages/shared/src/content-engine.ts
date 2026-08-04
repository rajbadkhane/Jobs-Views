import { appConfig } from "@career-os/config";

export type ContentStatus = "draft" | "review" | "scheduled" | "published" | "archived" | "deleted";
export type ContentType =
  | "career"
  | "guidance"
  | "salary"
  | "interview"
  | "skill"
  | "learning"
  | "blog"
  | "news"
  | "success_story"
  | "faq"
  | "landing_page"
  | "announcement"
  | "policy_page"
  | "static_page";

export type ContentBlock =
  | { type: "rich_text"; body: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; url: string; title: string }
  | { type: "checklist"; items: string[] }
  | { type: "faq"; items: { question: string; answer: string }[] }
  | { type: "downloads"; items: { label: string; url: string }[] }
  | { type: "related"; slugs: string[] };

export type ContentSEO = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  keywords?: string[];
  noindex?: boolean;
};

export type ContentEntity = {
  type: string;
  name: string;
  slug?: string;
};

export type ContentItem = {
  id: string;
  type: ContentType;
  slug: string;
  title: string;
  summary: string;
  excerpt: string;
  body: string;
  featuredImage?: string;
  gallery: string[];
  tags: string[];
  categories: string[];
  author?: string;
  reviewer?: string;
  status: ContentStatus;
  language: string;
  seo: ContentSEO;
  schema?: Record<string, unknown>;
  blocks: ContentBlock[];
  entities: ContentEntity[];
  related: string[];
  aiSummary?: string;
  shortSummary?: string;
  suggestedInternalLinks: string[];
  version: number;
  revisions: { version: number; title: string; editedAt: string; editor?: string }[];
  analytics: {
    views: number;
    ctr: number;
    seoScore: number;
    readingTimeMinutes: number;
    shares: number;
    ranking?: number;
    topKeywords: string[];
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export const contentTypePaths: Record<ContentType, string> = {
  career: "/career",
  guidance: "/guidance",
  salary: "/salary",
  interview: "/interview",
  skill: "/skills",
  learning: "/learning-center",
  blog: "/career-guides",
  news: "/news",
  success_story: "/success-stories",
  faq: "/faq",
  landing_page: "",
  announcement: "/announcements",
  policy_page: "/policies",
  static_page: "/pages"
};

export const contentLifecycle: ContentStatus[] = ["draft", "review", "scheduled", "published", "archived", "deleted"];

export const contentSeeds: ContentItem[] = [
  seedContent({
    type: "career",
    slug: "security-guard",
    title: "Security Guard Career",
    summary: "Eligibility, skills, salary, growth, companies, demand, and future scope for security guard careers.",
    tags: ["security", "operations", "entry-level"],
    categories: ["Security", "Industrial Security"],
    entities: [
      { type: "industry", name: "Security" },
      { type: "role", name: "Security Guard" },
      { type: "skill", name: "Access Control", slug: "access-control" }
    ],
    blocks: [
      { type: "rich_text", body: "Security guards protect people, assets, offices, factories, warehouses, and communities through patrolling, access control, reporting, and emergency readiness." },
      { type: "checklist", items: ["Basic education", "Physical fitness", "Shift availability", "Communication skills", "Security training certificate preferred"] },
      { type: "faq", items: [{ question: "Is security guard a good career?", answer: "It can be a strong entry path into industrial security, supervision, facility operations, and security management." }] }
    ]
  }),
  seedContent({
    type: "career",
    slug: "software-engineer",
    title: "Software Engineer Career",
    summary: "Roadmap, skills, salary, interview preparation, learning resources, and career growth for software engineers.",
    tags: ["technology", "software", "engineering"],
    categories: ["Technology", "Software Engineering"],
    entities: [
      { type: "industry", name: "Technology" },
      { type: "role", name: "Software Engineer" },
      { type: "skill", name: "TypeScript", slug: "typescript" }
    ]
  }),
  seedContent({
    type: "guidance",
    slug: "resume-writing",
    title: "Resume Writing Guidance",
    summary: "A practical guide to writing a clear, ATS-friendly resume for Jobs View applications.",
    tags: ["resume", "ats", "job-search"],
    categories: ["Guidance"],
    blocks: [
      { type: "rich_text", body: "A strong resume is specific, measurable, readable, and tailored to the job family you want." },
      { type: "checklist", items: ["Use a clear headline", "Add measurable achievements", "Keep skills current", "Match role keywords", "Export as PDF"] }
    ]
  }),
  seedContent({
    type: "salary",
    slug: "software-engineer",
    title: "Software Engineer Salary in India",
    summary: "Salary benchmarks by experience, city, skills, industry, company type, and growth forecast.",
    tags: ["salary", "software-engineer", "india"],
    categories: ["Salary"],
    entities: [
      { type: "role", name: "Software Engineer" },
      { type: "salary", name: "Software Engineer Salary" }
    ]
  }),
  seedContent({
    type: "interview",
    slug: "hr-questions",
    title: "HR Interview Questions",
    summary: "Common HR questions, answer structure, preparation tips, and behavioral interview guidance.",
    tags: ["interview", "hr", "preparation"],
    categories: ["Interview"],
    blocks: [{ type: "faq", items: [{ question: "Tell me about yourself.", answer: "Summarize your background, strengths, relevant work, and the role you are targeting." }] }]
  }),
  seedContent({
    type: "skill",
    slug: "react",
    title: "React Skill Guide",
    summary: "React roadmap, prerequisites, demand, companies, salary impact, related skills, and learning resources.",
    tags: ["react", "frontend", "javascript"],
    categories: ["Skills", "Frontend"],
    entities: [
      { type: "skill", name: "React" },
      { type: "role", name: "Frontend Engineer" }
    ]
  }),
  seedContent({
    type: "landing_page",
    slug: "jobs-in-bhopal",
    title: "Jobs in Bhopal",
    summary: "Find verified jobs in Bhopal across technology, operations, sales, education, healthcare, and government hiring.",
    tags: ["jobs", "bhopal", "local-jobs"],
    categories: ["Landing Pages", "Location Jobs"]
  })
];

export function contentPath(item: Pick<ContentItem, "type" | "slug">) {
  const base = contentTypePaths[item.type];
  return base ? `${base}/${item.slug}` : `/${item.slug}`;
}

export function findContent(type: ContentType, slug: string, items: ContentItem[] = contentSeeds) {
  return items.find((item) => item.type === type && item.slug === slug && item.status === "published");
}

export function findLandingContent(slug: string, items: ContentItem[] = contentSeeds) {
  return items.find((item) => ["landing_page", "static_page", "policy_page"].includes(item.type) && item.slug === slug && item.status === "published");
}

export function listPublishedContent(type?: ContentType, items: ContentItem[] = contentSeeds) {
  return items.filter((item) => item.status === "published" && (!type || item.type === type));
}

export function buildContentSchemas(item: ContentItem) {
  const path = contentPath(item);
  const faqs = item.blocks.flatMap((block) => block.type === "faq" ? block.items : []);
  const base = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: contentLabel(item.type), path: contentTypePaths[item.type] || path },
      { name: item.title, path }
    ]),
    contentSchemaByType(item)
  ];
  return faqs.length ? [...base, faqSchema(faqs)] : base;
}

export function buildKnowledgeGraph(items: ContentItem[] = contentSeeds) {
  return items.flatMap((item) => item.entities.map((entity) => ({
    source: `${item.type}:${item.slug}`,
    sourceTitle: item.title,
    sourceUrl: new URL(contentPath(item), appConfig.siteUrl).toString(),
    targetType: entity.type,
    targetName: entity.name,
    targetSlug: entity.slug
  })));
}

export function buildContentSearchIndex(items: ContentItem[] = contentSeeds) {
  return listPublishedContent(undefined, items).map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    summary: item.summary,
    url: contentPath(item),
    keywords: Array.from(new Set([...item.tags, ...item.categories, ...item.entities.map((entity) => entity.name)])),
    updatedAt: item.updatedAt
  }));
}

export function contentLabel(type: ContentType) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function contentSchemaByType(item: ContentItem) {
  const path = contentPath(item);
  if (item.type === "career" || item.type === "guidance" || item.type === "blog" || item.type === "news" || item.type === "success_story") {
    return articleSchema(item.title, item.summary, path, item.tags);
  }
  if (item.type === "salary") return datasetSchema(item.title, item.summary, path);
  if (item.type === "skill") return definedTermSchema(item.title, item.summary, path);
  if (item.type === "learning") return courseSchema(item.title, item.summary, path);
  if (item.type === "interview") return webPageSchema(item.title, item.summary, path, "QAPage");
  if (item.type === "landing_page") return collectionPageSchema(item.title, item.summary, path);
  return webPageSchema(item.title, item.summary, path);
}

function jsonLd(type: string, payload: Record<string, unknown>) {
  return { "@context": "https://schema.org", "@type": type, ...payload };
}

function webPageSchema(title: string, description: string, path: string, type = "WebPage") {
  const url = new URL(path, appConfig.siteUrl).toString();
  return jsonLd(type, {
    name: title,
    headline: title,
    description,
    url,
    inLanguage: "en-IN",
    isPartOf: { "@type": "WebSite", name: "Jobs View", url: appConfig.siteUrl }
  });
}

function collectionPageSchema(title: string, description: string, path: string) {
  return webPageSchema(title, description, path, "CollectionPage");
}

function articleSchema(title: string, description: string, path: string, keywords: string[]) {
  return jsonLd("Article", {
    headline: title,
    description,
    keywords,
    url: new URL(path, appConfig.siteUrl).toString(),
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: "Jobs View" },
    publisher: { "@type": "Organization", name: "Jobs View", url: appConfig.siteUrl }
  });
}

function datasetSchema(title: string, description: string, path: string) {
  return jsonLd("Dataset", {
    name: title,
    description,
    url: new URL(path, appConfig.siteUrl).toString(),
    spatialCoverage: { "@type": "Country", name: "India" }
  });
}

function definedTermSchema(title: string, description: string, path: string) {
  return jsonLd("DefinedTerm", {
    name: title,
    description,
    url: new URL(path, appConfig.siteUrl).toString()
  });
}

function courseSchema(title: string, description: string, path: string) {
  return jsonLd("Course", {
    name: title,
    description,
    url: new URL(path, appConfig.siteUrl).toString(),
    provider: { "@type": "Organization", name: "Jobs View", url: appConfig.siteUrl }
  });
}

function breadcrumbSchema(items: { name: string; path: string }[]) {
  return jsonLd("BreadcrumbList", {
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, appConfig.siteUrl).toString()
    }))
  });
}

function faqSchema(items: { question: string; answer: string }[]) {
  return jsonLd("FAQPage", {
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  });
}

function seedContent(input: Partial<ContentItem> & Pick<ContentItem, "type" | "slug" | "title" | "summary">): ContentItem {
  const now = "2026-07-12T00:00:00.000Z";
  return {
    id: `${input.type}-${input.slug}`,
    type: input.type,
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    excerpt: input.excerpt ?? input.summary,
    body: input.body ?? input.summary,
    featuredImage: input.featuredImage,
    gallery: input.gallery ?? [],
    tags: input.tags ?? [],
    categories: input.categories ?? [],
    author: input.author ?? "Jobs View Editorial",
    reviewer: input.reviewer ?? "SEO Review",
    status: input.status ?? "published",
    language: input.language ?? "en-IN",
    seo: input.seo ?? { title: input.title, description: input.summary, canonicalPath: contentPath({ type: input.type, slug: input.slug }), keywords: input.tags },
    schema: input.schema,
    blocks: input.blocks ?? [{ type: "rich_text", body: input.summary }],
    entities: input.entities ?? [],
    related: input.related ?? [],
    aiSummary: input.aiSummary ?? input.summary,
    shortSummary: input.shortSummary ?? input.summary,
    suggestedInternalLinks: input.suggestedInternalLinks ?? [],
    version: input.version ?? 1,
    revisions: input.revisions ?? [{ version: 1, title: input.title, editedAt: now, editor: "Jobs View" }],
    analytics: input.analytics ?? { views: 0, ctr: 0, seoScore: 92, readingTimeMinutes: Math.max(1, Math.ceil(input.summary.split(/\s+/).length / 180)), shares: 0, topKeywords: input.tags ?? [] },
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    publishedAt: input.publishedAt ?? now
  };
}
