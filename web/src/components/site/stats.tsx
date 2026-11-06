"use client";

import { motion } from "framer-motion";

import { CountInView } from "@/components/ui/skiper-ui/skiper37";

const STATS = [
  { value: 43, suffix: "", label: "integrated apps" },
  { value: 2500, suffix: "+", label: "community modules" },
  { value: 120, suffix: "", label: "countries served" },
  { value: 99, suffix: ".9%", label: "uptime SLA" },
];

export function Stats() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
          Imagine a vast collection of business apps
          <span className="mt-2 block font-hand text-5xl font-bold tracking-normal text-teal sm:text-6xl">at your disposal.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-center text-lg text-muted-foreground">
          Got something to improve? There is an app for that. No complexity, no cost, just a one-click install.
        </p>
        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="glass rounded-3xl p-6 text-center sm:p-8"
            >
              <CountInView
                value={s.value}
                suffix={s.suffix}
                className="block text-4xl font-extrabold tracking-[-0.04em] text-primary sm:text-5xl"
              />
              <span className="mt-1 block text-sm text-muted-foreground sm:text-base">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
