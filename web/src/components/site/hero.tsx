"use client";

import { animate, createScope, stagger, type Scope } from "animejs";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React from "react";

import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { Magnetic } from "@/components/animate-ui/primitives/effects/magnetic";
import { ShimmeringText } from "@/components/animate-ui/primitives/texts/shimmering";
import { TypingText, TypingTextCursor } from "@/components/animate-ui/primitives/texts/typing";
import { CursorGlow } from "@/components/ui/skiper-ui/skiper61";
import { catalog } from "@/lib/catalog";

import { AppGlyph } from "./app-icon";
import { useContact } from "./providers";

// Glass app tiles floating around the headline (desktop only), as
// [appId, left %, top %, size px].
const ORBS: [string, number, number, number][] = [
  ["crm", 6, 24, 72],
  ["accounting", 14, 58, 84],
  ["inventory", 3, 82, 60],
  ["website", 26, 16, 56],
  ["helpdesk", 22, 86, 52],
  ["sales", 88, 22, 76],
  ["project", 80, 52, 88],
  ["emailmkt", 93, 76, 58],
  ["employees", 72, 88, 54],
  ["pos", 70, 18, 52],
];

const appsById = new Map(catalog.apps.map((a) => [a.id, a]));

const LINE_1 = "Every business app.";
const LINE_2 = "One platform.";
const CHAR_MS = 75;
const START_MS = 500;
const LINE_GAP_MS = 350;
const LINE_2_START = START_MS + LINE_1.length * CHAR_MS + LINE_GAP_MS;
const TYPING_DONE = LINE_2_START + LINE_2.length * CHAR_MS;

// One typed line: an invisible copy reserves the final width so the centred
// layout never shifts while Animate UI's TypingText fills it in.
function TypedLine({
  text,
  delay,
  showCursor,
  className,
}: {
  text: string;
  delay: number;
  showCursor: boolean;
  className?: string;
}) {
  return (
    <span className="relative inline-grid">
      <span className="invisible col-start-1 row-start-1">{text}</span>
      <TypingText text={text} delay={delay} duration={CHAR_MS} className={`col-start-1 row-start-1 text-left ${className ?? ""}`}>
        {showCursor && (
          <TypingTextCursor
            className="ml-1 bg-teal"
            style={{ width: "0.06em", height: "0.8em", transform: "translateY(0.08em)", backgroundColor: "var(--teal)" }}
          />
        )}
      </TypingText>
    </span>
  );
}

// "Every business app. One platform." in handwriting, typed letter by letter;
// the marker sweeps behind line 2 once typing finishes.
function HandwrittenHeadline() {
  const reduce = useReducedMotion();
  const [line, setLine] = React.useState<1 | 2>(1);

  React.useEffect(() => {
    const t = window.setTimeout(() => setLine(2), LINE_2_START);
    return () => window.clearTimeout(t);
  }, []);

  const base = "font-hand text-[3.25rem] font-bold leading-[1.05] tracking-normal sm:text-8xl lg:text-[7.5rem]";

  if (reduce) {
    return (
      <h1 className={base}>
        <span className="text-gradient">{LINE_1}</span>
        <br />
        <span className="rounded-2xl bg-[linear-gradient(100deg,color-mix(in_oklab,var(--marker)_85%,transparent),color-mix(in_oklab,var(--teal)_35%,transparent))] px-4">
          {LINE_2}
        </span>
      </h1>
    );
  }

  return (
    <h1 className={base} aria-label={`${LINE_1} ${LINE_2}`}>
      <span aria-hidden>
        <TypedLine text={LINE_1} delay={START_MS} showCursor={line === 1} className="text-gradient pb-[0.12em]" />
        <br />
        <motion.span
          className="inline-block rounded-2xl px-4"
          initial={{ backgroundSize: "0% 100%" }}
          animate={{ backgroundSize: "100% 100%" }}
          transition={{ delay: TYPING_DONE / 1000, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          style={{
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left center",
            backgroundImage:
              "linear-gradient(100deg, color-mix(in oklab, var(--marker) 85%, transparent), color-mix(in oklab, var(--teal) 35%, transparent))",
          }}
        >
          <TypedLine text={LINE_2} delay={LINE_2_START} showCursor={line === 2} />
        </motion.span>
      </span>
    </h1>
  );
}

export function Hero() {
  const { open } = useContact();
  const root = React.useRef<HTMLDivElement>(null);

  // Anime.js: elastic staggered entrance from the centre, then an endless,
  // offset float so the tiles never move in lockstep.
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scope: Scope = createScope({ root }).add(() => {
      animate(".hero-orb", {
        scale: [0, 1],
        opacity: [0, 1],
        rotate: [() => (Math.random() - 0.5) * 60, 0],
        delay: stagger(80, { from: "center", start: 500 }),
        duration: 1400,
        ease: "outElastic(1, .6)",
      });
      animate(".hero-orb-inner", {
        y: () => [0, -10 - Math.random() * 18],
        x: () => [0, (Math.random() - 0.5) * 16],
        rotate: () => [0, (Math.random() - 0.5) * 10],
        duration: () => 2600 + Math.random() * 1800,
        delay: stagger(140),
        loop: true,
        alternate: true,
        ease: "inOutSine",
      });
    });
    return () => scope.revert();
  }, []);

  return (
    <CursorGlow className="relative overflow-hidden">
      <section id="top" ref={root} className="relative flex min-h-[92vh] items-center justify-center px-4 pb-16 pt-32">
        <div aria-hidden className="absolute inset-0 hidden lg:block">
          {ORBS.map(([id, left, top, size]) => {
            const app = appsById.get(id);
            if (!app) return null;
            return (
              <div
                key={id}
                className="hero-orb absolute opacity-0"
                style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
              >
                <div className="hero-orb-inner glass grid size-full place-items-center rounded-[28%]">
                  <AppGlyph app={app} className="size-[55%]" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
          >
            <span className="size-2 rounded-full bg-teal shadow-[0_0_12px_var(--teal)]" />
            <ShimmeringText
              text="43 apps · one login · zero glue code"
              color="var(--muted-foreground)"
              shimmeringColor="var(--foreground)"
              duration={1.2}
            />
          </motion.div>

          <HandwrittenHeadline />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mt-7 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Simple to start, powerful as you grow, <span className="font-semibold text-foreground">priced like it should be.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Magnetic strength={0.35} range={140}>
              <LiquidButton
                onClick={open}
                className="h-14 rounded-2xl px-8 text-base font-semibold text-primary-foreground shadow-[0_12px_40px_-10px_var(--primary)] [--liquid-button-background-color:var(--primary)] [--liquid-button-color:var(--teal)] hover:text-white"
              >
                Get started <ArrowRight className="size-4" />
              </LiquidButton>
            </Magnetic>
            <a
              href="#pricing"
              className="glass inline-flex h-14 items-center rounded-2xl px-7 text-base font-semibold transition-transform hover:-translate-y-0.5"
            >
              Meet an advisor
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-6 inline-flex items-center gap-2 font-hand text-2xl text-teal"
          >
            <svg viewBox="0 0 60 30" className="h-6 w-12 -scale-y-100 rotate-6" aria-hidden>
              <path d="M2 26 C 18 4, 40 2, 56 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M48 6 L57 12 L48 17" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Free, forever, with unlimited users.
          </motion.p>
        </div>
      </section>
    </CursorGlow>
  );
}
