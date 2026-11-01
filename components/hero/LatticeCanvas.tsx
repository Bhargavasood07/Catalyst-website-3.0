"use client";

import { useEffect, useRef } from "react";

/**
 * An "embedding lattice": a grid of points breathing with a slow wave field.
 * The pointer acts like an attention head: nearby points light up, a local
 * mesh forms, and arcs reach out to a few distant tokens.
 *
 * Performance budget: one canvas, DPR capped, base points drawn in six
 * batched alpha buckets (six fill calls per frame, not thousands), paused
 * when off-screen or the tab is hidden, single static frame for reduced motion.
 */
export default function LatticeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5);

    let w = 0;
    let h = 0;
    let spacing = 28;
    let cols = 0;
    let rows = 0;
    let px: Float32Array = new Float32Array(0);
    let py: Float32Array = new Float32Array(0);

    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false, lastMove: 0 };
    let arcs: { x: number; y: number; born: number }[] = [];
    let lastArcPick = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spacing = w < 640 ? 32 : 28;
      cols = Math.ceil(w / spacing) + 1;
      rows = Math.ceil(h / spacing) + 1;
      px = new Float32Array(cols * rows);
      py = new Float32Array(cols * rows);
      const ox = (w - (cols - 1) * spacing) / 2;
      const oy = (h - (rows - 1) * spacing) / 2;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          px[r * cols + c] = ox + c * spacing;
          py[r * cols + c] = oy + r * spacing;
        }
    };

    const BUCKETS = 6;
    const RADIUS = coarse ? 140 : 190;

    const draw = (t: number) => {
      const time = t / 1000;
      ctx.clearRect(0, 0, w, h);

      // Idle drift: when nobody is pointing, the "attention" wanders on its own.
      if (!pointer.active || t - pointer.lastMove > 4000) {
        pointer.tx = w * (0.62 + 0.22 * Math.sin(time * 0.21));
        pointer.ty = h * (0.45 + 0.25 * Math.sin(time * 0.17 + 1.3));
      }
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;

      // 1) Base lattice, batched by brightness.
      const paths: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
      const near: number[] = [];
      for (let i = 0; i < px.length; i++) {
        const x = px[i]!;
        const y = py[i]!;
        const wave = Math.sin(x * 0.011 + time * 0.55) * Math.cos(y * 0.014 - time * 0.4);
        const b = Math.max(0, Math.min(BUCKETS - 1, Math.floor((wave * 0.5 + 0.5) * BUCKETS)));
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        if (dx * dx + dy * dy < RADIUS * RADIUS) near.push(i);
        else paths[b]!.rect(x - 0.75, y - 0.75, 1.5, 1.5);
      }
      for (let b = 0; b < BUCKETS; b++) {
        ctx.fillStyle = `rgba(170,170,205,${0.1 + b * 0.05})`;
        ctx.fill(paths[b]!);
      }

      // 2) Local mesh around the pointer.
      ctx.lineWidth = 1;
      for (const i of near) {
        const x = px[i]!;
        const y = py[i]!;
        const d = Math.hypot(x - pointer.x, y - pointer.y);
        const k = 1 - d / RADIUS;
        const c = i % cols;
        const right = c < cols - 1 ? i + 1 : -1;
        const down = i + cols < px.length ? i + cols : -1;
        ctx.strokeStyle = `rgba(91,91,246,${k * 0.35})`;
        ctx.beginPath();
        if (right >= 0) {
          ctx.moveTo(x, y);
          ctx.lineTo(px[right]!, py[right]!);
        }
        if (down >= 0) {
          ctx.moveTo(x, y);
          ctx.lineTo(px[down]!, py[down]!);
        }
        ctx.stroke();
        const angle = Math.atan2(y - pointer.y, x - pointer.x);
        const mix = (Math.sin(angle + time) + 1) / 2;
        ctx.fillStyle = `rgba(${Math.round(34 + mix * 105)},${Math.round(211 - mix * 119)},${Math.round(238 + mix * 8)},${0.25 + k * 0.75})`;
        const s = 1.5 + k * 2.2;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }

      // 3) Attention arcs to a few distant points, re-picked every ~1.4s.
      if (t - lastArcPick > 1400 && px.length) {
        lastArcPick = t;
        arcs = arcs.filter((a) => t - a.born < 1400);
        for (let n = 0; n < 4; n++) {
          const i = Math.floor(Math.random() * px.length);
          const dx = px[i]! - pointer.x;
          const dy = py[i]! - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > RADIUS * RADIUS * 1.5 && d2 < RADIUS * RADIUS * 12) arcs.push({ x: px[i]!, y: py[i]!, born: t });
        }
      }
      for (const a of arcs) {
        const life = (t - a.born) / 2600;
        if (life > 1) continue;
        const alpha = Math.sin(life * Math.PI) * 0.45;
        const mx = (a.x + pointer.x) / 2;
        const my = (a.y + pointer.y) / 2 - Math.abs(a.x - pointer.x) * 0.25;
        const grad = ctx.createLinearGradient(pointer.x, pointer.y, a.x, a.y);
        grad.addColorStop(0, `rgba(34,211,238,${alpha})`);
        grad.addColorStop(1, `rgba(139,92,246,${alpha})`);
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(pointer.x, pointer.y);
        ctx.quadraticCurveTo(mx, my, a.x, a.y);
        ctx.stroke();
        ctx.fillStyle = `rgba(237,237,242,${alpha * 1.6})`;
        ctx.fillRect(a.x - 1.5, a.y - 1.5, 3, 3);
      }
    };

    let frame = 0;
    let running = false;
    let lastDraw = 0;
    const frameGap = coarse ? 1000 / 30 : 0; // 30fps on touch devices
    const loop = (t: number) => {
      frame = requestAnimationFrame(loop);
      if (t - lastDraw < frameGap) return;
      lastDraw = t;
      draw(t);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    resize();
    pointer.x = pointer.tx = w * 0.65;
    pointer.y = pointer.ty = h * 0.45;
    if (reduce) draw(0);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? start() : stop()), { threshold: 0 });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    // Listen on the window: the hero's content sits above the canvas and
    // would otherwise swallow every pointer event.
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      pointer.active = inside;
      if (!inside) return;
      pointer.tx = x;
      pointer.ty = y;
      pointer.lastMove = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
