import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SplitText } from "./SplitText";

/**
 * Consistent section rhythm. The heading id doubles as the aria label so
 * every landmark is announced by name.
 */
export function Section({
  id,
  title,
  intro,
  aside,
  children,
  className,
}: {
  id: string;
  title: string;
  intro?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("relative scroll-mt-24 py-20 md:py-28", className)}>
      <div className="container">
        <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SplitText id={`${id}-title`} text={title} className="text-display font-semibold text-ink" />
            {intro ? <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">{intro}</p> : null}
          </div>
          {aside ? <div className="md:col-span-5 md:justify-self-end">{aside}</div> : null}
        </header>
        {children}
      </div>
    </section>
  );
}
