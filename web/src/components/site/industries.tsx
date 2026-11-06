"use client";

import { HoverExpandPanels, type ExpandPanel } from "@/components/ui/skiper-ui/skiper52";

const chips = (items: string[]) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((t) => (
      <span key={t} className="rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur">
        {t}
      </span>
    ))}
  </div>
);

const PANELS: ExpandPanel[] = [
  {
    id: "retail",
    title: "Retail",
    subtitle: "Point of sale, eCommerce and stock in one live system, from the first shop to the hundredth.",
    background: "radial-gradient(120% 80% at 20% 10%, #e0a43b, transparent 60%), linear-gradient(160deg, #c4527a, #714b67)",
    content: chips(["Point of Sale", "eCommerce", "Inventory", "Loyalty"]),
  },
  {
    id: "manufacturing",
    title: "Manufacturing",
    subtitle: "Bills of materials, work orders and quality checks that talk to purchase and accounting.",
    background: "radial-gradient(120% 80% at 80% 10%, #4f8fc0, transparent 60%), linear-gradient(160deg, #6b7f99, #2a3550)",
    content: chips(["MRP", "PLM", "Quality", "Maintenance"]),
  },
  {
    id: "services",
    title: "Services",
    subtitle: "Projects, timesheets and invoicing that close the loop from quote to cash.",
    background: "radial-gradient(120% 80% at 30% 0%, #2aa39a, transparent 60%), linear-gradient(160deg, #017e84, #0d3b48)",
    content: chips(["Project", "Timesheets", "Field Service", "Helpdesk"]),
  },
  {
    id: "hospitality",
    title: "Hospitality",
    subtitle: "Restaurant floors, kitchen screens and bookings, synced in real time.",
    background: "radial-gradient(120% 80% at 70% 0%, #f08a4b, transparent 60%), linear-gradient(160deg, #d4664b, #6b2a3a)",
    content: chips(["Restaurant POS", "Appointments", "Events", "Surveys"]),
  },
  {
    id: "nonprofit",
    title: "Non-profit",
    subtitle: "Members, donations, volunteers and events without a patchwork of tools.",
    background: "radial-gradient(120% 80% at 50% 0%, #8466c9, transparent 60%), linear-gradient(160deg, #5c6fc7, #2a2550)",
    content: chips(["CRM", "Email Marketing", "Events", "Accounting"]),
  },
];

export function Industries() {
  return (
    <section id="industries" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
          Made for <span className="font-hand text-6xl font-bold tracking-normal text-teal">your industry</span>
        </h2>
        <p className="mx-auto mb-12 mt-4 max-w-xl text-center text-lg text-muted-foreground">
          Pre-configured bundles that fit the way your business already works.
        </p>
        <HoverExpandPanels panels={PANELS} />
      </div>
    </section>
  );
}
