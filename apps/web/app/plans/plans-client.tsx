"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, IndianRupee, LockKeyhole, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { appConfig } from "@career-os/config";
import { useCandidatePlans, useCandidateSubscription, useSession, useSubscriptionActions } from "@career-os/hooks";
import { apiErrorMessage, type CandidateCheckout, type CandidatePlan } from "@career-os/shared";
import { Badge, Button, Card, EmptyState, Input, SkeletonCard } from "@career-os/ui";
import { cn } from "@career-os/utils";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void; on: (event: string, callback: (response: unknown) => void) => void };
  }
}

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { email: string };
  theme: { color: string };
  handler: (response: RazorpaySuccess) => void;
  modal: { ondismiss: () => void };
};

const featureLabels: Record<string, string> = {
  saved_jobs: "Save and organize jobs",
  application_tracking: "Track every application",
  career_guidance: "Career guidance library",
  education: "Education and learning resources",
  resume_builder: "Resume builder",
  resume_checks: "Resume checks and improvement tips",
  interview_prep: "Role-specific interview preparation",
  salary_insights: "Advanced salary insights",
  support: "Email support"
};

export function PlansClient({ job, next, initialPlan }: { job?: string; next?: string; initialPlan?: string }) {
  const plans = useCandidatePlans();
  const session = useSession();
  const subscription = useCandidateSubscription(Boolean(session.data?.id && session.data.role === "JOB_SEEKER"));
  const actions = useSubscriptionActions();
  const [selected, setSelected] = useState(initialPlan === "premium" ? "premium" : "basic");
  const [checkoutID, setCheckoutID] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportStatus, setSupportStatus] = useState("");
  const nextPath = safeNext(next || (job ? `/jobs/${job}?apply=1` : "/candidate"));
  const selectedPlan = useMemo(() => plans.data?.find((plan) => plan.slug === selected), [plans.data, selected]);

  if (plans.isPending) {
    return <main className="mx-auto grid min-h-screen max-w-6xl gap-5 p-4 py-12 sm:grid-cols-2 sm:p-8"><SkeletonCard lines={8} /><SkeletonCard lines={8} /></main>;
  }
  if (plans.isError || !plans.data?.length) {
    return <main className="grid min-h-screen place-items-center bg-[var(--cos-surface)] p-4"><EmptyState title="Plans are unavailable" description="Candidate plans could not be loaded. You can continue browsing jobs and retry later." action={<div className="flex gap-3"><Button onClick={() => void plans.refetch()}>Retry</Button><a href="/jobs"><Button variant="outline">Browse jobs</Button></a></div>} /></main>;
  }

  async function continueWithPlan(plan: CandidatePlan) {
    setSelected(plan.slug);
    setError("");
    setStatus("");
    const currentSession = session.data ?? (await session.refetch()).data;
    if (!currentSession) {
      const returnPath = `/plans?selected=${encodeURIComponent(plan.slug)}${job ? `&job=${encodeURIComponent(job)}` : ""}&next=${encodeURIComponent(nextPath)}`;
      window.location.href = `/login?next=${encodeURIComponent(returnPath)}`;
      return;
    }
    if (currentSession.role !== "JOB_SEEKER") {
      setError("A candidate account is required to purchase a candidate plan.");
      return;
    }
    try {
      const result = await actions.startOtp.mutateAsync({ plan_slug: plan.slug, next: nextPath });
      setCheckoutID(result.checkout_id);
      setMaskedEmail(result.email_masked);
      setStatus(`A 6 digit code was sent to ${result.email_masked}.`);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function verifyAndPay() {
    if (!checkoutID || otp.length !== 6 || paying) return;
    setError("");
    setStatus("Verifying your code...");
    setPaying(true);
    try {
      const checkout = await actions.verifyOtp.mutateAsync({ checkout_id: checkoutID, otp });
      await openRazorpay(checkout, async (payment) => {
        setStatus("Confirming payment securely...");
        try {
          const result = await actions.verifyPayment.mutateAsync({ checkout_id: checkout.checkout_id, ...payment });
          setStatus("Plan activated. Opening your selected page...");
          window.location.href = safeNext(result.next || nextPath);
        } catch (err) {
          setError(apiErrorMessage(err));
          setStatus("Payment confirmation is pending. You can retry without paying again.");
          setPaying(false);
        }
      }, () => {
        setStatus("Payment window closed. No plan was activated.");
        setPaying(false);
      }, () => {
        setError("Payment failed or was declined. Please retry with another payment method.");
        setStatus("");
        setPaying(false);
      });
    } catch (err) {
      setError(apiErrorMessage(err));
      setStatus("");
      setPaying(false);
    }
  }

  async function requestSupport() {
    if (supportSubject.trim().length < 3 || supportMessage.trim().length < 10 || actions.support.isPending) return;
    setSupportStatus("");
    try {
      const result = await actions.support.mutateAsync({ subject: supportSubject.trim(), message: supportMessage.trim() });
      setSupportStatus(`Support request created with ${result.priority} priority.`);
      setSupportSubject("");
      setSupportMessage("");
    } catch (err) {
      setSupportStatus(apiErrorMessage(err));
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-[var(--cos-surface)] text-[var(--cos-on-surface)]">
      <section className="border-b border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)]">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 lg:px-8">
          <Badge tone="premium"><Sparkles size={13} /> Simple 30-day plans</Badge>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold sm:text-5xl">Choose the support you need for your job search.</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[var(--cos-on-surface-variant)]">Browse jobs freely. A plan is required only when you apply or unlock complete career, education, interview, and resume tools.</p>
          <div className="mt-4 text-sm font-semibold text-[var(--cos-primary)]">One payment. 30 days. No automatic renewal.</div>
        </div>
      </section>

      {subscription.data?.active ? <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8"><Card className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="font-bold">{subscription.data.plan?.name} is active</div><div className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">{subscription.data.applications_remaining == null ? "Unlimited applications" : `${subscription.data.applications_remaining} applications remaining`} until {formatDate(subscription.data.ends_at)}.</div></div><a href={nextPath}><Button>Continue</Button></a></div></Card></section> : null}

      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-8 sm:px-6 md:grid-cols-2 lg:px-8">
        {plans.data.map((plan) => {
          const premium = plan.slug === "premium";
          const features = planFeatures(plan);
          return <Card key={plan.slug} className={cn("flex flex-col border-2 p-5 sm:p-6", premium ? "border-[var(--cos-secondary)]" : "border-[var(--cos-primary)]", selected === plan.slug && "ring-2 ring-[var(--cos-focus-ring)]")}>
            <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-bold">{plan.name}</h2>{premium ? <Badge tone="featured">Most support</Badge> : <Badge>For active search</Badge>}</div>
            <div className="mt-5 flex items-end gap-2"><IndianRupee size={24} className="mb-1 text-[var(--cos-primary)]" /><span className="text-4xl font-extrabold">{plan.price_paise / 100}</span><span className="mb-1 text-sm text-[var(--cos-on-surface-variant)]">final price</span></div>
            <p className="mt-3 text-sm leading-6 text-[var(--cos-on-surface-variant)]">{premium ? "Complete job-search, resume, interview, salary, and learning support." : "Essential tools and up to 10 job applications for one focused month."}</p>
            <div className="mt-6 grid gap-3">{features.map((feature) => <div key={feature} className="flex items-start gap-2 text-sm font-semibold"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />{feature}</div>)}</div>
            <Button className="mt-8" variant={premium ? "gradient" : "primary"} loading={actions.startOtp.isPending && selected === plan.slug} disabled={actions.startOtp.isPending || paying} onClick={() => void continueWithPlan(plan)}><Zap size={16} /> Choose {plan.name}</Button>
          </Card>;
        })}
      </section>

      {checkoutID ? <section className="mx-auto max-w-2xl px-4 pb-12 sm:px-6"><Card className="border-2 border-[var(--cos-primary)]"><div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--cos-primary)] text-white"><ShieldCheck size={18} /></div><div><h2 className="text-xl font-bold">Confirm your account email</h2><p className="mt-1 text-sm text-[var(--cos-on-surface-variant)]">Enter the code sent to {maskedEmail}. Payment opens only after verification.</p></div></div><form className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={(event) => { event.preventDefault(); void verifyAndPay(); }}><Input label="6 digit OTP" inputMode="numeric" autoComplete="one-time-code" prefix={<LockKeyhole size={16} />} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} required disabled={paying} /><Button className="self-end" type="submit" loading={paying} disabled={otp.length !== 6 || paying}>Verify and pay</Button></form>{status ? <div role="status" aria-live="polite" className="mt-4 rounded-md bg-blue-50 p-3 text-sm font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">{status}</div> : null}{error ? <div role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</div> : null}</Card></section> : null}

      {subscription.data?.active ? <section className="mx-auto max-w-2xl px-4 pb-12 sm:px-6"><Card><h2 className="text-xl font-bold">Candidate support</h2><p className="mt-1 text-sm leading-6 text-[var(--cos-on-surface-variant)]">Send a question to the Jobs View support team. This is email or ticket support, not live coaching or a placement guarantee.</p><form className="mt-5 grid gap-4" onSubmit={(event) => { event.preventDefault(); void requestSupport(); }}><Input label="Subject" value={supportSubject} onChange={(event) => setSupportSubject(event.target.value)} minLength={3} maxLength={255} required /><label className="grid gap-2 text-sm font-semibold">Message<textarea className="min-h-32 rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-3 font-normal outline-none focus:border-[var(--cos-primary)] focus:ring-2 focus:ring-[var(--cos-focus-ring)]" value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} minLength={10} maxLength={4000} required /></label><Button type="submit" loading={actions.support.isPending} disabled={actions.support.isPending || supportSubject.trim().length < 3 || supportMessage.trim().length < 10}>Send support request</Button></form>{supportStatus ? <div role="status" aria-live="polite" className="mt-4 rounded-md bg-[var(--cos-surface-container-low)] p-3 text-sm font-semibold">{supportStatus}</div> : null}</Card></section> : null}
    </main>
  );
}

