"use client";

import { useScroll } from "framer-motion";
import React from "react";

import { CharacterV1 } from "@/components/ui/skiper-ui/skiper31";

// Skiper31: letters fly in from the sides and lock into place as you scroll.
export function ScrollWords({ text = "one platform. zero silos." }: { text?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const chars = text.split("");
  const center = Math.floor(chars.length / 2);

  return (
    <section ref={ref} className="relative h-[190vh]" aria-label={text}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-4">
        <p className="mb-6 absolute top-[22%] text-xs uppercase tracking-[0.3em] text-muted-foreground">Keep scrolling</p>
        <div
          aria-hidden
          className="w-full max-w-5xl text-center text-[11vw] font-extrabold uppercase leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl"
          style={{ perspective: "500px" }}
        >
          {chars.map((char, i) => (
            <CharacterV1
              key={i}
              char={char}
              index={i}
              centerIndex={center}
              scrollYProgress={scrollYProgress}
              className={i < center ? "text-gradient" : "text-teal"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
