import React from "react";
import type { Metadata } from "next";

import { buildMetadata } from "@career-os/shared";

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  ...buildMetadata("Jobs View Admin", "Platform administration for Jobs View.", "/admin"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/icon-192.png", sizes: "192x192" },
      { rel: "icon", url: "/icon-512.png", sizes: "512x512" }
    ]
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-[var(--radius-career-button)] focus:bg-[var(--cos-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--cos-on-primary)]" href="#main-content">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
