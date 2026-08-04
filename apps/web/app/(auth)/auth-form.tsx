"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Github,
  Globe2,
  Linkedin,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { z as zod } from "zod";

import { useAuthActions } from "@career-os/hooks";
import { appConfig } from "@career-os/config";
import { emailSchema, loginSchema, registerSchema, resetPasswordSchema } from "@career-os/shared";
import { Button, Card, EnterpriseCard, FormStepper, Input, PasswordInput, UploadDropzone } from "@career-os/ui";
import { cn } from "@career-os/utils";

type AuthMode = "login" | "register" | "forgot" | "reset" | "verify";

const schemas = {
  login: loginSchema,
  register: registerSchema,
  forgot: emailSchema,
  reset: resetPasswordSchema,
  verify: zod.object({ token: zod.string().min(8) })
};

const focusClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cos-surface)]";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const schema = schemas[mode];
  const auth = useAuthActions();
  const [step, setStep] = useState(0);
  const [localError, setLocalError] = useState("");
  const [validationNotice, setValidationNotice] = useState("");
  const [nextPath, setNextPath] = useState("");
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("next")?.trim() ?? "";
    setNextPath(value.startsWith("/") && !value.startsWith("//") ? value : "");
  }, []);
  const {
    register,
    handleSubmit,
    watch,
    clearErrors,
    formState: { errors, submitCount, touchedFields }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: mode === "register" ? ({ role: "JOB_SEEKER" } as Partial<z.infer<typeof schema>>) : undefined
  });

  const selectedRole = watch("role" as never) as unknown as "EMPLOYER" | "JOB_SEEKER" | undefined;
  const watchedPassword = (watch("password" as never) as unknown as string | undefined) ?? "";
  const password = watchedPassword;
  const registerField: RegisterField = (name) => {
    return register(name as never, {
      setValueAs: (value) => typeof value === "string" ? value.trim() : value
    });
  };
  useEffect(() => {
    const subscription = watch((_, info) => {
      if (info.name) clearErrors(info.name as never);
    });
    return () => subscription.unsubscribe();
  }, [clearErrors, watch]);
  const formErrors = useMemo(() => {
    const raw = errors as Record<string, { message?: string } | undefined>;
    const touched = touchedFields as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [key, submitCount > 0 || Boolean(touched[key]) ? value : undefined])
    ) as Record<string, { message?: string } | undefined>;
  }, [errors, submitCount, touchedFields]);
  const pending =
    auth.login.isPending ||
    auth.register.isPending ||
    auth.forgotPassword.isPending ||
    auth.resetPassword.isPending ||
    auth.verifyEmail.isPending;
  const authError =
    auth.login.error ||
    auth.register.error ||
    auth.forgotPassword.error ||
    auth.resetPassword.error ||
    auth.verifyEmail.error;
  const passwordScore = useMemo(() => scorePassword(password), [password]);

  async function onSubmit(values: z.infer<typeof schema>) {
    setLocalError("");
    setValidationNotice("");
    if (mode === "login") {
      const credentials = values as { email: string; password: string };
      const adminEmail = credentials.email.trim().toLowerCase();
      if (appConfig.hardcodedAdmins.some((account) => account.email.toLowerCase() === adminEmail)) {
        setLocalError("Admin accounts can only sign in from the admin panel.");
        return;
      }
      await auth.login.mutateAsync(credentials);
    }
    if (mode === "register") {
      const payload = values as {
        name: string;
        email: string;
        mobile?: string;
        password: string;
        role: "EMPLOYER" | "JOB_SEEKER";
        companyName?: string;
        website?: string;
        gstNumber?: string;
        cinNumber?: string;
      };
      const [firstName, ...rest] = payload.name.trim().split(" ");
      await auth.register.mutateAsync({
        email: payload.email,
        password: payload.password,
        role: payload.role,
        first_name: firstName,
        last_name: rest.join(" "),
        mobile: payload.mobile,
        company_name: payload.companyName,
        website: payload.website,
        gst_number: payload.gstNumber,
        cin_number: payload.cinNumber
      });
    }
    if (mode === "forgot") await auth.forgotPassword.mutateAsync(values as { email: string });
    if (mode === "reset") await auth.resetPassword.mutateAsync(values as { token: string; password: string });
    if (mode === "verify") await auth.verifyEmail.mutateAsync((values as { token: string }).token);
  }

  function onInvalid() {
    setValidationNotice("Please complete the highlighted fields, then create your account.");
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    });
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1440px] gap-8 px-[max(1rem,env(safe-area-inset-left))] py-6 pr-[max(1rem,env(safe-area-inset-right))] sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-8">
      <AuthStory mode={mode} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="flex items-center justify-center">
        <Card className="w-full max-w-xl p-5 sm:p-6 lg:p-7">
          <div className="mb-6 text-center">
            <a href="/" className={cn("mx-auto inline-flex items-center gap-3 rounded-[var(--radius-career-button)] p-2", focusClass)} aria-label="Jobs View home">
              <div className="h-14 w-20 shrink-0 overflow-hidden relative rounded-md">
                <Image
                  src="/images/logo.png"
                  alt="Jobs View logo"
                  fill
                  sizes="80px"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-base font-extrabold text-[#0A3A7A]">Jobs <span className="text-[#F59E0B]">View</span></span>
            </a>
            <AuthPill tone={pillFor(mode)} className="mt-4">{eyebrowFor(mode)}</AuthPill>
            <h1 className="mt-3 text-2xl font-bold tracking-normal sm:text-3xl">{titleFor(mode)}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--cos-on-surface-variant)]">{subtitleFor(mode)}</p>
          </div>

          {mode === "register" ? (
            <div className="mb-5">
              <FormStepper steps={["Account type", "Profile", selectedRole === "EMPLOYER" ? "Company" : "Career"]} current={step} />
            </div>
          ) : null}

          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit, onInvalid)}>
            <fieldset disabled={pending} className="contents">
              {mode === "login" ? <LoginFields registerField={registerField} formErrors={formErrors} /> : null}
              {mode === "register" ? (
                <RegisterFields registerField={registerField} formErrors={formErrors} selectedRole={selectedRole ?? "JOB_SEEKER"} password={password} passwordScore={passwordScore} step={step} setStep={setStep} />
              ) : null}
              {mode === "forgot" ? <ForgotFields registerField={registerField} formErrors={formErrors} /> : null}
              {mode === "reset" ? <ResetFields registerField={registerField} formErrors={formErrors} password={password} passwordScore={passwordScore} /> : null}
              {mode === "verify" ? <VerifyFields registerField={registerField} formErrors={formErrors} /> : null}
            </fieldset>

            {validationNotice ? <Notice tone="danger" title="Check the form" description={validationNotice} /> : null}
            {localError ? <Notice tone="danger" title="Admin login separated" description={localError} /> : null}
            {authError ? <Notice tone="danger" title="Authentication issue" description={errorMessage(authError)} /> : null}
            {(auth.forgotPassword.isSuccess || auth.resetPassword.isSuccess || auth.verifyEmail.isSuccess) && mode !== "login" && mode !== "register" ? (
              <Notice tone="success" title="Request completed" description={successFor(mode)} />
            ) : null}

            <Button type="submit" variant="gradient" size="lg" loading={pending} disabled={pending} fullWidth>
              {ctaFor(mode)}
              <ArrowRight size={17} />
            </Button>
          </form>

          {mode === "login" ? <TestCredentials /> : null}
          {mode === "login" ? <SocialLogin /> : null}
          <AuthLinks mode={mode} nextPath={nextPath} />
        </Card>
      </motion.div>
    </section>
  );
}

