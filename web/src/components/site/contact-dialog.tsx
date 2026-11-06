"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, X } from "lucide-react";
import React from "react";

import { createLead } from "@/lib/api";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "ok" } | { kind: "error"; message: string };

const field =
  "w-full rounded-xl border border-[var(--glass-border)] bg-[var(--card)] px-3.5 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/25 aria-[invalid=true]:border-destructive";

export function ContactDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [status, setStatus] = React.useState<Status>({ kind: "idle" });
  const [invalid, setInvalid] = React.useState<{ name?: boolean; email?: boolean }>({});
  const firstInput = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setStatus({ kind: "idle" });
    setInvalid({});
    const t = window.setTimeout(() => firstInput.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const bad = { name: !data.name?.trim(), email: !EMAIL_RE.test(data.email?.trim() ?? "") };
    setInvalid(bad);
    if (bad.name || bad.email) {
      setStatus({ kind: "error", message: "Please enter your name and a valid email." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      await createLead({ name: data.name, email: data.email, company: data.company, message: data.message });
      setStatus({ kind: "ok" });
      form.reset();
    } catch (err) {
      setStatus({ kind: "error", message: `Could not send: ${(err as Error).message}` });
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-lenis-prevent
        >
          <button aria-label="Close" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.97, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="glass-strong relative w-full max-w-md rounded-[1.75rem] p-7 sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            {status.kind === "ok" ? (
              <div className="py-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                  <CheckCircle2 className="mx-auto size-14 text-teal" />
                </motion.div>
                <h3 className="mt-4 text-2xl font-bold">Thanks, message sent!</h3>
                <p className="mt-2 text-muted-foreground">Our team will get back to you shortly.</p>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                onInput={() => {
                  if (status.kind === "error") setStatus({ kind: "idle" });
                  if (invalid.name || invalid.email) setInvalid({});
                }}
                noValidate
                className="grid gap-3.5"
              >
                <h3 id="contact-title" className="text-2xl font-bold tracking-tight">
                  Let&apos;s talk
                </h3>
                <p className="-mt-2 mb-1 text-muted-foreground">Tell us what you need and we&apos;ll get back to you.</p>
                <label className="grid gap-1.5 text-sm font-semibold">
                  Full name
                  <input ref={firstInput} name="name" autoComplete="name" maxLength={120} aria-invalid={invalid.name} className={field} />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold">
                  Work email
                  <input name="email" type="email" autoComplete="email" maxLength={200} aria-invalid={invalid.email} className={field} />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold">
                  Company
                  <input name="company" autoComplete="organization" maxLength={120} className={field} />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold">
                  What do you need?
                  <textarea name="message" rows={3} maxLength={2000} className={cn(field, "resize-y")} />
                </label>
                <p role="status" className={cn("min-h-5 text-sm", status.kind === "error" && "text-destructive")}>
                  {status.kind === "error" ? status.message : ""}
                </p>
                <button
                  type="submit"
                  disabled={status.kind === "sending"}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground shadow-[0_12px_30px_-12px_var(--primary)] transition hover:brightness-110 disabled:opacity-60"
                >
                  {status.kind === "sending" && <Loader2 className="size-4 animate-spin" />}
                  Send message
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
