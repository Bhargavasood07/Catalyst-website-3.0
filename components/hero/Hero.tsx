import { ButtonLink } from "@/components/ui/Button";
import type { CatalystEvent } from "@/lib/content";
import { daysUntil } from "@/lib/dates";
import type { Site } from "@/lib/schemas";
import { HeroBackdrop } from "./HeroBackdrop";
import { HeroHeadline } from "./HeroHeadline";
import { InferenceCard } from "./InferenceCard";
import { StatusBadge, type Status } from "./StatusBadge";

/** The badge picks the most useful thing to say right now, from content alone. */
function deriveStatus(site: Site, upcoming: CatalystEvent[], now: number): Status {
  const live = upcoming.find((e) => e.startMs <= now && now <= e.endMs);
  if (live) return { tone: "live", label: `Live now: ${live.title}`, href: `/events/${live.slug}` };
  const next = upcoming[0];
  if (next) {
    const d = daysUntil(next.startMs, now);
    if (d <= 14) {
      const when = d <= 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`;
      return { tone: "soon", label: `Next event ${when}: ${next.title}`, href: `/events/${next.slug}` };
    }
  }
  if (site.recruiting.open) return { tone: "recruiting", label: "Recruiting for the new cohort", href: "#join" };
  return { tone: "idle", label: "Follow along for the next event", href: "#events" };
}

export function Hero({ site, upcoming, now }: { site: Site; upcoming: CatalystEvent[]; now: number }) {
  const status = deriveStatus(site, upcoming, now);
  const words = site.name.split(" ");
  const lines = words.length > 1 ? [words[0]!, words.slice(1).join(" ")] : [site.name];

  return (
    <section id="top" aria-label="Introduction" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-20 pt-32">
      <HeroBackdrop />
      <div className="container relative grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <StatusBadge status={status} />
          <div className="mt-8">
            <HeroHeadline lines={lines} />
          </div>
          <p className="mt-8 max-w-[34rem] text-lg leading-relaxed text-ink-muted md:text-xl">{site.hero.lede}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={site.hero.primaryCta.href}>{site.hero.primaryCta.label}</ButtonLink>
            <ButtonLink href={site.hero.secondaryCta.href} variant="ghost">
              {site.hero.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>
        <div className="lg:col-span-5 lg:pl-4">
          <InferenceCard prompts={site.hero.prompts} model={site.hero.model} />
        </div>
      </div>
    </section>
  );
}
