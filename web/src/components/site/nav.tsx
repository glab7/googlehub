"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { Menu, Monitor, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";
import { flushSync } from "react-dom";

import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import {
  ThemeTogglerButton,
  ThemeTogglerButtonIcon,
  type Resolved,
  type ThemeSelection,
} from "@/components/animate-ui/buttons/theme-toggler";
import { createAnimation } from "@/components/ui/skiper-ui/skiper26";
import { TextRoll } from "@/components/ui/skiper-ui/skiper58";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";
import { useContact } from "./providers";

const LINKS = [
  { href: "#apps", label: "Apps" },
  { href: "#features", label: "Features" },
  { href: "#industries", label: "Industries" },
  { href: "#stories", label: "Community" },
  { href: "#pricing", label: "Pricing" },
];

const THEME_STYLE_ID = "theme-transition-styles";

function resolve(theme: ThemeSelection): Resolved {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Resolves once <html> carries the target theme class, so the view
// transition snapshots the page only after next-themes has applied it.
function themeApplied(target: Resolved): Promise<void> {
  return new Promise((done) => {
    const started = performance.now();
    const check = () => {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark === (target === "dark") || performance.now() - started > 400) done();
      else requestAnimationFrame(check);
    };
    check();
  });
}

function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Skiper26: the new theme spreads from the top-right (where this button
  // sits) as a soft-edged circle, via the View Transitions API.
  const setThemeAnimated = React.useCallback(
    (next: ThemeSelection) => {
      const from = (resolvedTheme ?? "dark") as Resolved;
      const to = resolve(next);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (from === to || reduce || !document.startViewTransition) {
        setTheme(next);
        return;
      }

      const { css } = createAnimation("circle-blur", "top-right");
      let style = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = THEME_STYLE_ID;
        document.head.appendChild(style);
      }
      // Hold the fully revealed mask until the transition ends; without
      // `forwards` the mask snaps back for one frame and the old theme flashes.
      style.textContent = `${css}
        ::view-transition-new(root) { animation-fill-mode: forwards; }
        ::view-transition-old(root), .dark::view-transition-old(root) { animation: none; }`;

      document.startViewTransition(() => {
        flushSync(() => setTheme(next));
        return themeApplied(to);
      });
    },
    [resolvedTheme, setTheme],
  );

  return (
    <ThemeTogglerButton
      aria-label="Toggle theme"
      theme={(theme ?? "dark") as ThemeSelection}
      resolvedTheme={(resolvedTheme ?? "dark") as Resolved}
      setTheme={setThemeAnimated}
      modes={["light", "dark"]}
      className="size-9 rounded-full border border-[var(--glass-border)] bg-transparent text-foreground hover:bg-muted"
    >
      <ThemeTogglerButtonIcon light={<Sun className="size-4" />} dark={<Moon className="size-4" />} system={<Monitor className="size-4" />} />
    </ThemeTogglerButton>
  );
}

export function Nav() {
  const { open } = useContact();
  const lenis = useLenis();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (menuOpen) lenis?.stop();
    else lenis?.start();
  }, [menuOpen, lenis]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    lenis?.scrollTo(href, { offset: -80, duration: 1.2 });
  };

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4"
      >
        <nav
          aria-label="Main"
          className={cn(
            "glass mx-auto flex h-14 max-w-6xl items-center gap-6 rounded-2xl pl-4 pr-2 transition-[box-shadow,background] duration-300",
            scrolled && "glass-strong",
          )}
        >
          <a href="#top" onClick={go("#top")} aria-label="Orbita home">
            <Logo />
          </a>
          <ul className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={go(l.href)} className="block py-2 transition-colors hover:text-foreground">
                  <TextRoll lineHeight={1.25}>{l.label}</TextRoll>
                </a>
              </li>
            ))}
          </ul>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <LiquidButton
              onClick={open}
              className="h-9 rounded-xl px-4 font-semibold [--liquid-button-background-color:var(--primary)] [--liquid-button-color:var(--teal)] text-primary-foreground hover:text-white"
            >
              Contact us
            </LiquidButton>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-xl text-foreground hover:bg-muted lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Full-screen glass menu with Skiper58 text-roll links (mobile/tablet). */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-strong fixed inset-0 z-40 flex flex-col items-center justify-center lg:hidden"
          >
            <ul className="flex flex-col items-center gap-5">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.05 * i } }}
                >
                  <a href={l.href} onClick={go(l.href)}>
                    <TextRoll center className="text-5xl font-extrabold uppercase leading-[0.8] tracking-[-0.03em]">
                      {l.label}
                    </TextRoll>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
