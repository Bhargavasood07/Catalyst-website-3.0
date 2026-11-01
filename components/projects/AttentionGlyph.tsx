import { seeded } from "@/lib/utils";

/**
 * Each project gets its own small attention matrix, generated from its slug:
 * a recognisable, on-theme visual identity with no image to maintain.
 * Causal (lower-triangular), with a bright diagonal like a real attention map.
 */
export function AttentionGlyph({ seed, size = 10, className }: { seed: string; size?: number; className?: string }) {
  const rand = seeded(seed);
  const cell = 100 / size;
  const cells: { x: number; y: number; o: number; hue: "c" | "v" }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= r; c++) {
      const diag = c === r ? 0.55 : 0;
      const recent = Math.max(0, 1 - (r - c) / 4) * 0.25;
      const o = Math.min(1, 0.06 + rand() * 0.45 * rand() + diag + recent);
      cells.push({ x: c, y: r, o, hue: rand() > 0.55 ? "v" : "c" });
    }
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {cells.map((k) => (
        <rect
          key={`${k.x}-${k.y}`}
          x={k.x * cell + 0.6}
          y={k.y * cell + 0.6}
          width={cell - 1.2}
          height={cell - 1.2}
          rx={1.2}
          fill={k.hue === "c" ? "#22d3ee" : "#8b5cf6"}
          opacity={k.o}
        />
      ))}
    </svg>
  );
}
