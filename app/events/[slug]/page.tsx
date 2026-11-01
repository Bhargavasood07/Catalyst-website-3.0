import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/events/Countdown";
import { RecapLinks } from "@/components/events/EventRow";
import { MODE_LABELS, TYPE_LABELS } from "@/components/events/event-meta";
import { Icon } from "@/components/ui/Icon";
import { getEventBySlug, getEvents, getEventStatus, getSite } from "@/lib/content";
import { formatEventRange } from "@/lib/dates";

export const revalidate = 3600;
export const dynamicParams = false;

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.summary,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: { title: event.title, description: event.summary, type: "website", images: event.cover ? [event.cover] : undefined },
  };
}

export default async function EventPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();
  const site = getSite();
  const status = getEventStatus(event);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: event.start,
    endDate: new Date(event.endMs).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      event.mode === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : event.mode === "hybrid"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: event.venue, address: `${site.college.name}, ${site.college.address}` },
    organizer: { "@type": "Organization", name: site.name, url: site.url },
    ...(event.registration ? { offers: { "@type": "Offer", url: event.registration.url, price: 0, priceCurrency: "INR" } } : {}),
  };

  return (
    <article className="relative pb-24 pt-32 md:pt-40">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_70%_at_70%_0%,rgba(91,91,246,0.2),transparent_70%)]" />
      <div className="container max-w-4xl">
        <Link href="/#events" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
          <Icon name="arrowLeft" className="h-4 w-4" />
          All events
        </Link>

        <p className="mt-10 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full border border-white/10 px-3 py-1 text-ink-muted">{TYPE_LABELS[event.type]}</span>
          <span className="text-ink-faint">{MODE_LABELS[event.mode]}</span>
          {status === "live" ? <span className="rounded-full bg-cyan/10 px-3 py-1 text-cyan-soft ring-1 ring-cyan/30">Happening now</span> : null}
          {status === "past" ? <span className="text-ink-faint">This event has finished</span> : null}
        </p>
        <h1 className="mt-5 text-display font-semibold text-ink">{event.title}</h1>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink-muted">{event.summary}</p>

        <dl className="mt-8 grid gap-3 text-ink-muted sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-card border border-white/10 bg-white/[0.02] p-4">
            <Icon name="clock" className="mt-0.5 h-4 w-4 text-cyan" />
            <div>
              <dt className="text-sm text-ink-faint">When</dt>
              <dd className="text-ink">{formatEventRange(event.startMs, event.endMs, site.timezone)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-white/10 bg-white/[0.02] p-4">
            <Icon name="mapPin" className="mt-0.5 h-4 w-4 text-cyan" />
            <div>
              <dt className="text-sm text-ink-faint">Where</dt>
              <dd className="text-ink">{event.venue}</dd>
            </div>
          </div>
        </dl>

        {status === "upcoming" ? (
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 rounded-surface border border-white/10 bg-surface p-6">
            <div>
              <p className="mb-3 text-sm text-ink-faint">Starts in</p>
              <Countdown target={event.startMs} compact />
            </div>
            {event.registration ? (
              <a
                href={event.registration.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(110deg,#22d3ee,#5b5bf6_50%,#8b5cf6)] px-6 py-3 text-sm font-semibold text-void"
              >
                {event.registration.label}
                <Icon name="arrowUpRight" className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        ) : null}

        {status === "past" && event.recap ? (
          <div className="mt-8 flex flex-wrap gap-2">
            <RecapLinks recap={event.recap} />
          </div>
        ) : null}

        {event.cover ? (
          <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-surface ring-1 ring-white/10">
            <Image src={event.cover} alt="" fill sizes="(max-width: 896px) 100vw, 896px" className="object-cover" priority />
          </div>
        ) : null}

        {event.speakers.length ? (
          <section className="mt-12" aria-label="Speakers">
            <h2 className="text-sm text-ink-faint">{event.speakers.length > 1 ? "Speakers" : "Speaker"}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {event.speakers.map((s) => (
                <li key={s.name} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm">
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-cyan-soft">
                      {s.name}
                    </a>
                  ) : (
                    <span className="text-ink">{s.name}</span>
                  )}
                  {s.role ? <span className="text-ink-faint">, {s.role}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="prose-catalyst mt-12" dangerouslySetInnerHTML={{ __html: event.html }} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
