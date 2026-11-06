"use client";

import { Star } from "lucide-react";

import { CoverflowSlides } from "@/components/ui/skiper-ui/skiper47";

const QUOTES = [
  {
    quote: "We replaced six different tools with Orbita in a single quarter. Our team finally works from the same numbers.",
    name: "Amara Okafor",
    role: "COO, Brightline Logistics",
    color: "#714b67",
  },
  {
    quote: "Setting up the shop, inventory and accounting took one weekend. The integration between apps is the real magic.",
    name: "Lucas Moreau",
    role: "Founder, Atelier Moreau",
    color: "#017e84",
  },
  {
    quote: "Our technicians love the mobile app. Field service, timesheets and invoicing are now one smooth flow.",
    name: "Priya Raman",
    role: "Operations Lead, CoolAir Services",
    color: "#e0a43b",
  },
  {
    quote: "The pricing is honest and the product keeps getting better. It feels like software built by people who run businesses.",
    name: "Jonas Becker",
    role: "Managing Director, Becker Tools",
    color: "#5c6fc7",
  },
  {
    quote: "Our helpdesk response time dropped by half once tickets, customers and invoices lived in the same place.",
    name: "Sofia Lindqvist",
    role: "Head of Support, Nordlys",
    color: "#c4527a",
  },
];

export function Testimonials() {
  return (
    <section id="stories" className="py-24">
      <h2 className="px-4 text-center text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
        Loved by <span className="font-hand text-6xl font-bold tracking-normal text-teal">growing teams</span>
      </h2>
      <CoverflowSlides
        className="mx-auto mt-12 max-w-7xl px-2"
        slides={QUOTES.map((q) => (
          <figure key={q.name} className="glass-strong flex h-full flex-col rounded-[1.75rem] p-7 sm:p-9">
            <div className="flex gap-0.5 text-[#e0a43b]" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-lg leading-relaxed sm:text-xl">&ldquo;{q.quote}&rdquo;</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full font-bold text-white" style={{ background: q.color }}>
                {q.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
              <span>
                <b className="block">{q.name}</b>
                <span className="text-sm text-muted-foreground">{q.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      />
    </section>
  );
}
