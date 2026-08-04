import type { Metadata } from "next";
import Image from "next/image";
import { appConfig } from "@career-os/config";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login | Jobs View",
  description: "Secure admin access for Jobs View platform operations.",
  robots: { index: false, follow: false }
};

export default function AdminLoginPage() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-[var(--cos-surface)] px-[max(1rem,env(safe-area-inset-left))] py-4 pr-[max(1rem,env(safe-area-inset-right))] text-[var(--cos-on-surface)]">
      <section className="w-full max-w-md rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-6 shadow-career-lg">
        <Image src="/images/logo.png" alt="Jobs View logo" width={160} height={64} priority className="h-16 w-auto object-contain" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--cos-primary)]">{appConfig.brand.tagline}</p>
        <h1 className="mt-3 text-2xl font-bold">Admin login</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--cos-on-surface-variant)]">Use the shared authentication system to access the Jobs View admin control center.</p>
        <dl className="mt-5 rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-low)] p-4 text-sm">
          {appConfig.hardcodedAdmins.map((account, index) => (
            <div key={account.email} className={index ? "mt-3 border-t border-[var(--cos-outline-variant)] pt-3" : undefined}>
              <dt className="font-semibold">Admin {index + 1}</dt>
              <dd className="mt-1 break-all text-[var(--cos-on-surface-variant)]">{account.email}</dd>
              <dd className="mt-1 font-semibold">{account.password}</dd>
            </div>
          ))}
        </dl>
        <AdminLoginForm />
      </section>
    </main>
  );
}
