"use client";

import { useState } from "react";
import { useSupportTicket } from "@career-os/hooks";
import { Button, Input } from "@career-os/ui";

export function SupportTicketForm() {
  const ticket = useSupportTicket();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await ticket.mutateAsync({ email, subject, message, ticket_type: "ticket" }).catch(() => undefined);
    if (!ticket.isError) {
      setSubject("");
      setMessage("");
    }
  };

  if (ticket.isSuccess) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-[var(--cos-success-text)] dark:border-emerald-900/70 dark:bg-emerald-950/40">
        Ticket submitted. We will follow up at {email} shortly.
        <button type="button" className="ml-3 font-bold underline" onClick={() => ticket.reset()}>
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Input label="Your email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
      <Input label="Subject" required value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Briefly describe the issue" />
      <label className="grid gap-1.5 text-sm font-semibold text-[var(--cos-on-surface)]">
        Message
        <textarea
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          placeholder="Include the affected URL, what you expected, and what happened. Never send a password or OTP."
          className="rounded-[var(--radius-career-input)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 py-2 text-sm leading-6 text-[var(--cos-on-surface)] outline-none placeholder:text-[var(--cos-outline)] hover:border-[var(--cos-border-hover)] focus:border-[var(--cos-border-focus)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--cos-primary-container)_28%,transparent)]"
        />
      </label>
      <Button type="submit" loading={ticket.isPending} disabled={ticket.isPending}>
        Submit ticket
      </Button>
    </form>
  );
}
