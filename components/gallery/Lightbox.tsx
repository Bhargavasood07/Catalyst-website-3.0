"use client";

import { AnimatePresence, m, type PanInfo } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { Icon } from "@/components/ui/Icon";
import type { GalleryItem } from "./types";

/**
 * Accessible lightbox: focus moves in and is trapped, Escape closes, arrow
 * keys and swipes navigate, focus returns to where you were on close.
 */
export default function Lightbox({
  items,
  index,
  categoryLabel,
  onClose,
  onIndex,
}: {
  items: GalleryItem[];
  index: number;
  categoryLabel: (id: string) => string;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [dir, setDir] = useState(0);
  const { stop, start } = useSmoothScroll();
  const item = items[index]!;

  const go = useCallback(
    (step: number) => {
      setDir(step);
      onIndex((index + step + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    stop();
    return () => {
      start();
      previouslyFocused?.focus?.();
    };
  }, [stop, start]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && dialog.current) {
        const focusables = dialog.current.querySelectorAll<HTMLElement>("button, a[href]");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -70 || info.velocity.x < -500) go(1);
    else if (info.offset.x > 70 || info.velocity.x > 500) go(-1);
  };

  return (
    <m.div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${items.length}: ${item.caption ?? item.alt}`}
      className="fixed inset-0 z-[100] flex flex-col bg-void/92 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p className="font-mono text-sm tabular text-ink-muted">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </p>
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-ink hover:border-white/30"
          aria-label="Close photo viewer"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <m.div
            key={item.src}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 80, opacity: 0, scale: 0.98 }),
              center: { x: 0, opacity: 1, scale: 1 },
              exit: (d: number) => ({ x: d * -80, opacity: 0, scale: 0.98 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={onDragEnd}
            className="relative flex max-h-full cursor-grab items-center active:cursor-grabbing"
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
              draggable={false}
              className="max-h-[calc(100dvh-13rem)] w-auto rounded-card object-contain shadow-2xl ring-1 ring-white/10"
            />
          </m.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-void/60 text-ink hover:border-white/30 sm:grid"
          aria-label="Previous photo"
        >
          <Icon name="chevronLeft" className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-void/60 text-ink hover:border-white/30 sm:grid"
          aria-label="Next photo"
        >
          <Icon name="chevronRight" className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 pb-8 pt-5 text-center">
        <p className="text-lg text-ink">{item.caption ?? item.alt}</p>
        <p className="mt-1 text-sm text-ink-faint">
          {[categoryLabel(item.category), item.event, item.date].filter(Boolean).join(", ")}
        </p>
        <p className="mt-3 text-xs text-ink-faint sm:hidden">Swipe for more</p>
      </div>
    </m.div>
  );
}
