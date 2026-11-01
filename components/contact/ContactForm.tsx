"use client";

import { AnimatePresence, m } from "framer-motion";
import { useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { INTENTS, YEARS, type ContactIntent } from "@/lib/contact-options";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<string, string>>;
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; name: string; intent: ContactIntent } | { kind: "error"; message: string };

const SUCCESS: Record<ContactIntent, string> = {
  join: "Application sent",
  collaborate: "Message sent",
  sponsor: "Message sent",
  question: "Question sent",
};

export function ContactForm({ recruitingOpen, responseTime, email }: { recruitingOpen: boolean; responseTime: string; email: string }) {
  const [intent, setIntent] = useState<ContactIntent>(recruitingOpen ? "join" : "question");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [touched, setTouched] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();

  const read = () => {
    const fd = new FormData(formRef.current!);
    const data: Record<string, string> = { intent };
    fd.forEach((v, k) => {
      // Empty fields are kept as "" so the schema's own messages ("Enter your name.") apply.
      if (typeof v === "string") data[k] = v;
    });
    return data;
  };

  // zod is loaded the first time someone validates, not on page load.
  const validate = async () => {
    const { ContactSchema } = await import("@/lib/contact-schema");
    const result = ContactSchema.safeParse(read());
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const next: Errors = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      if (!next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const data = await validate();
    if (!data) {
      // Move focus to the first invalid field so keyboard and screen-reader users land on it.
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(read()),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "The message didn’t go through.");
      setStatus({ kind: "sent", name: data.name.split(" ")[0] ?? data.name, intent: data.intent });
      formRef.current?.reset();
      setTouched(false);
    } catch (err) {
      setStatus({ kind: "error", message: (err as Error).message });
    }
  };

  const field = (name: string) => ({
    id: `${uid}-${name}`,
    name,
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-error` : undefined,
    onBlur: touched ? () => void validate() : undefined,
    className: cn(
      "w-full rounded-card border bg-void/60 px-4 py-3 text-ink placeholder:text-ink-faint transition-colors focus:outline-none focus-visible:outline-none focus:border-cyan/60 focus:ring-2 focus:ring-cyan/20",
      errors[name] ? "border-red-400/60" : "border-white/10 hover:border-white/20",
    ),
  });

  const label = (name: string, text: string, optional?: boolean) => (
    <label htmlFor={`${uid}-${name}`} className="mb-2 block text-sm text-ink-muted">
      {text}
      {optional ? <span className="text-ink-faint"> (optional)</span> : null}
    </label>
  );
  const error = (name: string) =>
    errors[name] ? (
      <p id={`${uid}-${name}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-red-300">
        <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="glass relative overflow-hidden rounded-surface p-1">
      <div className="rounded-[24px] bg-void/50 p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {status.kind === "sent" ? (
            <m.div
              key="sent"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[420px] flex-col items-center justify-center text-center"
              role="status"
            >
              <m.svg viewBox="0 0 52 52" className="h-16 w-16" aria-hidden>
                <m.circle cx="26" cy="26" r="24" fill="none" stroke="url(#ok)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                <m.path d="M15 27l7 7 15-16" fill="none" stroke="#ededf2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.45, duration: 0.4 }} />
                <defs>
                  <linearGradient id="ok" x1="0" y1="0" x2="52" y2="52">
                    <stop stopColor="#22d3ee" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </m.svg>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-ink">{SUCCESS[status.intent]}</h3>
              <p className="mt-2 max-w-sm text-ink-muted">
                Thanks, {status.name}. We reply within {responseTime}. Keep an eye on your inbox, including spam.
              </p>
              <button type="button" onClick={() => setStatus({ kind: "idle" })} className="mt-8 text-sm text-cyan underline underline-offset-4">
                Send another message
              </button>
            </m.div>
          ) : (
            <m.form key="form" ref={formRef} onSubmit={onSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <fieldset>
                <legend className="mb-3 text-sm text-ink-muted">What can we help with?</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {INTENTS.map((opt) => {
                    const disabled = opt.id === "join" && !recruitingOpen;
                    return (
                      <label
                        key={opt.id}
                        className={cn(
                          "relative cursor-pointer rounded-card border px-3 py-2.5 text-center text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan",
                          intent === opt.id ? "border-cyan/50 bg-cyan/10 text-ink" : "border-white/10 text-ink-muted hover:border-white/25",
                          disabled && "cursor-not-allowed opacity-40",
                        )}
                      >
                        <input
                          type="radio"
                          name="intent-choice"
                          value={opt.id}
                          checked={intent === opt.id}
                          disabled={disabled}
                          onChange={() => {
                            setIntent(opt.id);
                            setErrors({});
                          }}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
                {!recruitingOpen ? <p className="mt-2 text-xs text-ink-faint">Applications are closed right now; we’ll reopen next semester.</p> : null}
              </fieldset>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  {label("name", "Your name")}
                  <input {...field("name")} autoComplete="name" />
                  {error("name")}
                </div>
                <div>
                  {label("email", "Email")}
                  <input {...field("email")} type="email" autoComplete="email" inputMode="email" />
                  {error("email")}
                </div>

                {intent === "join" ? (
                  <>
                    <div>
                      {label("year", "Year")}
                      <select {...field("year")} className={cn(field("year").className, "select-styled")} defaultValue="">
                        <option value="" disabled>
                          Choose your year
                        </option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                      {error("year")}
                    </div>
                    <div>
                      {label("branch", "Branch or department")}
                      <input {...field("branch")} placeholder="Computer Science" />
                      {error("branch")}
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2">
                    {label("organisation", "Organisation", true)}
                    <input {...field("organisation")} autoComplete="organization" />
                    {error("organisation")}
                  </div>
                )}

                <div className="sm:col-span-2">
                  {label("message", intent === "join" ? "What would you like to build or learn?" : "Your message")}
                  <textarea {...field("message")} rows={5} className={cn(field("message").className, "resize-y")} />
                  {error("message")}
                </div>

                {/* Honeypot: hidden from people, irresistible to bots. */}
                <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label htmlFor={`${uid}-website`}>Leave this empty</label>
                  <input id={`${uid}-website`} name="website" tabIndex={-1} autoComplete="off" />
                </div>
              </div>

              {status.kind === "error" ? (
                <p role="alert" className="mt-5 rounded-card border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {status.message}
                  {status.message.includes(email) ? null : (
                    <>
                      {" "}
                      You can also email us at{" "}
                      <a href={`mailto:${email}`} className="underline underline-offset-4">
                        {email}
                      </a>
                      .
                    </>
                  )}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-ink-faint">We reply within {responseTime}.</p>
                <button
                  type="submit"
                  disabled={status.kind === "sending"}
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(110deg,#22d3ee,#5b5bf6_50%,#8b5cf6)] px-6 py-3 text-sm font-semibold text-void shadow-[0_10px_40px_-12px_rgba(91,91,246,0.8)] transition-opacity disabled:opacity-60"
                >
                  {status.kind === "sending" ? "Sending…" : intent === "join" ? "Send application" : "Send message"}
                </button>
              </div>
            </m.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
