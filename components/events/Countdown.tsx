"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function parts(ms: number) {
  const clamp = Math.max(0, ms);
  return {
    days: Math.floor(clamp / 86_400_000),
    hours: Math.floor((clamp / 3_600_000) % 24),
    minutes: Math.floor((clamp / 60_000) % 60),
    seconds: Math.floor((clamp / 1000) % 60),
  };
}

/** Ticks every second. Renders dashes until mounted so server and client markup match. */
export function Countdown({ target, className, compact }: { target: number; className?: string; compact?: boolean }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const p = now === null ? null : parts(target - now);
  const units = [
    { key: "days", label: "days", value: p?.days },
    { key: "hours", label: "hrs", value: p?.hours },
    { key: "minutes", label: "min", value: p?.minutes },
    { key: "seconds", label: "sec", value: p?.seconds },
  ] as const;

  return (
    <div
      className={cn("flex gap-2", className)}
      role="timer"
      aria-label={p ? `${p.days} days, ${p.hours} hours and ${p.minutes} minutes to go` : "Countdown"}
    >
      {units.map((u) => (
        <div
          key={u.key}
          aria-hidden
          className={cn(
            "flex flex-col items-center rounded-card border border-white/10 bg-white/[0.03]",
            compact ? "min-w-[3.25rem] px-2 py-2" : "min-w-[4.25rem] px-3 py-3",
          )}
        >
          <span className={cn("relative h-[1.2em] overflow-hidden font-mono font-medium tabular text-ink", compact ? "text-xl" : "text-3xl")}>
            <AnimatePresence initial={false} mode="popLayout">
              <m.span
                key={u.value ?? "x"}
                className="block"
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
              </m.span>
            </AnimatePresence>
          </span>
          <span className="mt-1 text-[0.7rem] text-ink-faint">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
