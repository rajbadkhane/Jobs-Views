import React from "react";

import type { ContentItem } from "@career-os/shared";
import { buildContentSchemas, contentLabel } from "@career-os/shared";

export function ContentPage({ item }: { item: ContentItem }) {
  const schemas = buildContentSchemas(item);
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto grid min-h-screen max-w-5xl gap-8 px-4 py-12 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--cos-primary)]">{contentLabel(item.type)}</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">{item.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{item.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">{tag}</span>
          ))}
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="SEO Score" value={`${item.analytics.seoScore}%`} />
        <Metric label="Reading Time" value={`${item.analytics.readingTimeMinutes} min`} />
        <Metric label="Version" value={`v${item.version}`} />
      </section>
      <section className="grid gap-5">
        {item.blocks.map((block, index) => {
          if (block.type === "rich_text") return <p key={index} className="text-base leading-8 text-slate-700 dark:text-slate-300">{block.body}</p>;
          if (block.type === "checklist") {
            return (
              <div key={index} className="rounded-md border border-slate-200 p-5 dark:border-slate-800">
                <h2 className="text-lg font-semibold">Checklist</h2>
                <ul className="mt-3 grid gap-2">
                  {block.items.map((item) => <li key={item} className="text-sm text-slate-600 dark:text-slate-300">Check: {item}</li>)}
                </ul>
              </div>
            );
          }
          if (block.type === "faq") {
            return (
              <div key={index} className="rounded-md border border-slate-200 p-5 dark:border-slate-800">
                <h2 className="text-lg font-semibold">FAQ</h2>
                <div className="mt-3 grid gap-3">
                  {block.items.map((faq) => (
                    <details key={faq.question} className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                      <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            );
          }
          if (block.type === "related") return <Related key={index} slugs={block.slugs} />;
          if (block.type === "downloads") return <Related key={index} slugs={block.items.map((entry) => entry.label)} title="Downloads" />;
          if (block.type === "image") return <div key={index} className="rounded-md border border-slate-200 p-5 text-sm dark:border-slate-800">{block.alt}</div>;
          return <div key={index} className="rounded-md border border-slate-200 p-5 text-sm dark:border-slate-800">{block.title}</div>;
        })}
      </section>
      <section className="rounded-md border border-slate-200 p-5 dark:border-slate-800">
        <h2 className="text-lg font-semibold">AI-ready summary</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.aiSummary ?? item.summary}</p>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-bold">{value}</div>
    </div>
  );
}

function Related({ slugs, title = "Related content" }: { slugs: string[]; title?: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-5 dark:border-slate-800">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {slugs.map((slug) => <span key={slug} className="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-900">{slug}</span>)}
      </div>
    </div>
  );
}
