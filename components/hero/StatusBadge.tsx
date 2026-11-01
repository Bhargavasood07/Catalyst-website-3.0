import Link from "next/link";
import { cn } from "@/lib/utils";

export type Status = { tone: "live" | "soon" | "recruiting" | "idle"; label: string; href: string };

const TONES = {
  live: "bg-cyan",
  soon: "bg-violet",
  recruiting: "bg-cyan",
  idle: "bg-ink-faint",
} as const;

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Link
      href={status.href}
      className="glass group inline-flex items-center gap-3 rounded-full py-1.5 pl-3 pr-4 text-sm text-ink transition-colors hover:border-white/25"
    >
      <span className="relative grid h-2.5 w-2.5 place-items-center">
        {status.tone !== "idle" ? (
          <span className={cn("absolute inset-0 animate-pulse-ring rounded-full", TONES[status.tone])} />
        ) : null}
        <span className={cn("relative h-2.5 w-2.5 rounded-full", TONES[status.tone])} />
      </span>
      <span>{status.label}</span>
      <span className="text-ink-faint transition-transform group-hover:translate-x-0.5" aria-hidden>
        ›
      </span>
    </Link>
  );
}
