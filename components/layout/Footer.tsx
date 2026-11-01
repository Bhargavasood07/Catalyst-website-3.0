import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import type { Site } from "@/lib/schemas";

const SOCIAL_LABELS: Record<string, { label: string; icon: IconName }> = {
  github: { label: "GitHub", icon: "github" },
  linkedin: { label: "LinkedIn", icon: "linkedin" },
  instagram: { label: "Instagram", icon: "instagram" },
  x: { label: "X", icon: "x" },
  discord: { label: "Discord", icon: "discord" },
  youtube: { label: "YouTube", icon: "youtube" },
};

export function SocialLinks({ socials, className }: { socials: Site["socials"]; className?: string }) {
  return (
    <ul className={className ?? "flex flex-wrap gap-2"}>
      {Object.entries(socials).map(([key, href]) => {
        const meta = SOCIAL_LABELS[key];
        if (!meta || !href) return null;
        return (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${meta.label} (opens in a new tab)`}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-ink-muted transition-colors hover:border-white/25 hover:text-ink"
            >
              <Icon name={meta.icon} className="h-[18px] w-[18px]" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function Footer({ site }: { site: Site }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-12 border-t border-white/[0.06]">
      <div className="container grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo name={site.name} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">{site.tagline}</p>
        </div>
        <div className="text-sm text-ink-muted md:col-span-4">
          <p className="text-ink">{site.college.name}</p>
          <p className="mt-1">{site.college.address}</p>
          <a href={`mailto:${site.email}`} className="mt-3 inline-block text-ink underline decoration-white/20 underline-offset-4 hover:decoration-cyan">
            {site.email}
          </a>
        </div>
        <div className="md:col-span-3 md:justify-self-end">
          <SocialLinks socials={site.socials} />
        </div>
      </div>
      <div className="container flex flex-col gap-2 border-t border-white/[0.06] py-6 text-xs text-ink-faint sm:flex-row sm:justify-between">
        <p>
          © {year} {site.name}. Built by members, for members.
        </p>
        <a href="#top" className="hover:text-ink">
          Back to top
        </a>
      </div>
    </footer>
  );
}
