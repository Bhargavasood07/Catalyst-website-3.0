"use client";

import { AnimatePresence, m } from "framer-motion";
import { useMemo, useState } from "react";
import { SpotlightGroup } from "@/components/ui/SpotlightGroup";
import type { EventType } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { EventRow } from "./EventRow";
import { TYPE_LABELS, type EventView } from "./event-meta";
import { NextUp } from "./NextUp";

type Tab = "upcoming" | "past";

export function EventsExplorer({
  upcoming,
  past,
  timeZone,
  now,
  instagram,
}: {
  upcoming: EventView[];
  past: EventView[];
  timeZone: string;
  now: number;
  instagram?: string;
}) {
  const [tab, setTab] = useState<Tab>(upcoming.length ? "upcoming" : "past");
  const [type, setType] = useState<EventType | "all">("all");

  const list = tab === "upcoming" ? upcoming : past;
  const types = useMemo(() => [...new Set(list.map((e) => e.type))], [list]);
  const filtered = type === "all" ? list : list.filter((e) => e.type === type);

  // The featured (or soonest) upcoming event gets the big card.
  const headline = tab === "upcoming" && type === "all" ? (filtered.find((e) => e.featured) ?? filtered[0]) : undefined;
  const rest = headline ? filtered.filter((e) => e !== headline) : filtered;

  return (
    <div>
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Event timing" className="glass inline-flex self-start rounded-full p-1">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              aria-controls="events-panel"
              onClick={() => {
                setTab(t);
                setType("all");
              }}
              className={cn("relative rounded-full px-5 py-2 text-sm transition-colors", tab === t ? "text-void" : "text-ink-muted hover:text-ink")}
            >
              {tab === t ? (
                <m.span layoutId="events-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              ) : null}
              <span className="relative">
                {t === "upcoming" ? "Upcoming" : "Past"} <span className="tabular opacity-60">{t === "upcoming" ? upcoming.length : past.length}</span>
              </span>
            </button>
          ))}
        </div>

        {types.length > 1 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
            {(["all", ...types] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  type === t ? "border-cyan/50 bg-cyan/10 text-ink" : "border-white/10 text-ink-muted hover:border-white/25 hover:text-ink",
                )}
              >
                {t === "all" ? "All types" : TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <SpotlightGroup>
        <AnimatePresence mode="wait">
          <m.div
            key={`${tab}-${type}`}
            id="events-panel"
            role="tabpanel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {filtered.length === 0 ? (
              <div className="rounded-surface border border-dashed border-white/15 p-10 text-center">
                <p className="text-lg text-ink">Nothing on the calendar yet.</p>
                <p className="mt-2 text-ink-muted">
                  New events are announced first on{" "}
                  {instagram ? (
                    <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-cyan underline underline-offset-4">
                      Instagram
                    </a>
                  ) : (
                    "our socials"
                  )}
                  . Past sessions, slides and recordings are under Past.
                </p>
              </div>
            ) : (
              <>
                {headline ? <NextUp event={headline} timeZone={timeZone} now={now} /> : null}
                {rest.length ? (
                  <ol className={cn("relative", headline && "mt-14")} aria-label={tab === "upcoming" ? "More upcoming events" : "Past events"}>
                    {rest.map((e) => (
                      <EventRow key={e.slug} event={e} timeZone={timeZone} past={tab === "past"} />
                    ))}
                  </ol>
                ) : null}
              </>
            )}
          </m.div>
        </AnimatePresence>
      </SpotlightGroup>
    </div>
  );
}