function TestCredentials() {
  const accounts = [
    { label: "Candidate", email: appConfig.developmentAccounts.candidate.email, password: appConfig.developmentAccounts.candidate.password },
    { label: "Employer", email: appConfig.developmentAccounts.employer.email, password: appConfig.developmentAccounts.employer.password }
  ];
  return (
    <div className="mt-5 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3 text-sm">
      <div className="font-bold text-[var(--cos-primary)]">Test login credentials</div>
      <div className="mt-3 grid gap-2">
        {accounts.map((account) => (
          <div key={account.label} className="rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-lowest)] p-3">
            <div className="font-semibold">{account.label}</div>
            <div className="mt-1 break-all text-xs text-[var(--cos-on-surface-variant)]">{account.email}</div>
            <div className="mt-1 text-xs font-semibold">{account.password}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginFields({ registerField, formErrors }: FieldProps) {
  return (
    <>
      <Input label="Email" type="email" autoComplete="email" prefix={<Mail size={16} />} {...registerField("email")} error={formErrors.email?.message} />
      <PasswordInput label="Password" autoComplete="current-password" {...registerField("password")} error={formErrors.password?.message} />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <label className="inline-flex items-center gap-2 font-medium text-[var(--cos-on-surface-variant)]">
          <input type="checkbox" className="h-4 w-4 rounded border-[var(--cos-outline-variant)] accent-[var(--cos-primary)]" />
          Remember me
        </label>
        <a href="/forgot-password" className={cn("rounded-full font-semibold text-[var(--cos-primary)] hover:underline", focusClass)}>Forgot password?</a>
      </div>
    </>
  );
}

function RegisterFields({ registerField, formErrors, selectedRole, password, passwordScore, step, setStep }: FieldProps & { selectedRole: "EMPLOYER" | "JOB_SEEKER"; password: string; passwordScore: PasswordScore; step: number; setStep: (step: number) => void }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Account type">
        <label className={cn("cursor-pointer rounded-[var(--radius-career-card)] border p-4 transition hover:-translate-y-px", selectedRole === "JOB_SEEKER" ? "border-[var(--cos-primary)] bg-[var(--cos-primary-container)]/10" : "border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)]")}>
          <input type="radio" value="JOB_SEEKER" className="sr-only" {...registerField("role")} onClick={() => setStep(1)} />
          <UserRound size={18} className="text-[var(--cos-primary)]" />
          <div className="mt-3 font-bold">Candidate</div>
          <p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">Search jobs, build your profile, and apply faster.</p>
        </label>
        <label className={cn("cursor-pointer rounded-[var(--radius-career-card)] border p-4 transition hover:-translate-y-px", selectedRole === "EMPLOYER" ? "border-[var(--cos-primary)] bg-[var(--cos-primary-container)]/10" : "border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)]")}>
          <input type="radio" value="EMPLOYER" className="sr-only" {...registerField("role")} onClick={() => setStep(1)} />
          <Building2 size={18} className="text-[var(--cos-primary)]" />
          <div className="mt-3 font-bold">Employer</div>
          <p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">Register your company and start verification.</p>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" autoComplete="name" prefix={<UserRound size={16} />} {...registerField("name")} error={formErrors.name?.message} onFocus={() => setStep(1)} />
        <Input label="Mobile" autoComplete="tel" prefix={<Phone size={16} />} {...registerField("mobile")} error={formErrors.mobile?.message} onFocus={() => setStep(1)} />
      </div>
      <Input label="Email" type="email" autoComplete="email" prefix={<Mail size={16} />} {...registerField("email")} error={formErrors.email?.message} onFocus={() => setStep(1)} />
      <PasswordInput label="Password" autoComplete="new-password" {...registerField("password")} error={formErrors.password?.message} onFocus={() => setStep(1)} />
      <PasswordStrength password={password} score={passwordScore} />
      <PasswordInput label="Confirm password" autoComplete="new-password" {...registerField("confirmPassword")} error={formErrors.confirmPassword?.message} onFocus={() => setStep(1)} />

      {selectedRole === "EMPLOYER" ? (
        <div className="grid gap-4 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-4">
          <div className="flex items-start gap-3">
            <BadgeCheck size={18} className="mt-0.5 text-[var(--cos-primary)]" />
            <div>
              <div className="font-bold">Company verification</div>
              <p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">Employer dashboards unlock after admin review and approval.</p>
            </div>
          </div>
          <Input label="Company name" prefix={<Building2 size={16} />} {...registerField("companyName")} error={formErrors.companyName?.message} onFocus={() => setStep(2)} />
          <Input label="Website" prefix={<Globe2 size={16} />} {...registerField("website")} error={formErrors.website?.message} onFocus={() => setStep(2)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="GST" {...registerField("gstNumber")} error={formErrors.gstNumber?.message} onFocus={() => setStep(2)} />
            <Input label="CIN" {...registerField("cinNumber")} error={formErrors.cinNumber?.message} onFocus={() => setStep(2)} />
          </div>
          <UploadDropzone label="Company logo placeholder" progress={38} />
        </div>
      ) : (
        <div className="grid gap-4 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-4">
          <UploadDropzone label="Resume upload placeholder" progress={42} />
          <EnterpriseCard title="Career Intelligence preview" description="Resume score, skill gaps, salary insights, and role recommendations unlock after profile setup." icon={<Sparkles size={18} />} />
        </div>
      )}
    </>
  );
}

function ForgotFields({ registerField, formErrors }: FieldProps) {
  return <Input label="Email" type="email" autoComplete="email" prefix={<Mail size={16} />} helperText="We will send reset instructions if the account exists." {...registerField("email")} error={formErrors.email?.message} />;
}

function ResetFields({ registerField, formErrors, password, passwordScore }: FieldProps & { password: string; passwordScore: PasswordScore }) {
  return (
    <>
      <Input label="Reset token" autoComplete="one-time-code" prefix={<LockKeyhole size={16} />} {...registerField("token")} error={formErrors.token?.message} />
      <PasswordInput label="New password" autoComplete="new-password" {...registerField("password")} error={formErrors.password?.message} />
      <PasswordStrength password={password} score={passwordScore} />
    </>
  );
}

function VerifyFields({ registerField, formErrors }: FieldProps) {
  return (
    <>
      <OtpPreview />
      <Input label="Verification token" autoComplete="one-time-code" prefix={<LockKeyhole size={16} />} helperText="Paste the token from your email. OTP boxes are UI-ready for future numeric codes." {...registerField("token")} error={formErrors.token?.message} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-career-button)] bg-[var(--cos-surface-container-low)] p-3 text-sm text-[var(--cos-on-surface-variant)]">
        <span>Resend available in 45s</span>
        <Button type="button" variant="ghost" size="sm">Open mail</Button>
      </div>
    </>
  );
}

function AuthStory({ mode }: { mode: AuthMode }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="hidden min-h-[calc(100vh-6rem)] items-center lg:flex relative rounded-[var(--radius-career-card)] overflow-hidden border border-[var(--cos-outline-variant)] bg-slate-950 p-8 text-white shadow-2xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(10,58,122,0.22),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.18),transparent_50%)]" />
      <div className="relative z-10 w-full">
        <div className="mb-6 flex items-center gap-3">
          <Image src="/images/logo-mark.png" alt="Jobs View logo" width={48} height={48} className="h-12 w-12 object-contain" />
          <div>
            <div className="text-xl font-extrabold text-white">Jobs <span className="text-[#F59E0B]">View</span></div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Your Career. Our Mission.</div>
          </div>
        </div>
        <AuthPill tone="premium">Jobs View Platform</AuthPill>
        <h2 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight xl:text-5xl bg-gradient-to-r from-[#F8FAFC] via-[#F59E0B] to-[#F8FAFC] bg-clip-text text-transparent">One secure identity for candidates, employers, and admins.</h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">{storyFor(mode)}</p>
        <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
          {[
            ["Verified companies", "12k+"],
            ["Career profiles", "4.8M"],
            ["Secure sessions", "99.9%"]
          ].map(([label, value]) => (
            <Card key={label} className="p-4 bg-white/5 border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-200">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#0A3A7A] via-[#F59E0B] to-[#F59E0B] bg-clip-text text-transparent">{value}</div>
              <div className="mt-1 text-sm text-slate-300">{label}</div>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
          {[
            ["Secure authentication", ShieldCheck],
            ["Google Jobs ready", Globe2],
            ["Career Intelligence", Sparkles],
            ["Privacy first", LockKeyhole],
            ["Employer verification", BadgeCheck],
            ["Enterprise RBAC", Users]
          ].map(([label, Icon]) => (
            <div key={label as string} className="flex items-center gap-3 rounded-[var(--radius-career-button)] border border-white/10 bg-white/5 backdrop-blur-md p-3 text-sm font-semibold text-slate-200 hover:border-white/20 transition-all duration-200">
              <Icon size={17} className="text-[#F59E0B]" />
              {label as string}
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}

function PasswordStrength({ password, score }: { password: string; score: PasswordScore }) {
  const checks = [
    ["Uppercase", /[A-Z]/.test(password)],
    ["Lowercase", /[a-z]/.test(password)],
    ["Number", /\d/.test(password)],
    ["Special", /[^A-Za-z0-9]/.test(password)],
    ["8+ characters", password.length >= 8]
  ];
  return (
    <div className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3" aria-live="polite">
      <div className="mb-2 flex items-center justify-between text-xs font-bold">
        <span>Password strength</span>
        <span className={score.className}>{score.label}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--cos-surface-container-high)]">
        <div className={cn("h-2 rounded-full transition-[width] duration-200", score.barClassName)} style={{ width: `${score.value}%` }} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {checks.map(([label, passed]) => (
          <div key={label as string} className="flex items-center gap-2 text-xs font-semibold text-[var(--cos-on-surface-variant)]">
            <CheckCircle2 size={14} className={passed ? "text-[var(--cos-success-text)]" : "text-[var(--cos-outline)]"} />
            {label as string}
          </div>
        ))}
      </div>
    </div>
  );
}

function OtpPreview() {
  return (
    <div className="grid grid-cols-6 gap-2" aria-label="OTP entry preview">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="grid h-12 place-items-center rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] text-lg font-bold">
          {index < 2 ? "•" : ""}
        </div>
      ))}
    </div>
  );
}

function SocialLogin() {
  return (
    <div className="mt-5 grid gap-3">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cos-on-surface-variant)]">
        <span className="h-px flex-1 bg-[var(--cos-outline-variant)]" />
        Or continue with
        <span className="h-px flex-1 bg-[var(--cos-outline-variant)]" />
      </div>
      <div className="grid gap-3 grid-cols-3">
        <Button type="button" variant="outline" className="w-full flex justify-center py-2 px-1">
          <GoogleLogo />
          <span className="hidden sm:inline ml-1.5 text-xs">Google</span>
        </Button>
        <Button type="button" variant="outline" className="w-full flex justify-center py-2 px-1">
          <LinkedInLogo />
          <span className="hidden sm:inline ml-1.5 text-xs">LinkedIn</span>
        </Button>
        <Button type="button" variant="outline" className="w-full flex justify-center py-2 px-1">
          <GitHubLogo />
          <span className="hidden sm:inline ml-1.5 text-xs">GitHub</span>
        </Button>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84C3.96 20.53 7.68 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.15C1.4 8.55 1 10.22 1 12s.4 3.45 1.15 4.94l3.69-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.68 1 3.96 3.47 2.15 7.06l3.69 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function LinkedInLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path fill="#0A66C2" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.1 20.45H3.54V9H7.1v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path fill="#181717" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18A10.94 10.94 0 0 1 12 6.02c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function AuthLinks({ mode, nextPath }: { mode: AuthMode; nextPath: string }) {
  const target = (path: string) => nextPath ? `${path}?next=${encodeURIComponent(nextPath)}` : path;
  return (
    <div className="mt-5 grid gap-3 text-sm">
      <div className="flex flex-wrap justify-center gap-3 text-[var(--cos-on-surface-variant)]">
        {mode !== "login" ? <a className={cn("rounded-full font-semibold hover:text-[var(--cos-primary)]", focusClass)} href={target("/login")}>Login</a> : null}
        {mode !== "register" ? <a className={cn("rounded-full font-semibold hover:text-[var(--cos-primary)]", focusClass)} href={target("/register")}>Register</a> : null}
        {mode !== "forgot" ? <a className={cn("rounded-full font-semibold hover:text-[var(--cos-primary)]", focusClass)} href={target("/forgot-password")}>Forgot password</a> : null}
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-xs text-[var(--cos-on-surface-variant)]">
        <a href="/employer-pending" className={cn("rounded-full hover:text-[var(--cos-primary)]", focusClass)}>Employer status</a>
        <a href="/unauthorized" className={cn("rounded-full hover:text-[var(--cos-primary)]", focusClass)}>Support</a>
        <a href="/privacy" className={cn("rounded-full hover:text-[var(--cos-primary)]", focusClass)}>Privacy</a>
        <a href="/terms" className={cn("rounded-full hover:text-[var(--cos-primary)]", focusClass)}>Terms</a>
      </div>
    </div>
  );
}

function Notice({ tone, title, description }: { tone: "success" | "danger"; title: string; description: string }) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} aria-live={tone === "danger" ? "assertive" : "polite"} className={cn("rounded-[var(--radius-career-button)] border p-3 text-sm", tone === "success" ? "border-emerald-200 bg-emerald-50 text-[var(--cos-success-text)] dark:border-emerald-900/70 dark:bg-emerald-950/40" : "border-red-200 bg-red-50 text-[var(--cos-error)] dark:border-red-900/70 dark:bg-red-950/40")}>
      <div className="font-bold">{title}</div>
      <div className="mt-1">{description}</div>
    </div>
  );
}

type FieldProps = {
  registerField: RegisterField;
  formErrors: Record<string, { message?: string } | undefined>;
};

type RegisterField = (name: string) => ReturnType<ReturnType<typeof useForm>["register"]>;

type PasswordScore = {
  value: number;
  label: string;
  className: string;
  barClassName: string;
};

function scorePassword(password: string): PasswordScore {
  const points = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length;
  if (points <= 1) return { value: password ? 20 : 0, label: "Weak", className: "text-[var(--cos-error)]", barClassName: "bg-[var(--cos-error)]" };
  if (points <= 3) return { value: 50, label: "Medium", className: "text-amber-700 dark:text-amber-300", barClassName: "bg-amber-500" };
  if (points === 4) return { value: 78, label: "Strong", className: "text-[var(--cos-success-text)]", barClassName: "bg-emerald-500" };
  return { value: 100, label: "Excellent", className: "text-[var(--cos-primary)]", barClassName: "bg-[var(--cos-primary)]" };
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

function titleFor(mode: AuthMode) {
  return {
    login: "Welcome back",
    register: "Create your Jobs View account",
    forgot: "Recover your password",
    reset: "Set a new password",
    verify: "Verify your email"
  }[mode];
}

function subtitleFor(mode: AuthMode) {
  return {
    login: "Access your candidate dashboard, employer workspace, or admin control center with one secure identity.",
    register: "Start as a candidate or register your company for verification without changing the existing Jobs View workflow.",
    forgot: "Enter your email and we will send secure recovery instructions through the configured backend flow.",
    reset: "Use your reset token and choose a strong password before returning to your workspace.",
    verify: "Confirm your email to keep Jobs View secure and unlock account workflows."
  }[mode];
}

function storyFor(mode: AuthMode) {
  return {
    login: "Fast access, secure sessions, role-aware redirects, and a premium experience for every Jobs View workspace.",
    register: "Candidate onboarding and employer verification share the same trust-first identity foundation.",
    forgot: "Recovery flows are calm, clear, and designed to reduce account anxiety without weakening security.",
    reset: "Password updates surface strength guidance while preserving the existing validation and backend contract.",
    verify: "Verification is designed for clarity across desktop and mobile, with future OTP-ready affordances."
  }[mode];
}

function eyebrowFor(mode: AuthMode) {
  return {
    login: "Secure login",
    register: "Guided onboarding",
    forgot: "Account recovery",
    reset: "Password reset",
    verify: "Email verification"
  }[mode];
}

function AuthPill({ tone = "neutral", className, children }: { tone?: "neutral" | "success" | "warning" | "danger" | "info" | "premium"; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-4",
        tone === "neutral" && "border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] text-[var(--cos-on-surface-variant)]",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-[var(--cos-success-text)] dark:border-emerald-900/70 dark:bg-emerald-950/40",
        tone === "warning" && "border-amber-200 bg-amber-50 text-[var(--cos-warning-text)] dark:border-amber-900/70 dark:bg-amber-950/40",
        tone === "danger" && "border-rose-200 bg-rose-50 text-[var(--cos-error-text)] dark:border-rose-900/70 dark:bg-rose-950/40",
        tone === "info" && "border-[#0A3A7A]/20 bg-[#0A3A7A]/10 text-[#0A3A7A] dark:border-[#60A5FA]/40 dark:bg-[#0A3A7A]/30 dark:text-[#93C5FD]",
        tone === "premium" && "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B] font-bold",
        className
      )}
    >
      {children}
    </span>
  );
}

function pillFor(mode: AuthMode) {
  return {
    login: "success",
    register: "premium",
    forgot: "info",
    reset: "warning",
    verify: "success"
  }[mode] as React.ComponentProps<typeof AuthPill>["tone"];
}

function ctaFor(mode: AuthMode) {
  return {
    login: "Login securely",
    register: "Create account",
    forgot: "Send reset link",
    reset: "Reset password",
    verify: "Verify email"
  }[mode];
}

function successFor(mode: AuthMode) {
  return {
    login: "",
    register: "",
    forgot: "Password reset instructions sent if the account exists.",
    reset: "Password reset successfully. You can login now.",
    verify: "Email verification request completed."
  }[mode];
}
