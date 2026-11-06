"use client";

import { motion } from "framer-motion";

import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { Magnetic } from "@/components/animate-ui/primitives/effects/magnetic";
import { GradientText } from "@/components/animate-ui/primitives/texts/gradient";
import { Link002 } from "@/components/ui/skiper-ui/skiper40";

import { Logo } from "./logo";
import { useContact } from "./providers";

export function Cta() {
  const { open } = useContact();
  return (
    <section className="px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="glass relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] px-6 py-20 text-center"
      >
        <div aria-hidden className="absolute -left-20 -top-20 size-72 rounded-full bg-primary/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 -right-16 size-80 rounded-full bg-teal/25 blur-3xl" />
        <h2 className="relative text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">
          <GradientText
            text="Unleash your growth potential"
            gradient="linear-gradient(90deg, var(--foreground) 0%, var(--primary) 30%, var(--teal) 50%, var(--primary) 70%, var(--foreground) 100%)"
          />
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
          Join thousands of companies running their business on Orbita.
        </p>
        <div className="relative mt-9 flex justify-center">
          <Magnetic strength={0.4}>
            <LiquidButton
              onClick={open}
              className="h-14 rounded-2xl px-9 text-base font-semibold text-primary-foreground [--liquid-button-background-color:var(--primary)] [--liquid-button-color:var(--teal)] hover:text-white"
            >
              Talk to our team
            </LiquidButton>
          </Magnetic>
        </div>
      </motion.div>
    </section>
  );
}

const COLUMNS = {
  Community: ["Tutorials", "Documentation", "Forum", "Events"],
  "Open Source": ["Download", "GitHub", "Translations"],
  Services: ["Hosting", "Support", "Upgrade", "Partners"],
  "About us": ["Our company", "Brand assets", "Jobs", "Contact us"],
};

export function Footer() {
  return (
    <footer className="px-4 pb-8">
      <div className="glass mx-auto max-w-6xl rounded-[2rem] px-6 py-12 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">All your business, beautifully connected.</p>
          </div>
          {Object.entries(COLUMNS).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-bold">{title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {links.map((l) => (
                  <li key={l}>
                    <Link002 href="#" className="w-fit hover:text-foreground">
                      {l}
                    </Link002>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-[var(--glass-border)] pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Orbita. Demo project.</span>
          <span>
            Components from{" "}
            <a className="underline underline-offset-2 hover:text-foreground" href="https://skiper-ui.com" target="_blank" rel="noreferrer">
              Skiper UI
            </a>{" "}
            and{" "}
            <a className="underline underline-offset-2 hover:text-foreground" href="https://animate-ui.com" target="_blank" rel="noreferrer">
              Animate UI
            </a>
            . Built with Next.js, Go & Flutter.
          </span>
        </div>
      </div>
    </footer>
  );
}
