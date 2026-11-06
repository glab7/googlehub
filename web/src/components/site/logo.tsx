import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-2xl font-extrabold tracking-[-0.05em] text-primary", className)}>
      <span
        aria-hidden
        className="relative size-5 rounded-full bg-[conic-gradient(from_200deg,var(--primary),var(--teal),#e0a43b,var(--primary))] ring-2 ring-current"
      >
        <span className="absolute inset-[5px] rounded-full bg-background" />
      </span>
      orbita
    </span>
  );
}
