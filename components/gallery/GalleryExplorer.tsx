"use client";

import { AnimatePresence, m } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { GalleryGrid } from "./GalleryGrid";
import type { GalleryItem } from "./types";

const GalleryOrbit = dynamic(() => import("./GalleryOrbit"), {
  ssr: false,
  loading: () => <div className="h-[clamp(440px,68vh,620px)] animate-pulse rounded-surface bg-white/[0.02]" />,
});
const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

type View = "orbit" | "grid";

export function GalleryExplorer({ items, categories }: { items: GalleryItem[]; categories: { id: string; label: string }[] }) {
  const [view, setView] = useState<View | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<number | null>(null);

  // Warm the lightbox chunk so the first open is instant.
  useEffect(() => {
    const id = window.setTimeout(() => void import("./Lightbox"), 1200);
    return () => window.clearTimeout(id);
  }, []);

  // Orbit on larger screens, grid on phones (and for reduced motion).
  useEffect(() => {
    const small = window.matchMedia("(max-width: 767px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setView(small || reduce ? "grid" : "orbit");
  }, []);

  // "Photos" links on past events filter the gallery.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLElement>("[data-gallery-filter]");
      const id = link?.dataset.galleryFilter;
      if (id && categories.some((c) => c.id === id)) setFilter(id);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [categories]);

  const filtered = useMemo(() => (filter === "all" ? items : items.filter((i) => i.category === filter)), [items, filter]);
  const labelFor = useCallback((id: string) => categories.find((c) => c.id === id)?.label ?? id, [categories]);
  const counts = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, items.filter((i) => i.category === c.id).length])), [categories, items]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter photos">
          {[{ id: "all", label: "Everything" }, ...categories].map((c) => {
            const count = c.id === "all" ? items.length : counts[c.id];
            if (!count) return null;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={filter === c.id}
                onClick={() => setFilter(c.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  filter === c.id ? "border-cyan/50 bg-cyan/10 text-ink" : "border-white/10 text-ink-muted hover:border-white/25 hover:text-ink",
                )}
              >
                {c.label} <span className="tabular opacity-50">{count}</span>
              </button>
            );
          })}
        </div>

        <div role="group" aria-label="Gallery layout" className="glass inline-flex self-start rounded-full p-1">
          {(
            [
              { id: "orbit", label: "Wall", icon: "orbit" },
              { id: "grid", label: "Grid", icon: "grid" },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={view === v.id}
              onClick={() => setView(v.id)}
              className={cn("relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors", view === v.id ? "text-void" : "text-ink-muted hover:text-ink")}
            >
              {view === v.id ? (
                <m.span layoutId="gallery-view" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              ) : null}
              <Icon name={v.icon} className="relative h-4 w-4" />
              <span className="relative">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {view === null ? (
        <div className="h-[clamp(440px,68vh,620px)] rounded-surface bg-white/[0.02]" />
      ) : (
        <AnimatePresence mode="wait">
          <m.div
            key={`${view}-${filter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {view === "orbit" ? <GalleryOrbit items={filtered} onOpen={setOpen} /> : <GalleryGrid items={filtered} onOpen={setOpen} />}
          </m.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {open !== null && filtered[open] ? (
          <Lightbox items={filtered} index={open} categoryLabel={labelFor} onClose={() => setOpen(null)} onIndex={setOpen} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
