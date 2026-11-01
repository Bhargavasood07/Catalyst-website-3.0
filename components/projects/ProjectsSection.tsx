import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SpotlightGroup } from "@/components/ui/SpotlightGroup";
import { TiltCard } from "@/components/ui/TiltCard";
import { getRepoStars } from "@/lib/github";
import type { Project } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { AttentionGlyph } from "./AttentionGlyph";

const STATUS: Record<Project["status"], { label: string; dot: string }> = {
  shipped: { label: "Shipped", dot: "bg-cyan" },
  "in-progress": { label: "In progress", dot: "bg-indigo-soft" },
  research: { label: "Research", dot: "bg-violet" },
  archived: { label: "Archived", dot: "bg-ink-faint" },
};

const LINKS: { key: keyof Project["links"]; label: string; icon: IconName }[] = [
  { key: "repo", label: "Code", icon: "github" },
  { key: "demo", label: "Live demo", icon: "globe" },
  { key: "paper", label: "Write-up", icon: "file" },
  { key: "video", label: "Video", icon: "play" },
];

export async function ProjectsSection({ projects }: { projects: Project[] }) {
  const stars = await Promise.all(projects.map((p) => getRepoStars(p.links.repo)));

  return (
    <Section
      id="projects"
      title="Built by members"
      intro="Every project here started as a reproduction in our reading group. Most are open source; all of them want contributors."
    >
      <SpotlightGroup className="grid gap-4 md:grid-cols-6">
        {projects.map((project, i) => {
          const feature = i === 0 && project.featured;
          return (
            <div key={project.slug} className={cn(feature ? "md:col-span-6 lg:col-span-4 lg:row-span-2" : i < 3 ? "md:col-span-3 lg:col-span-2" : "md:col-span-3")}>
              <TiltCard className="rounded-surface" max={feature ? 3 : 6}>
                <article className="spotlight flex h-full flex-col overflow-hidden rounded-surface border border-white/10 bg-surface">
                  <div className={cn("relative grid place-items-center overflow-hidden border-b border-white/[0.06] bg-void/60", feature ? "h-64 lg:h-auto lg:flex-1" : "h-40")}>
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_80%_at_30%_20%,rgba(91,91,246,0.18),transparent_70%)]" />
                    <AttentionGlyph seed={project.slug} size={feature ? 14 : 9} className={cn("relative", feature ? "h-48 w-48 lg:h-60 lg:w-60" : "h-28 w-28")} />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between gap-3 text-xs text-ink-muted">
                      <span className="inline-flex items-center gap-2">
                        <span className={cn("h-1.5 w-1.5 rounded-full", STATUS[project.status].dot)} />
                        {STATUS[project.status].label} in {project.year}
                      </span>
                      {stars[i] !== null && stars[i] !== undefined ? (
                        <span className="inline-flex items-center gap-1 font-mono tabular" aria-label={`${stars[i]} GitHub stars`}>
                          <Icon name="star" className="h-3.5 w-3.5 text-cyan" />
                          {stars[i]}
                        </span>
                      ) : null}
                    </div>
                    <h3 className={cn("mt-3 font-semibold tracking-tight text-ink", feature ? "text-3xl" : "text-xl")}>{project.name}</h3>
                    <p className="mt-2 leading-relaxed text-ink-muted">{project.summary}</p>
                    {project.stack.length ? (
                      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Built with">
                        {project.stack.map((s) => (
                          <li key={s} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[0.72rem] text-ink-muted">
                            {s}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-6">
                      {project.team.length ? <p className="text-sm text-ink-faint">{project.team.join(", ")}</p> : <span />}
                      <div className="flex gap-1.5">
                        {LINKS.map(({ key, label, icon }) =>
                          project.links[key] ? (
                            <a
                              key={key}
                              href={project.links[key]}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${project.name}: ${label} (opens in a new tab)`}
                              title={label}
                              className="relative z-20 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-ink-muted transition-colors hover:border-white/30 hover:text-ink"
                            >
                              <Icon name={icon} className="h-4 w-4" />
                            </a>
                          ) : null,
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </TiltCard>
            </div>
          );
        })}
      </SpotlightGroup>
    </Section>
  );
}
