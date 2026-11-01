import { cn, hashString, initials } from "@/lib/utils";

const PAIRS = [
  ["#22d3ee", "#5b5bf6"],
  ["#5b5bf6", "#8b5cf6"],
  ["#8b5cf6", "#22d3ee"],
  ["#0ea5b7", "#8b5cf6"],
] as const;

/** Generated avatar for members without a photo. Same name, same colours, every build. */
export function Monogram({ name, className }: { name: string; className?: string }) {
  const h = hashString(name);
  const [a, b] = PAIRS[h % PAIRS.length]!;
  const angle = h % 360;
  return (
    <div
      aria-hidden
      className={cn("relative grid place-items-center overflow-hidden [container-type:inline-size]", className)}
      style={{ background: `linear-gradient(${angle}deg, ${a}33, ${b}26), #121218` }}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(circle at ${20 + (h % 60)}% ${15 + ((h >> 4) % 50)}%, ${a}55, transparent 55%)`,
        }}
      />
      <span className="relative font-semibold tracking-tight text-ink/90" style={{ fontSize: "clamp(0.85rem, 30cqw, 3.5rem)" }}>
        {initials(name)}
      </span>
    </div>
  );
}
