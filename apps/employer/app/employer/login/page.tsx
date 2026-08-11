import type { Metadata } from "next";
import Image from "next/image";
import { appConfig } from "@career-os/config";

export const metadata: Metadata = {
  title: "Employer Login | Jobs View",
  description: "Secure employer access for Jobs View hiring teams.",
  robots: { index: false, follow: false }
};

export default function EmployerLoginPage() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-[var(--cos-surface)] px-[max(1rem,env(safe-area-inset-left))] py-4 pr-[max(1rem,env(safe-area-inset-right))] text-[var(--cos-on-surface)]">
      <section className="w-full max-w-md rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-6 shadow-career-lg">
        <Image src="/images/logo.png" alt="Jobs View logo" width={176} height={64} priority className="h-16 w-auto object-contain" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--cos-primary)]">{appConfig.brand.tagline}</p>
        <h1 className="mt-3 text-2xl font-bold">Employer login</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--cos-on-surface-variant)]">Use the shared authentication system to access your Jobs View employer workspace after approval.</p>
        <a href={`${appConfig.siteUrl}/login`} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-career-button)] bg-[var(--cos-primary)] px-4 text-sm font-bold text-[var(--cos-on-primary)] transition hover:bg-[#082E61] focus:outline-none focus:ring-2 focus:ring-[var(--cos-focus-ring)]">
          Continue to secure login
        </a>
      </section>
    </main>
  );
}
