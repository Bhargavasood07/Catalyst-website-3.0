import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { daysUntil, formatEventRange } from "@/lib/dates";
import { Countdown } from "./Countdown";
import { MODE_LABELS, TYPE_LABELS, type EventView } from "./event-meta";

export function NextUp({ event, timeZone, now }: { event: EventView; timeZone: string; now: number }) {
  const live = event.startMs <= now;
  const closesMs = event.registration?.closes ? Date.parse(event.registration.closes) : null;
  const closesIn = closesMs ? daysUntil(closesMs, now) : null;

  return (
    <article className="spotlight relative overflow-hidden rounded-surface border border-white/10 bg-surface">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(70%_90%_at_100%_0%,rgba(91,91,246,0.22),transparent_60%),radial-gradient(50%_70%_at_0%_100%,rgba(34,211,238,0.10),transparent_60%)]"
      />
      <div className="relative grid gap-10 p-7 md:p-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-cyan/10 px-3 py-1 font-medium text-cyan-soft ring-1 ring-cyan/25">
              {live ? "Happening now" : "Next up"}
            </span>
            <span className="text-ink-muted">
              {TYPE_LABELS[event.type]}, {MODE_LABELS[event.mode].toLowerCase()}
            </span>
          </p>
          <h3 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-ink md:text-[2.5rem]">
            <Link href={`/events/${event.slug}`} className="hover:text-cyan-soft">
              {event.title}
            </Link>
          </h3>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">{event.summary}</p>
          <dl className="mt-6 grid gap-2 text-sm text-ink-muted">
            <div className="flex items-center gap-2">
              <dt className="sr-only">When</dt>
              <Icon name="clock" className="h-4 w-4 text-ink-faint" />
              <dd>{formatEventRange(event.startMs, event.endMs, timeZone)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Where</dt>
              <Icon name="mapPin" className="h-4 w-4 text-ink-faint" />
              <dd>{event.venue}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col justify-between gap-8 lg:col-span-5 lg:items-end">
          {!live ? (
            <div className="lg:text-right">
              <p className="mb-3 text-sm text-ink-faint">Starts in</p>
              <Countdown target={event.startMs} />
            </div>
          ) : (
            <div />
          )}
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-2">
              {event.registration ? (
                <a
                  href={event.registration.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(110deg,#22d3ee,#5b5bf6_50%,#8b5cf6)] px-5 py-3 text-sm font-semibold text-void shadow-[0_10px_40px_-12px_rgba(91,91,246,0.8)]"
                >
                  {event.registration.label}
                  <Icon name="arrowUpRight" className="h-4 w-4" />
                </a>
              ) : null}
              <Link
                href={`/events/${event.slug}`}
                className="glass inline-flex items-center rounded-full px-5 py-3 text-sm text-ink hover:border-white/25"
              >
                Full details
              </Link>
            </div>
            {closesIn !== null && closesIn > 0 ? (
              <p className="text-sm text-ink-faint">
                Registration closes {closesIn === 1 ? "tomorrow" : `in ${closesIn} days`}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
