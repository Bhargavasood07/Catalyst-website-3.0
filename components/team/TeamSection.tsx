import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Monogram } from "@/components/ui/Monogram";
import { Section } from "@/components/ui/Section";
import { SpotlightGroup } from "@/components/ui/SpotlightGroup";
import type { Member, Team, TeamGroup } from "@/lib/schemas";
import { cn } from "@/lib/utils";

function photoSrc(m: Member) {
  if (!m.photo) return null;
  return m.photo === "github" ? `https://avatars.githubusercontent.com/${m.github}?s=320` : m.photo;
}

function Socials({ m, small }: { m: Member; small?: boolean }) {
  const links: { href: string; label: string; icon: IconName }[] = [];
  if (m.github) links.push({ href: `https://github.com/${m.github}`, label: "GitHub", icon: "github" });
  if (m.linkedin) links.push({ href: m.linkedin, label: "LinkedIn", icon: "linkedin" });
  if (m.x) links.push({ href: m.x, label: "X", icon: "x" });
  if (m.website) links.push({ href: m.website, label: "Website", icon: "globe" });
  if (m.email) links.push({ href: `mailto:${m.email}`, label: "Email", icon: "mail" });
  if (!links.length) return null;
  return (
    <ul className="flex gap-1">
      {links.map((l) => (
        <li key={l.label}>
          <a
            href={l.href}
            target={l.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={`${m.name} on ${l.label}`}
            className={cn("grid place-items-center rounded-full text-ink-faint transition-colors hover:bg-white/5 hover:text-ink", small ? "h-8 w-8" : "h-9 w-9")}
          >
            <Icon name={l.icon} className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Avatar({ m, className, sizes }: { m: Member; className: string; sizes: string }) {
  const src = photoSrc(m);
  return src ? (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      <Image src={src} alt={`Portrait of ${m.name}`} fill sizes={sizes} className="object-cover" />
    </div>
  ) : (
    <Monogram name={m.name} className={className} />
  );
}

function FeatureCard({ m }: { m: Member }) {
  return (
    <li className="spotlight flex gap-5 rounded-surface border border-white/10 bg-surface p-5 sm:p-6">
      <Avatar m={m} className="h-24 w-24 shrink-0 rounded-card sm:h-28 sm:w-28" sizes="112px" />
      <div className="flex min-w-0 flex-col">
        <h4 className="text-lg font-semibold tracking-tight text-ink">{m.name}</h4>
        <p className="text-sm text-cyan-soft">{m.role}</p>
        {m.bio ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{m.bio}</p> : null}
        <div className="-ml-2 mt-auto pt-2">
          <Socials m={m} />
        </div>
      </div>
    </li>
  );
}

function GridCard({ m }: { m: Member }) {
  return (
    <li className="spotlight group overflow-hidden rounded-card border border-white/10 bg-surface">
      <Avatar m={m} className="aspect-[4/5] w-full text-4xl" sizes="(max-width: 640px) 50vw, 25vw" />
      <div className="p-4">
        <h4 className="font-semibold tracking-tight text-ink">{m.name}</h4>
        <p className="text-sm text-ink-muted">{m.role}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          {m.github ? <span className="truncate font-mono text-xs text-ink-faint">@{m.github}</span> : <span />}
          <div className="-mr-2">
            <Socials m={m} small />
          </div>
        </div>
      </div>
    </li>
  );
}

function CompactCard({ m }: { m: Member }) {
  return (
    <li className="spotlight flex items-center gap-3 rounded-card border border-white/[0.08] bg-white/[0.02] p-3">
      <Avatar m={m} className="h-12 w-12 shrink-0 rounded-full text-sm" sizes="48px" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{m.name}</p>
        <p className="truncate text-xs text-ink-muted">{m.role}</p>
      </div>
      <Socials m={m} small />
    </li>
  );
}

const LAYOUTS: Record<TeamGroup["layout"], { list: string; Card: (p: { m: Member }) => React.JSX.Element }> = {
  feature: { list: "grid gap-4 md:grid-cols-2", Card: FeatureCard },
  grid: { list: "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4", Card: GridCard },
  compact: { list: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", Card: CompactCard },
};

export function TeamSection({ team }: { team: Team }) {
  return (
    <Section id="team" title="The people" intro="Faculty who back us, members who lead us, and the core team who keep everything running.">
      <SpotlightGroup className="space-y-16">
        {team.groups.map((group) => {
          const { list, Card } = LAYOUTS[group.layout];
          return (
            <div key={group.id} aria-labelledby={`team-${group.id}`} role="group">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.07] pb-4">
                <div>
                  <h3 id={`team-${group.id}`} className="text-xl font-semibold tracking-tight text-ink">
                    {group.title}
                  </h3>
                  {group.description ? <p className="mt-1 text-sm text-ink-muted">{group.description}</p> : null}
                </div>
                <p className="text-sm tabular text-ink-faint">
                  {group.members.length} {group.members.length === 1 ? "person" : "people"}
                </p>
              </div>
              <ul className={list}>
                {group.members.map((m) => (
                  <Card key={m.name} m={m} />
                ))}
              </ul>
            </div>
          );
        })}
      </SpotlightGroup>
    </Section>
  );
}
