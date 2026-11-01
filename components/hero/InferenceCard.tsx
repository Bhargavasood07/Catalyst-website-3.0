"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { tokenize } from "./tokenize";

type Prompt = { prompt: string; completion: string };

const TOKEN_MS = 46;
const HOLD_MS = 4200;

/**
 * A model "answering" questions about the society, streamed token by token.
 * The underline under each token shows how confident the model was.
 */
export function InferenceCard({ prompts, model }: { prompts: Prompt[]; model: string }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = prompts[index % prompts.length]!;
  const tokens = useMemo(() => tokenize(current.completion), [current.completion]);
  const done = shown >= tokens.length;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) {
      setShown(tokens.length);
      return;
    }
    if (!visible) return;
    if (!done) {
      const t = setTimeout(() => setShown((s) => s + 1), TOKEN_MS + (tokens[shown]?.text.includes(",") ? 120 : 0));
      return () => clearTimeout(t);
    }
    if (prompts.length < 2) return;
    const t = setTimeout(() => {
      setShown(0);
      setIndex((i) => (i + 1) % prompts.length);
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [shown, done, visible, reduced, tokens, prompts.length]);

  return (
    <div ref={ref} className="glass relative rounded-surface p-1 shadow-glow">
      <div className="rounded-[24px] bg-void/70 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
          <span className="flex items-center gap-2 font-mono text-xs text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            {model}
          </span>
          <span className="font-mono text-xs text-ink-faint">temperature 0.7</span>
        </div>

        <AnimatePresence mode="wait">
          <m.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="pt-5"
          >
            <p className="font-mono text-[0.8125rem] leading-relaxed text-cyan-soft">
              <span className="select-none text-ink-faint">&gt; </span>
              {current.prompt}
            </p>

            {/* Screen readers get the full answer at once, not a token drip. */}
            <p className="sr-only">{current.completion}</p>

            <p aria-hidden className="mt-4 min-h-[8.5rem] text-[1.0625rem] leading-[1.7] text-ink sm:min-h-[7.5rem]">
              {tokens.slice(0, shown).map((tok, i) => (
                <span
                  key={i}
                  className="decoration-2 underline-offset-[6px]"
                  style={{
                    textDecorationLine: "underline",
                    textDecorationColor:
                      tok.confidence < 0.7
                        ? `rgba(139,92,246,${0.55 + (0.7 - tok.confidence)})`
                        : `rgba(34,211,238,${(tok.confidence - 0.7) * 1.2})`,
                  }}
                >
                  {tok.text}
                </span>
              ))}
              <span
                className={cn(
                  "ml-0.5 inline-block h-[1.1em] w-[0.5ch] translate-y-[0.2em] bg-cyan",
                  done ? "animate-pulse opacity-70" : "opacity-100",
                )}
              />
            </p>
          </m.div>
        </AnimatePresence>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4 font-mono text-[0.72rem] text-ink-faint">
          <span className="tabular">
            {String(shown).padStart(2, "0")}/{String(tokens.length).padStart(2, "0")} tokens
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-cyan" /> confident
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-violet" /> unsure
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
