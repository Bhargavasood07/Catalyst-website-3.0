import { Section } from "@/components/ui/Section";
import type { CatalystEvent } from "@/lib/content";
import type { Site } from "@/lib/schemas";
import type { EventView } from "./event-meta";
import { EventsExplorer } from "./EventsExplorer";

const toView = (e: CatalystEvent): EventView => ({
  slug: e.slug,
  title: e.title,
  summary: e.summary,
  type: e.type,
  startMs: e.startMs,
  endMs: e.endMs,
  venue: e.venue,
  mode: e.mode,
  registration: e.registration,
  tags: e.tags,
  speakers: e.speakers,
  recap: e.recap,
  featured: e.featured,
  html: e.html,
});

export function EventsSection({
  site,
  upcoming,
  past,
  now,
}: {
  site: Site;
  upcoming: CatalystEvent[];
  past: CatalystEvent[];
  now: number;
}) {
  return (
    <Section
      id="events"
      title="Events and workshops"
      intro="Hands-on workshops, hackathons, talks and a weekly reading group. Everything is free for students of the college."
    >
      <EventsExplorer
        upcoming={upcoming.map(toView)}
        past={past.map(toView)}
        timeZone={site.timezone}
        now={now}
        instagram={site.socials.instagram}
      />
    </Section>
  );
}
