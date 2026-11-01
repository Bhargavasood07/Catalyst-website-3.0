"use client";

import { useRef, type ReactNode } from "react";

/**
 * Wrap a set of `.spotlight` cards. One pointer listener on the container
 * positions the border light on every card, so neighbouring cards catch
 * the edge of the glow too.
 */
export function SpotlightGroup({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      ref.current?.querySelectorAll<HTMLElement>(".spotlight").forEach((card) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--sx", `${clientX - r.left}px`);
        card.style.setProperty("--sy", `${clientY - r.top}px`);
        card.style.setProperty("--so", "1");
      });
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    ref.current?.querySelectorAll<HTMLElement>(".spotlight").forEach((card) => card.style.setProperty("--so", "0"));
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={className}>
      {children}
    </div>
  );
}
