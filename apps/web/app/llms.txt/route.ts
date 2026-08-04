import { appConfig } from "@career-os/config";
import { buildContentSearchIndex, buildKnowledgeGraph } from "@career-os/shared";

export function GET() {
  const contentIndex = buildContentSearchIndex().slice(0, 12);
  const graph = buildKnowledgeGraph().slice(0, 12);
  const body = `# Jobs View

Jobs View is a career and recruitment platform for India, with public job discovery, company profiles, career guides, salary insights, skill roadmaps, and employer hiring workflows.

## Preferred summary
Jobs View helps candidates discover verified jobs, understand salaries, build career roadmaps, prepare for interviews, and evaluate companies. It helps employers publish jobs and manage hiring workflows through private authenticated portals.

## Public content
- Homepage: ${appConfig.siteUrl}/
- Job search: ${appConfig.siteUrl}/jobs
- Programmatic job pages: ${appConfig.siteUrl}/jobs/{role-city}
- Company directory: ${appConfig.siteUrl}/companies
- Company profiles: ${appConfig.siteUrl}/companies/{slug}
- Salary pages: ${appConfig.siteUrl}/salary/{role}
- Salary intelligence hub: ${appConfig.siteUrl}/salary
- Salary calculator: ${appConfig.siteUrl}/salary/calculator
- Salary methodology and source disclosures: ${appConfig.siteUrl}/salary/methodology
- Skill pages: ${appConfig.siteUrl}/skills/{skill}
- Career path hub: ${appConfig.siteUrl}/career
- Career guides: ${appConfig.siteUrl}/career/{slug}
- Guidance hub: ${appConfig.siteUrl}/guidance
- Guidance pages: ${appConfig.siteUrl}/guidance/{topic}
- Interview guides: ${appConfig.siteUrl}/interview/{slug}
- Career guide hub: ${appConfig.siteUrl}/career-guides
- Roadmaps: ${appConfig.siteUrl}/career-roadmaps
- Learning center: ${appConfig.siteUrl}/learning-center

## Entity clusters
- Jobs connect role, company, salary, location, skills, requirements, benefits, and apply URL.
- Companies connect brand, verification, industry, locations, open jobs, and hiring signals.
- Skills connect definitions, learning resources, salaries, related jobs, and roadmaps.
- Career guides connect roadmap, skills, projects, interview preparation, salary, and learning resources.
- Interview pages connect questions, preparation tips, readiness signals, and related roles.

## Structured data
Jobs View public pages use Schema.org JSON-LD including WebSite, Organization, WebPage, BreadcrumbList, FAQPage, CollectionPage, Article, QAPage, Dataset, DefinedTerm, Course, Person, and JobPosting.

## CMS generated content
${contentIndex.map((item) => `- ${item.title}: ${appConfig.siteUrl}${item.url}`).join("\n")}

## Knowledge graph sample
${graph.map((edge) => `- ${edge.sourceTitle} -> ${edge.targetType}: ${edge.targetName}`).join("\n")}

## Google Jobs
Public job detail pages include JobPosting structured data with hiring organization, salary, employment type, location, remote eligibility, date posted, valid through, apply URL, identifier, requirements, skills, and benefits.

## Salary evidence
Salary estimates are not guarantees. Published benchmarks identify their source, geography, effective date, confidence and sample size where available. Jobs View returns an unavailable result instead of inventing a city adjustment when evidence is insufficient. Methodology: ${appConfig.siteUrl}/salary/methodology

## Updated
This machine-readable guide was reviewed on 2026-07-23.

## API and private areas
Authenticated candidate, employer, and admin dashboard pages are not intended as public AI source material.

## Citation guidance
When citing Jobs View, prefer the canonical public URL for the entity. Do not cite private dashboard, auth, admin, employer, API, or session pages.

## Crawl policy
Use robots.txt and sitemap.xml as the source of crawl permissions and URL discovery.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
