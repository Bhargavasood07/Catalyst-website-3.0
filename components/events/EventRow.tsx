"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { eventDateParts, formatEventRange } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { MODE_LABELS, TYPE_LABELS, type EventView } from "./event-meta";

export function EventRow({ event, timeZone, past }: { event: EventView; timeZone: string; past?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const d = eventDateParts(event.startMs, timeZone);
  const hasDetails = event.html.trim().length > 0 || event.speakers.length > 0;

  return (
    <li className="group relative grid grid-cols-[4.5rem_1fr] gap-x-5 sm:grid-cols-[6rem_1fr] sm:gap-x-8">
      {/* Date column, then the rail. */}
      <div className="pt-6 text-right">
        <p className={cn("font-mono text-2xl font-medium tabular leading-none sm:text-3xl", past ? "text-ink-muted" : "text-ink")}>{d.day}</p>
        <p className="mt-1 text-sm text-ink-faint">
          {d.month} {d.year}
        </p>
      </div>

      <div className="relative border-l border-white/10 pb-8 pl-6 sm:pl-8">
        <span
          aria-hidden
          className={cn(
            "absolute -left-[5px] top-8 h-[9px] w-[9px] rounded-full ring-4 ring-void transition-colors",
            past ? "bg-white/25" : "bg-cyan group-hover:bg-cyan-soft",
          )}
        />
        <div className="spotlight rounded-card border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.035] sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-ink-muted">{TYPE_LABELS[event.type]}</span>
            <span className="text-ink-faint">{MODE_LABELS[event.mode]}</span>
          </div>
          <h4 className="mt-3 text-xl font-semibold tracking-tight text-ink sm:text-[1.375rem]">
            <Link href={`/events/${event.slug}`} className="hover:text-cyan-soft">
              {event.title}
            </Link>
          </h4>
          <p className="mt-2 leading-relaxed text-ink-muted">{event.summary}</p>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-faint">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" className="h-3.5 w-3.5" />
              {formatEventRange(event.startMs, event.endMs, timeZone)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="mapPin" className="h-3.5 w-3.5" />
              {event.venue}
            </span>
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {!past && event.registration ? (
              <a
                href={event.registration.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-void transition-colors hover:bg-cyan"
              >
                {event.registration.label}
                <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
              </a>
            ) : null}
            {past ? <RecapLinks recap={event.recap} /> : null}
            {hasDetails ? (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {open ? "Hide details" : "Show details"}
                <Icon name="chevronDown" className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} />
              </button>
            ) : null}
          </div>

          <AnimatePresence initial={false}>
            {open ? (
              <m.div
                id={panelId}
                key="details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-5 border-t border-white/[0.07] pt-5">
                  {event.speakers.length ? (
                    <ul className="mb-5 flex flex-wrap gap-2">
                      {event.speakers.map((s) => (
                        <li key={s.name} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm">
                          <span className="text-ink">{s.name}</span>
                          {s.role ? <span className="text-ink-faint">, {s.role}</span> : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="prose-catalyst" dangerouslySetInnerHTML={{ __html: event.html }} />
                </div>
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </li>
  );
}

export function RecapLinks({ recap }: { recap?: EventView["recap"] }) {
  if (!recap) return null;
  const links = [
    recap.slides && { href: recap.slides, label: "Slides", icon: "file" as const },
    recap.recording && { href: recap.recording, label: "Recording", icon: "play" as const },
    recap.repo && { href: recap.repo, label: "Code", icon: "code" as const },
  ].filter(Boolean) as { href: string; label: string; icon: "file" | "play" | "code" }[];
  return (
    <>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-sm text-ink transition-colors hover:border-white/25"
        >
          <Icon name={l.icon} className="h-3.5 w-3.5 text-cyan" />
          {l.label}
        </a>
      ))}
      {recap.photos ? (
        <Link
          href="/#gallery"
          data-gallery-filter={recap.photos}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-sm text-ink transition-colors hover:border-white/25"
        >
          <Icon name="image" className="h-3.5 w-3.5 text-cyan" />
          Photos
        </Link>
      ) : null}
    </>
  );
}
