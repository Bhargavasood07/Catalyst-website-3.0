"use client";

import { useEffect, useRef } from "react";

const MIN = 0.52; // dim words must still pass WCAG AA contrast (4.5:1) on the dark background

/**
 * The statement brightens word by word as it scrolls through the viewport,
 * so it reads at the pace of the reader. One passive scroll listener,
 * active only while the paragraph is on screen. The text is real and
 * selectable; with reduced motion it renders at full strength.
 */
export function ScrollRevealText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    let frame = 0;

    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the top of the block reaches 85% of the viewport, 1 when its bottom reaches 45%.
      const start = vh * 0.85;
      const end = vh * 0.45;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      const n = words.length;
      words.forEach((w, i) => {
        const t = Math.min(1, Math.max(0, p * n - i));
        w.style.opacity = String(MIN + (1 - MIN) * t);
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`}>
          <span data-w style={{ opacity: MIN }}>
            {word}
          </span>{" "}
        </span>
      ))}
    </p>
  );
}
