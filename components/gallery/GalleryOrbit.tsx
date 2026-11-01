"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GalleryItem } from "./types";

/**
 * A curved wall of photos you can spin, in the spirit of the Avinya gallery.
 *
 * How it works:
 * - Tiles sit on the inside of a sphere. The camera is set back from the
 *   centre (perspective = R × CAMERA), giving a gentle bulge at the edges.
 * - Only the ~11 columns facing the viewer exist in the DOM. As the wall
 *   turns, columns are recycled (keyed by absolute column index), so the
 *   cost stays flat no matter how far you spin.
 * - One rAF loop writes transforms straight to the DOM. React only
 *   re-renders when the centre column changes.
 */

const COL_STEP = 10; // degrees between columns
const ROW_STEP = 9.5; // degrees between rows
const ROWS = 5;
const POOL = 11; // columns rendered at once
const VISIBLE = 50; // degrees from centre before a tile fades out
const CAMERA = 1.6;
const AUTO_SPEED = 2.4; // degrees per second when idle

export default function GalleryOrbit({ items, onOpen }: { items: GalleryItem[]; onOpen: (index: number) => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const tiles = useRef(new Map<string, HTMLElement>());
  const state = useRef({ rot: 0, vel: 0, pitch: 0, pitchTarget: 0, dragging: false, hover: false, focus: false, target: null as number | null });
  const [radius, setRadius] = useState(0);
  const [center, setCenter] = useState(0);
  const [reduced, setReduced] = useState(false);

  // Size the sphere from the container width.
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width ?? 900;
      setRadius(Math.max(420, Math.min(w * 0.75, 980)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tileW = radius * ((COL_STEP * Math.PI) / 180) * 0.9;
  const tileH = radius * ((ROW_STEP * Math.PI) / 180) * 0.9;

  // Which columns exist right now.
  const columns = useMemo(() => {
    const half = Math.floor(POOL / 2);
    return Array.from({ length: POOL }, (_, j) => center - half + j);
  }, [center]);

  const itemFor = useCallback(
    (col: number, row: number) => {
      const n = items.length;
      const idx = (((col * ROWS + row * 2) % n) + n) % n;
      return idx;
    },
    [items.length],
  );

  // The animation loop.
  useEffect(() => {
    if (!radius) return;
    let frame = 0;
    let last = performance.now();
    let lastCenter = Number.NaN;
    const s = state.current;

    const tick = (now: number) => {
      const dt = Math.min(48, now - last) / 1000;
      last = now;

      if (s.target !== null) {
        s.rot += (s.target - s.rot) * Math.min(1, dt * 8);
        if (Math.abs(s.target - s.rot) < 0.05) s.target = null;
      } else if (!s.dragging) {
        s.rot += s.vel;
        s.vel *= Math.pow(0.9, dt * 60);
        if (Math.abs(s.vel) < 0.01 && !s.hover && !s.focus && !reduced) s.rot -= AUTO_SPEED * dt;
      }
      s.pitch += (s.pitchTarget - s.pitch) * Math.min(1, dt * 6);

      const c = Math.round(-s.rot / COL_STEP);
      if (c !== lastCenter) {
        lastCenter = c;
        setCenter(c);
      }

      tiles.current.forEach((el, key) => {
        const [colStr, rowStr] = key.split(":");
        const col = Number(colStr);
        const row = Number(rowStr);
        const a = col * COL_STEP + s.rot;
        const phi = (row - (ROWS - 1) / 2) * ROW_STEP;
        const fade = Math.max(0, Math.min(1, (VISIBLE - Math.abs(a)) / 14));
        el.style.opacity = String(fade);
        el.style.visibility = fade <= 0 ? "hidden" : "visible";
        el.style.transform = `translateZ(${radius}px) rotateX(${s.pitch}deg) rotateY(${a}deg) rotateX(${-phi}deg) translateZ(${-radius}px)`;
      });

      frame = requestAnimationFrame(tick);
    };

    // Pause the loop when the gallery is off-screen.
    let running = false;
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => (e?.isIntersecting ? start() : stop()));
    if (stage.current) io.observe(stage.current);
    return () => {
      stop();
      io.disconnect();
    };
  }, [radius, reduced]);

  // Pointer: drag to spin, small vertical drag to tilt, tap to open.
  const drag = useRef({ x: 0, y: 0, startX: 0, startY: 0, moved: false, tile: null as number | null, lastT: 0 });
  const onPointerDown = (e: React.PointerEvent) => {
    const s = state.current;
    s.dragging = true;
    s.target = null;
    s.vel = 0;
    const tileEl = (e.target as HTMLElement).closest<HTMLElement>("[data-idx]");
    drag.current = { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false, tile: tileEl ? Number(tileEl.dataset.idx) : null, lastT: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;
    const d = drag.current;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) d.moved = true;
    const degPerPx = 0.11;
    s.rot += dx * degPerPx;
    s.vel = dx * degPerPx * 0.9;
    s.pitchTarget = Math.max(-9, Math.min(9, s.pitchTarget - dy * 0.05));
  };
  const onPointerUp = () => {
    const s = state.current;
    s.dragging = false;
    s.pitchTarget = 0;
    if (!drag.current.moved && drag.current.tile !== null) onOpen(drag.current.tile);
  };

  // Horizontal trackpad swipes spin the wall; vertical scroll still scrolls the page.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      state.current.target = null;
      state.current.rot -= e.deltaX * 0.08;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const s = state.current;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const base = s.target ?? Math.round(s.rot / COL_STEP) * COL_STEP;
      s.target = base + (e.key === "ArrowLeft" ? COL_STEP : -COL_STEP);
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(itemFor(Math.round(-s.rot / COL_STEP), Math.floor(ROWS / 2)));
    }
  };

  return (
    <div
      ref={stage}
      role="application"
      aria-roledescription="rotating photo wall"
      aria-label="Photo wall. Drag or use the left and right arrow keys to rotate. Press Enter to open the photo in the centre."
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={() => (state.current.hover = true)}
      onPointerLeave={() => (state.current.hover = false)}
      onFocus={() => (state.current.focus = true)}
      onBlur={() => (state.current.focus = false)}
      onKeyDown={onKeyDown}
      className="relative h-[clamp(440px,68vh,620px)] cursor-grab touch-pan-y select-none overflow-hidden rounded-surface outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-cyan"
    >
      {/* Perspective lives on the same element as the mask: tiles are its direct
          children, so the mask never flattens their 3D transforms. */}
      <div
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_75%_at_50%_50%,#000_60%,transparent_100%)]"
        style={{ perspective: radius ? `${radius * CAMERA}px` : undefined }}
      >
        {radius
          ? columns.flatMap((col) =>
              Array.from({ length: ROWS }, (_, row) => {
                const idx = itemFor(col, row);
                const item = items[idx]!;
                const key = `${col}:${row}`;
                return (
                  <div
                    key={key}
                    data-idx={idx}
                    aria-hidden
                    ref={(el) => {
                      if (el) tiles.current.set(key, el);
                      else tiles.current.delete(key);
                    }}
                    className="absolute left-1/2 top-1/2 overflow-hidden rounded-[14px] bg-surface ring-1 ring-white/10 [backface-visibility:hidden]"
                    style={{
                      width: tileW,
                      height: tileH,
                      marginLeft: -tileW / 2,
                      marginTop: -tileH / 2,
                      opacity: 0,
                      willChange: "transform",
                    }}
                  >
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 40vw, 200px"
                      draggable={false}
                      className="pointer-events-none object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                );
              }),
            )
          : null}
      </div>
      <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-void/70 px-3 py-1.5 text-xs text-ink-muted ring-1 ring-white/10 backdrop-blur">
        Drag to spin, tap a photo to open it
      </p>
    </div>
  );
}
