import type { Site } from "@/lib/schemas";
import { SplitText } from "@/components/ui/SplitText";
import { ScrollRevealText } from "./ScrollRevealText";

export function Manifesto({ manifesto }: { manifesto: Site["manifesto"] }) {
  const steps = manifesto.loop;
  return (
    <section id="about" aria-labelledby="about-title" className="relative scroll-mt-24 py-24 md:py-36">
      <div className="container">
        <h2 id="about-title" className="sr-only">
          About Catalyst
        </h2>

        <div className="grid gap-12 md:grid-cols-12">
          <ScrollRevealText
            text={manifesto.statement}
            className="text-statement font-semibold text-ink md:col-span-10 lg:col-span-9"
          />
          <div className="space-y-5 text-lg leading-relaxed text-ink-muted md:col-span-6 md:col-start-6 lg:col-span-5 lg:col-start-7">
            {manifesto.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>

        {/* The loop is a real sequence, so it earns its numbers. */}
        <div className="mt-24 md:mt-32">
          <SplitText as="h3" text="How a month at Catalyst runs" className="text-2xl font-semibold tracking-tight text-ink md:text-3xl" />
          <ol className="relative mt-10 grid gap-px overflow-hidden rounded-surface border border-white/10 bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="relative bg-void p-7 md:p-8">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 font-mono text-xs text-cyan">
                    {i + 1}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" aria-hidden />
                </div>
                <h4 className="mt-6 text-xl font-semibold tracking-tight text-ink">{step.title}</h4>
                <p className="mt-3 leading-relaxed text-ink-muted">{step.body}</p>
                {i === steps.length - 1 ? (
                  <p className="mt-5 flex items-center gap-2 font-mono text-xs text-violet-soft">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                      <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    back to step 1
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
