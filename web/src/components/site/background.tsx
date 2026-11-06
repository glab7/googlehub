"use client";

import { useTheme } from "next-themes";
import React from "react";

import { BubbleBackground } from "@/components/animate-ui/backgrounds/bubble";
import { ProgressiveBlur } from "@/components/ui/skiper-ui/skiper41";

// Aurora palettes (r,g,b) for the Animate UI bubble background.
const PALETTES = {
  dark: {
    first: "113,75,103",
    second: "1,126,132",
    third: "120,70,190",
    fourth: "200,90,140",
    fifth: "224,164,59",
    sixth: "60,90,200",
  },
  light: {
    first: "214,166,230",
    second: "120,220,214",
    third: "196,176,255",
    fourth: "255,182,206",
    fifth: "255,222,150",
    sixth: "160,190,255",
  },
};

export function GlassBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const dark = !mounted || resolvedTheme !== "light";

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <BubbleBackground
          key={dark ? "dark" : "light"}
          colors={dark ? PALETTES.dark : PALETTES.light}
          className={dark ? "!bg-none bg-[#0b0812]" : "!bg-none bg-[#f3eef6]"}
        />
        <div className={dark ? "absolute inset-0 bg-[#0b0812]/45" : "absolute inset-0 bg-white/35"} />
        <div className="noise absolute inset-0 opacity-[0.06] mix-blend-overlay" />
      </div>
      {/* Skiper41 progressive blur keeps content legible as it slides under the nav. */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-40 h-24">
        <ProgressiveBlur
          position="top"
          height="96px"
          blurAmount="6px"
          backgroundColor={dark ? "rgba(11,8,18,0.55)" : "rgba(243,238,246,0.6)"}
        />
      </div>
    </>
  );
}
