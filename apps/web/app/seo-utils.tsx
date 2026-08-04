import type { ReactNode } from "react";

import { appConfig } from "@career-os/config";
import {
  articleSchema,
  breadcrumbSchema,
  buildMetadata,
  collectionPageSchema,
  companySchema,
  courseSchema,
  datasetSchema,
  definedTermSchema,
  jsonLd,
  webPageSchema
} from "@career-os/shared";

export function titleCaseSlug(value: string) {
  return decodeURIComponent(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function seoPageMetadata(title: string, description: string, path: string, image?: string) {
  return buildMetadata(title, description, path, image);
}

export function seoSchemas(kind: string, title: string, path: string, description: string) {
  const schemaByKind: Record<string, unknown> = {
    Organization: companySchema(title, description, path),
    Dataset: datasetSchema(title, description, path),
    DefinedTerm: definedTermSchema(title, description, path),
    Article: articleSchema(title, description, path),
    QAPage: webPageSchema(title, description, path, "QAPage"),
    Course: courseSchema(title, description, path),
    CollectionPage: collectionPageSchema(title, description, path),
    WebPage: webPageSchema(title, description, path)
  };

  return [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: title, path }
    ]),
    schemaByKind[kind] ??
    jsonLd(kind, {
      name: title,
      headline: title,
      description,
      url: new URL(path, appConfig.siteUrl).toString(),
      inLanguage: "en-IN",
      isPartOf: { "@type": "WebSite", name: "Jobs View", url: appConfig.siteUrl }
    })
  ];
}

export function StructuredSeoPage({ title, description, children, schemas }: { title: string; description: string; children?: ReactNode; schemas: unknown[] }) {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto grid min-h-screen max-w-5xl gap-8 px-4 py-12 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--cos-primary)]">Jobs View</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {["Live jobs", "Verified companies", "Career insights"].map((item) => (
          <div key={item} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <h2 className="font-semibold">{item}</h2>
            <p className="mt-2 text-sm text-slate-500">Connected to Jobs View search, CMS, and structured data systems.</p>
          </div>
        ))}
      </section>
      {children}
    </main>
  );
}
