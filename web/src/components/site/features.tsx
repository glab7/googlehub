"use client";

import { useScroll } from "framer-motion";
import { Check } from "lucide-react";
import React from "react";

import { LinePath } from "@/components/ui/skiper-ui/skiper19";
import { StickyStack } from "@/components/ui/skiper-ui/skiper17";

type Feature = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  points: string[];
  visual: React.ReactNode;
};

function Kanban() {
  const cols = [
    { name: "New", cards: ["#e05d5d", "#2f9ec4", "#e0a43b"] },
    { name: "Qualified", cards: ["#8b5cc4", "#e05d5d"] },
    { name: "Won", cards: ["#3fa66b", "#2f9ec4", "#8b5cc4"] },
  ];
  return (
    <div className="grid h-full grid-cols-3 gap-3 p-4">
      {cols.map((c) => (
        <div key={c.name} className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-muted-foreground">{c.name}</span>
          {c.cards.map((color, i) => (
            <div key={i} className="glass h-14 rounded-xl border-l-4" style={{ borderLeftColor: color }}>
              <div className="m-3 h-2 w-2/3 rounded bg-foreground/15" />
              <div className="mx-3 h-2 w-1/3 rounded bg-foreground/10" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Bars() {
  const h = [42, 64, 38, 76, 58, 90, 70];
  return (
    <div className="flex h-full items-end gap-[4%] bg-[linear-gradient(var(--border)_1px,transparent_1px)] bg-[length:100%_25%] px-[8%] pb-6 pt-10">
      {h.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-lg"
          style={{
            height: `${v}%`,
            background: i % 2 ? "linear-gradient(180deg, var(--primary), transparent)" : "linear-gradient(180deg, var(--teal), transparent)",
          }}
        />
      ))}
    </div>
  );
}

function Flow() {
  const nodes = [
    { label: "Sale", color: "var(--primary)" },
    { label: "Stock", color: "#e0a43b" },
    { label: "Invoice", color: "var(--teal)" },
  ];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] bg-[length:18px_18px] sm:flex-row">
      {nodes.map((n, i) => (
        <React.Fragment key={n.label}>
          <span className="rounded-xl px-5 py-3 font-bold text-white shadow-lg" style={{ background: n.color }}>
            {n.label}
          </span>
          {i < nodes.length - 1 && (
            <span className="h-6 w-0.5 animate-pulse bg-gradient-to-b from-muted-foreground to-transparent sm:h-0.5 sm:w-10 sm:bg-gradient-to-r" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

const FEATURES: Feature[] = [
  {
    id: "integrated",
    kicker: "Fully integrated",
    title: "One database. Zero copy-paste.",
    body: "A sale updates inventory, inventory triggers purchase, purchase lands in accounting. Every app talks to every other app, out of the box.",
    points: ["Real-time data across departments", "No connectors to maintain", "Single sign-on for everything"],
    visual: <Kanban />,
  },
  {
    id: "ux",
    kicker: "Delightful UX",
    title: "Software your team actually enjoys.",
    body: "Clean screens, smart defaults and keyboard shortcuts everywhere. Onboarding takes hours, not months.",
    points: ["Drag-and-drop everything", "Works great on mobile", "Built-in guided tours"],
    visual: <Bars />,
  },
  {
    id: "open",
    kicker: "Open & extensible",
    title: "Grows with you, not against you.",
    body: "Start with one app and add more as you need them. Customize fields, automate workflows, or build your own modules on an open API.",
    points: ["No-code studio for custom fields", "REST & webhooks", "Self-host or cloud"],
    visual: <Flow />,
  },
];

function FeatureCard({ f, index }: { f: Feature; index: number }) {
  return (
    <article className="glass-strong flex h-full flex-col justify-center gap-6 overflow-hidden rounded-[2rem] p-6 sm:p-10 md:grid md:grid-cols-2 md:items-center">
      <div>
        <span className="font-mono text-xs text-muted-foreground">0{index + 1} / 0{FEATURES.length}</span>
        <span className="ml-3 inline-block rounded-md bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
          {f.kicker}
        </span>
        <h3 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl">{f.title}</h3>
        <p className="mt-3 text-muted-foreground sm:text-lg">{f.body}</p>
        <ul className="mt-5 hidden space-y-2.5 sm:block">
          {f.points.map((p) => (
            <li key={p} className="flex items-center gap-3 font-medium">
              <span className="grid size-5 place-items-center rounded-full bg-teal text-white">
                <Check className="size-3" strokeWidth={3.5} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="glass h-48 overflow-hidden rounded-2xl sm:h-72">
        <div className="flex gap-1.5 border-b border-[var(--glass-border)] bg-primary/80 px-4 py-3">
          <i className="size-2.5 rounded-full bg-white/50" />
          <i className="size-2.5 rounded-full bg-white/50" />
          <i className="size-2.5 rounded-full bg-white/50" />
        </div>
        <div className="h-[calc(100%-2.25rem)]">{f.visual}</div>
      </div>
    </article>
  );
}

export function Features() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });

  return (
    <section id="features" ref={ref} className="relative">
      {/* Skiper19: a stroke that draws itself as the section scrolls. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden text-primary/25">
        <LinePath className="absolute -right-[30%] top-0 h-full w-auto" scrollYProgress={scrollYProgress} />
      </div>
      <div className="relative px-4 pt-24 text-center">
        <h2 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
          Level up your <span className="text-gradient">quality of work</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Built for real teams: fast to learn, delightful to use, and connected end-to-end.
        </p>
      </div>
      {/* Skiper17 (GSAP ScrollTrigger): cards pin and stack as you scroll. */}
      <StickyStack items={FEATURES.map((f, i) => ({ id: f.id, content: <FeatureCard f={f} index={i} /> }))} />
    </section>
  );
}