function planFeatures(plan: CandidatePlan) {
  const labels = Object.entries(plan.entitlements).filter(([, value]) => Boolean(value)).map(([key, value]) => {
    const label = featureLabels[key] ?? key.replace(/_/g, " ");
    if (typeof value === "string") return `${label}: ${value}`;
    return label;
  });
  labels.unshift(plan.application_limit ? `${plan.application_limit} successful job applications` : "Unlimited job applications");
  return labels;
}

function safeNext(value?: string) {
  const next = value?.trim() || "/candidate";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/candidate";
}

function formatDate(value?: string) {
  if (!value) return "the plan expiry date";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

async function loadRazorpay() {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-jobs-view-razorpay="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Razorpay checkout failed to load.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.jobsViewRazorpay = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay checkout failed to load."));
    document.head.appendChild(script);
  });
}

async function openRazorpay(checkout: CandidateCheckout, success: (response: RazorpaySuccess) => void, dismissed: () => void, failed: () => void) {
  await loadRazorpay();
  if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable.");
  const key = checkout.razorpay_key_id || appConfig.razorpayKeyId;
  if (!key) throw new Error("Razorpay key ID is not configured.");
  const instance = new window.Razorpay({ key, amount: checkout.amount_paise, currency: checkout.currency, name: "Jobs View", description: `${checkout.plan_name} candidate plan`, order_id: checkout.razorpay_order_id, prefill: { email: checkout.email }, theme: { color: "#0A3A7A" }, handler: success, modal: { ondismiss: dismissed } });
  instance.on("payment.failed", failed);
  instance.open();
}
