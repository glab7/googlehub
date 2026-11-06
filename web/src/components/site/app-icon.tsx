import type { App } from "@/lib/catalog";

// One glyph per category, tinted with the app's colour.
const glyphs: Record<string, (c: string) => React.ReactNode> = {
  Finance: (c) => (
    <>
      <rect x="6" y="20" width="7" height="14" rx="2" fill={c} opacity=".55" />
      <rect x="16.5" y="12" width="7" height="22" rx="2" fill={c} />
      <rect x="27" y="6" width="7" height="28" rx="2" fill={c} opacity=".8" />
    </>
  ),
  Sales: (c) => (
    <>
      <circle cx="20" cy="20" r="14" fill={c} opacity=".25" />
      <circle cx="20" cy="20" r="9" fill={c} opacity=".6" />
      <circle cx="20" cy="20" r="4" fill={c} />
    </>
  ),
  Websites: (c) => (
    <>
      <rect x="4" y="7" width="32" height="26" rx="4" fill={c} opacity=".25" />
      <rect x="4" y="7" width="32" height="7" rx="3" fill={c} />
      <rect x="9" y="19" width="12" height="9" rx="2" fill={c} opacity=".8" />
      <rect x="24" y="19" width="7" height="3" rx="1.5" fill={c} />
      <rect x="24" y="25" width="7" height="3" rx="1.5" fill={c} opacity=".6" />
    </>
  ),
  "Supply Chain": (c) => (
    <>
      <path d="M20 4 35 12v16L20 36 5 28V12z" fill={c} opacity=".3" />
      <path d="M20 20 35 12 20 4 5 12z" fill={c} />
      <path d="M20 20v16L5 28V12z" fill={c} opacity=".7" />
    </>
  ),
  "Human Resources": (c) => (
    <>
      <circle cx="14" cy="14" r="6" fill={c} opacity=".6" />
      <circle cx="26" cy="13" r="7" fill={c} />
      <path d="M4 33c0-6 4.5-10 10-10s10 4 10 10z" fill={c} opacity=".6" />
      <path d="M15 34c0-7 5-11 11-11s11 4 11 11z" fill={c} />
    </>
  ),
  Marketing: (c) => (
    <>
      <path d="M6 16h7l15-9v26l-15-9H6z" fill={c} />
      <rect x="9" y="24" width="6" height="10" rx="2" fill={c} opacity=".55" />
      <path d="M32 14a8 8 0 0 1 0 12" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".6" />
    </>
  ),
  Services: (c) => (
    <>
      <rect x="5" y="5" width="13" height="13" rx="3" fill={c} />
      <rect x="22" y="5" width="13" height="13" rx="3" fill={c} opacity=".45" />
      <rect x="5" y="22" width="13" height="13" rx="3" fill={c} opacity=".45" />
      <rect x="22" y="22" width="13" height="13" rx="3" fill={c} opacity=".8" />
    </>
  ),
  Productivity: (c) => (
    <>
      <path d="M6 9a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H16l-8 7v-7a4 4 0 0 1-2-3.5z" fill={c} />
      <circle cx="14" cy="16" r="2.2" fill="#fff" />
      <circle cx="20" cy="16" r="2.2" fill="#fff" />
      <circle cx="26" cy="16" r="2.2" fill="#fff" />
    </>
  ),
};

export function AppGlyph({ app, className }: { app: Pick<App, "category" | "color">; className?: string }) {
  const draw = glyphs[app.category] ?? glyphs.Services;
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className}>
      {draw(app.color)}
    </svg>
  );
}
