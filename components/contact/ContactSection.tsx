import { SocialLinks } from "@/components/layout/Footer";
import { Icon } from "@/components/ui/Icon";
import { SplitText } from "@/components/ui/SplitText";
import { daysUntil } from "@/lib/dates";
import type { Site } from "@/lib/schemas";
import { ContactForm } from "./ContactForm";

export function ContactSection({ site, now }: { site: Site; now: number }) {
  const closesIn = site.recruiting.closes ? daysUntil(Date.parse(site.recruiting.closes), now) : null;
  const open = site.recruiting.open && (closesIn === null || closesIn >= 0);

  return (
    <section id="join" aria-labelledby="join-title" className="relative scroll-mt-24 py-24 md:py-32">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(40%_35%_at_20%_45%,rgba(91,91,246,0.14),transparent_100%)]" />
      <div className="container grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SplitText id="join-title" text={site.contact.heading} className="text-display font-semibold text-ink" />
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted">{site.contact.body}</p>

          {open ? (
            <div className="mt-8 rounded-card border border-cyan/20 bg-cyan/[0.06] p-5">
              <p className="flex items-center gap-2 font-medium text-ink">
                <span className="h-2 w-2 rounded-full bg-cyan" />
                {closesIn !== null && closesIn <= 30
                  ? `Applications close ${closesIn === 0 ? "today" : closesIn === 1 ? "tomorrow" : `in ${closesIn} days`}`
                  : "Applications are open"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{site.recruiting.note}</p>
            </div>
          ) : null}

          {site.contact.perks.length ? (
            <ul className="mt-8 space-y-3">
              {site.contact.perks.map((perk) => (
                <li key={perk} className="flex gap-3 text-ink-muted">
                  <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-cyan" />
                  {perk}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-10 space-y-2 text-sm text-ink-muted">
            <p className="flex items-center gap-2">
              <Icon name="mail" className="h-4 w-4 text-ink-faint" />
              <a href={`mailto:${site.email}`} className="text-ink underline decoration-white/20 underline-offset-4 hover:decoration-cyan">
                {site.email}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Icon name="mapPin" className="h-4 w-4 text-ink-faint" />
              {site.college.mapUrl ? (
                <a href={site.college.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                  {site.college.address}, {site.college.name}
                </a>
              ) : (
                <span>
                  {site.college.address}, {site.college.name}
                </span>
              )}
            </p>
          </div>
          <SocialLinks socials={site.socials} className="mt-6 flex flex-wrap gap-2" />
        </div>

        <div className="lg:col-span-7">
          <ContactForm recruitingOpen={open} responseTime={site.contact.responseTime} email={site.email} />
        </div>
      </div>
    </section>
  );
}
