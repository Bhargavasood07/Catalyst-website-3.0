"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type ScrollApi = {
  scrollTo: (target: string | number | HTMLElement, opts?: { offset?: number }) => void;
  stop: () => void;
  start: () => void;
};

const fallback: ScrollApi = {
  scrollTo: (target, opts) => {
    const offset = opts?.offset ?? 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    if (typeof target === "number") return window.scrollTo({ top: target, behavior });
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior });
  },
  stop: () => {
    document.documentElement.style.overflow = "hidden";
  },
  start: () => {
    document.documentElement.style.overflow = "";
  },
};

const ScrollContext = createContext<ScrollApi>(fallback);
export const useSmoothScroll = () => useContext(ScrollContext);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<ScrollApi>(fallback);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // Touch devices already scroll smoothly; don't fight native momentum.
    if (reduce || coarse) return;

    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, anchors: { offset: -16 } });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    setApi({
      scrollTo: (target, opts) =>
        lenis.scrollTo(target, { offset: opts?.offset ?? 0, duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) }),
      stop: () => lenis.stop(),
      start: () => lenis.start(),
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setApi(fallback);
    };
  }, []);

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
