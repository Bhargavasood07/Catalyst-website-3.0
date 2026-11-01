import { cn } from "@/lib/utils";

/**
 * The Catalyst mark: an open ring (the reaction) with a single node at the gap
 * (the catalyst that starts it). Scales from favicon to hero.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden>
      <defs>
        <linearGradient id="cg-mark" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="0.55" stopColor="#5b5bf6" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M26.4 10.2A11.5 11.5 0 1 0 26.4 21.8"
        fill="none"
        stroke="url(#cg-mark)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3.4" fill="url(#cg-mark)" />
      <circle cx="27.6" cy="16" r="2" fill="#ededf2" />
    </svg>
  );
}

export function Logo({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[0.95rem] font-semibold tracking-tight">{name}</span>
    </span>
  );
}
