"use client";

import { Check } from "lucide-react";
import React from "react";

import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { Tabs, TabsList, TabsTrigger } from "@/components/animate-ui/components/animate/tabs";
import { Tilt, TiltContent } from "@/components/animate-ui/primitives/effects/tilt";
import { SlidingNumber } from "@/components/animate-ui/primitives/texts/sliding-number";
import { catalog, type Plan } from "@/lib/catalog";
import { cn } from "@/lib/utils";

import { useContact } from "./providers";

type Billing = "yearly" | "monthly";

function PlanCard({ plan, billing, onSelect }: { plan: Plan; billing: Billing; onSelect: () => void }) {
  const price = billing === "yearly" ? plan.yearly : plan.monthly;
  return (
    <Tilt maxTilt={6} className="h-full">
      <TiltContent
        className={cn(
          "glass relative flex h-full flex-col rounded-[1.75rem] p-7 sm:p-8",
          plan.highlight && "ring-2 ring-primary shadow-[0_30px_80px_-30px_var(--primary)]",
        )}
      >
        {plan.highlight && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
            Most popular
          </span>
        )}
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="mt-1 min-h-12 text-muted-foreground">{plan.description}</p>
        <div className="mt-5 flex items-baseline gap-1.5">
          {price === 0 ? (
            <span className="text-5xl font-extrabold tracking-[-0.04em]">Free</span>
          ) : (
            <>
              {/* Animate UI SlidingNumber rolls the digits on billing change. */}
              <span className="inline-flex items-baseline text-5xl font-extrabold tracking-[-0.04em]">
                $<SlidingNumber number={price} decimalPlaces={2} />
              </span>
              <span className="ml-1 text-sm text-muted-foreground">/ user / month</span>
            </>
          )}
        </div>
        <ul className="my-7 flex-1 space-y-3">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-3 font-medium">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal text-white">
                <Check className="size-3" strokeWidth={3.5} />
              </span>
              {f}
            </li>
          ))}
        </ul>
        <LiquidButton
          onClick={onSelect}
          className={cn(
            "h-12 w-full rounded-xl text-base font-semibold",
            plan.highlight
              ? "text-primary-foreground [--liquid-button-background-color:var(--primary)] [--liquid-button-color:var(--teal)] hover:text-white"
              : "border border-[var(--glass-border)] text-foreground [--liquid-button-background-color:transparent] [--liquid-button-color:var(--primary)] hover:text-primary-foreground",
          )}
        >
          {plan.highlight ? "Get started" : "Contact sales"}
        </LiquidButton>
      </TiltContent>
    </Tilt>
  );
}

export function Pricing() {
  const { open } = useContact();
  const [billing, setBilling] = React.useState<Billing>("yearly");

  return (
    <section id="pricing" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
          Simple pricing, <span className="text-gradient">no surprises</span>
        </h2>
        <Tabs value={billing} onValueChange={(v) => setBilling(v as Billing)} className="mx-auto mt-8 w-fit">
          <TabsList className="h-11 rounded-xl border border-[var(--glass-border)] bg-transparent p-1">
            <TabsTrigger value="yearly" className="px-5">
              Yearly <span className="ml-1 text-xs font-bold text-teal">−20%</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="px-5">
              Monthly
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mx-auto mt-12 grid max-w-md gap-6 lg:max-w-none lg:grid-cols-3">
          {catalog.plans.map((p) => (
            <PlanCard key={p.id} plan={p} billing={billing} onSelect={open} />
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">Prices per user, per month, excl. tax.</p>
      </div>
    </section>
  );
}
