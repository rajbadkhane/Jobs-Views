"use client";

import type React from "react";
import { useState } from "react";
import { Mail, Lock, ShieldCheck } from "lucide-react";

import { appConfig } from "@career-os/config";
import { apiErrorMessage, authApi, useAuthStore } from "@career-os/shared";
import { Button } from "@career-os/ui";

export function AdminLoginForm() {
  const account = appConfig.developmentAccounts.admin;
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState(account.email);
  const [password, setPassword] = useState(account.password);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);
    try {
      const result = await authApi.login({ email, password });
      if (result.user.role !== "SUPER_ADMIN" && result.user.role !== "ADMIN") {
        await authApi.logout().catch(() => undefined);
        setError("Admin access only. Use the public login for candidate or employer accounts.");
        return;
      }
      setSession(
        {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          permissions: result.user.permissions ?? [],
          isVerified: result.user.is_verified
        },
        { accessToken: result.access_token, refreshToken: result.refresh_token }
      );
      window.location.href = "/admin";
    } catch (loginError) {
      setError(apiErrorMessage(loginError));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="mt-5 grid gap-4" onSubmit={submit}>
      <label className="grid gap-1 text-sm font-semibold">
        Email
        <span className="flex h-11 items-center gap-2 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] px-3 focus-within:border-[var(--cos-primary)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--cos-primary)_14%,transparent)]">
          <Mail size={16} className="text-[var(--cos-outline)]" />
          <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" value={email} autoComplete="username" onChange={(event) => setEmail(event.target.value)} />
        </span>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Password
        <span className="flex h-11 items-center gap-2 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] px-3 focus-within:border-[var(--cos-primary)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--cos-primary)_14%,transparent)]">
          <Lock size={16} className="text-[var(--cos-outline)]" />
          <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" value={password} type="password" autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} />
        </span>
      </label>
      {error ? <div role="alert" aria-live="assertive" className="rounded-[var(--radius-career-button)] border border-[var(--cos-error)] bg-[color-mix(in_srgb,var(--cos-error)_8%,var(--cos-surface-container-lowest))] px-3 py-2 text-sm font-semibold text-[var(--cos-error)]">{error}</div> : null}
      <Button type="submit" loading={isPending} disabled={isPending} fullWidth>
        <ShieldCheck size={16} />
        Login as admin
      </Button>
    </form>
  );
}
