"use client";

import Image from "next/image";
import type { GalleryItem } from "./types";

/** Masonry via CSS columns: zero JS layout, zero shift (dimensions are known). */
export function GalleryGrid({ items, onOpen }: { items: GalleryItem[]; onOpen: (index: number) => void }) {
  return (
    <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
      {items.map((item, i) => (
        <li key={item.src} className="break-inside-avoid">
          <button
            type="button"
            onClick={() => onOpen(i)}
            className="group relative block w-full overflow-hidden rounded-card bg-surface ring-1 ring-white/10 transition-shadow hover:ring-white/25"
            aria-label={`Open photo: ${item.caption ?? item.alt}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.035]"
            />
            <span className="absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-void/90 via-void/40 to-transparent p-4 pt-12 text-left text-sm text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              {item.caption ?? item.alt}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
