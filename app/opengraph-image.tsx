import { ImageResponse } from "next/og";
import { getSite } from "@/lib/content";

export const alt = "Catalyst Gen AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const site = getSite();
  const cells = Array.from({ length: 12 * 12 }, (_, i) => {
    const r = Math.floor(i / 12);
    const c = i % 12;
    if (c > r) return null;
    const o = c === r ? 0.95 : 0.08 + (((i * 37) % 23) / 23) * 0.4;
    return { r, c, o, v: (i * 7) % 5 === 0 };
  });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#09090b", padding: 72, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "radial-gradient(60% 80% at 85% 20%, rgba(91,91,246,0.35), transparent 70%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa" }}>{site.college.name}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 120, fontWeight: 800, color: "#ededf2", letterSpacing: -5, lineHeight: 1 }}>{site.name}</div>
            <div style={{ fontSize: 34, color: "#a1a1aa", marginTop: 24, maxWidth: 640 }}>{site.tagline}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", width: 360, height: 360, alignSelf: "center" }}>
          {cells.map((cell, i) => (
            <div key={i} style={{ width: 30, height: 30, padding: 2, display: "flex" }}>
              <div
                style={{
                  flex: 1,
                  borderRadius: 4,
                  background: cell ? (cell.v ? "#8b5cf6" : "#22d3ee") : "transparent",
                  opacity: cell ? cell.o : 0,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
