"use client";

import { animate, stagger } from "animejs";
import { Search } from "lucide-react";
import React from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/animate-ui/components/animate/tabs";
import { Tilt, TiltContent } from "@/components/animate-ui/primitives/effects/tilt";
import { catalog } from "@/lib/catalog";

import { AppGlyph } from "./app-icon";

const ALL = "All";

export function AppsGrid() {
  const [category, setCategory] = React.useState(ALL);
  const [query, setQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(query);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const apps = React.useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return catalog.apps.filter(
      (a) =>
        (category === ALL || a.category === category) &&
        (!q || `${a.name} ${a.tagline}`.toLowerCase().includes(q)),
    );
  }, [category, deferredQuery]);

  // Anime.js: ripple the visible tiles in from the grid's centre whenever the
  // filter changes.
  React.useEffect(() => {
    const grid = gridRef.current;
    if (!grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tiles = grid.querySelectorAll<HTMLElement>(".app-tile");
    if (!tiles.length) return;
    const cols = Math.max(1, Math.round(grid.clientWidth / (tiles[0].offsetWidth || 1)));
    const anim = animate(tiles, {
      opacity: [0, 1],
      y: [18, 0],
      scale: [0.88, 1],
      delay: stagger(28, { grid: [cols, Math.ceil(tiles.length / cols)], from: "center" }),
      duration: 650,
      ease: "outBack(1.4)",
    });
    return () => {
      anim.revert();
    };
  }, [apps]);

  return (
    <section id="apps" className="relative px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="glass rounded-[2rem] p-4 sm:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={category} onValueChange={setCategory} className="min-w-0">
              <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
                <TabsList className="h-10 rounded-xl border border-[var(--glass-border)] bg-transparent p-1">
                  {[ALL, ...catalog.categories].map((c) => (
                    <TabsTrigger key={c} value={c} className="px-3 text-[13px]">
                      {c}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
            <label className="flex h-10 items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--card)] px-3 focus-within:ring-2 focus-within:ring-ring/40 lg:w-64">
              <Search className="size-4 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps…"
                aria-label="Search apps"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          <div
            ref={gridRef}
            aria-live="polite"
            className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
          >
            {apps.map((app) => (
              <Tilt key={app.id} maxTilt={14} className="app-tile">
                <a
                  href={`#${app.id}`}
                  title={app.tagline}
                  style={{ "--app-color": app.color } as React.CSSProperties}
                  className="group flex flex-col items-center gap-2.5 rounded-2xl p-2 pb-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <TiltContent className="glass grid size-16 place-items-center rounded-[22px] transition-shadow duration-300 group-hover:shadow-[0_18px_40px_-12px_var(--app-color)] sm:size-[72px]">
                    <AppGlyph app={app} className="size-10" />
                  </TiltContent>
                  <span className="text-center text-[13px] font-semibold leading-tight">{app.name}</span>
                </a>
              </Tilt>
            ))}
          </div>
          {apps.length === 0 && <p className="py-10 text-center text-muted-foreground">No app matches your search.</p>}
        </div>
      </div>
    </section>
  );
}
