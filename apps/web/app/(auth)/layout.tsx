import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]">
      {children}
    </main>
  );
}
