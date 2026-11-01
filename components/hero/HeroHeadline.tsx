"use client";

import { useRef } from "react";

/**
 * The name, set large, lit by a light that follows the pointer.
 * Each line carries its own gradient (offset by its position) so the
 * reveal animation and the background-clip text never fight each other.
 */
export function HeroHeadline({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const frame = useRef(0);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--hx", `${clientX - r.left}px`);
      el.style.setProperty("--hy", `${clientY - r.top}px`);
    });
  };

  return (
    <h1
      ref={ref}
      onPointerMove={onMove}
      aria-label={lines.join(" ")}
      className="text-display-xl font-extrabold [--hx:70%] [--hy:30%]"
    >
      {lines.map((line, i) => (
        <span key={line} aria-hidden className="block overflow-hidden pb-[0.06em]">
          <span className="hero-line block" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
            <span
              className="inline-block bg-clip-text text-transparent [-webkit-background-clip:text]"
              style={{
                backgroundImage: `radial-gradient(420px circle at var(--hx) calc(var(--hy) - ${i * 0.94}em), #67e8f9 0%, #8183ff 22%, #b197fc 34%, #ededf2 56%)`,
              }}
            >
              {line}
            </span>
          </span>
        </span>
      ))}
    </h1>
  );
}
