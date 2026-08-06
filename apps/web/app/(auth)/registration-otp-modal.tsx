"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";

import { useAuthActions } from "@career-os/hooks";
import { Button, Dialog } from "@career-os/ui";
import { cn } from "@career-os/utils";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 45;

export function RegistrationOtpModal({ email, onDone }: { email: string; onDone: () => void }) {
  const auth = useAuthActions();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  function updateDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = clean;
      return next;
    });
    setError("");
    if (clean && index < CODE_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputsRef.current[index - 1]?.focus();
  }

  function onPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    setDigits((current) => {
      const next = [...current];
      for (let i = 0; i < CODE_LENGTH; i++) next[i] = pasted[i] || "";
      return next;
    });
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  async function submit() {
    const otp = digits.join("");
    if (otp.length !== CODE_LENGTH) {
      setError("Enter all 6 digits.");
      return;
    }
    setError("");
    try {
      await auth.verifyRegistrationOtp.mutateAsync({ email, otp });
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setError("");
    try {
      await auth.resendRegistrationOtp.mutateAsync({ email });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <Dialog open title="Verify your email" onClose={onDone}>
      <div className="grid gap-4">
        <div className="flex items-start gap-3 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3">
          <Mail size={18} className="mt-0.5 shrink-0 text-[var(--cos-primary)]" />
          <p className="text-sm text-[var(--cos-on-surface-variant)]">
            We sent a 6-digit code to <span className="font-semibold text-[var(--cos-on-surface)]">{email}</span>. Enter it below to verify your account.
          </p>
        </div>

        <div className="grid grid-cols-6 gap-2" role="group" aria-label="Verification code">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(event) => updateDigit(index, event.target.value)}
              onKeyDown={(event) => onKeyDown(index, event)}
              onPaste={onPaste}
              className={cn(
                "h-12 rounded-[var(--radius-career-button)] border bg-[var(--cos-surface-container-lowest)] text-center text-lg font-bold outline-none transition",
                "focus:border-[var(--cos-primary)] focus:ring-2 focus:ring-[var(--cos-focus-ring)]",
                error ? "border-[var(--cos-error)]" : "border-[var(--cos-outline-variant)]"
              )}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {error ? <p role="alert" className="text-sm font-medium text-[var(--cos-error)]">{error}</p> : null}

        <Button type="button" variant="gradient" size="lg" fullWidth loading={auth.verifyRegistrationOtp.isPending} onClick={submit}>
          <ShieldCheck size={17} /> Verify email
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--cos-on-surface-variant)]">
          <span>{cooldown > 0 ? `Resend available in ${cooldown}s` : "Didn't get it?"}</span>
          <Button type="button" variant="ghost" size="sm" disabled={cooldown > 0} loading={auth.resendRegistrationOtp.isPending} onClick={resend}>
            Resend code
          </Button>
        </div>

        <button type="button" onClick={onDone} className="text-center text-xs font-semibold text-[var(--cos-on-surface-variant)] hover:text-[var(--cos-primary)]">
          Verify later
        </button>
      </div>
    </Dialog>
  );
}

function errorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const data = (error as { response?: { data?: { error?: string | { message?: string } } } }).response?.data;
    if (typeof data?.error === "string") return data.error;
    if (data?.error?.message) return data.error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
