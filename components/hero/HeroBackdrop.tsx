"use client";

import dynamic from "next/dynamic";

// The canvas is decorative and client-only; load it after the critical path.
const LatticeCanvas = dynamic(() => import("./LatticeCanvas"), { ssr: false });

export function HeroBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_65%,transparent)]">
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_75%_35%,rgba(91,91,246,0.20),transparent_70%),radial-gradient(45%_45%_at_15%_80%,rgba(139,92,246,0.14),transparent_70%),radial-gradient(35%_30%_at_90%_85%,rgba(34,211,238,0.10),transparent_70%)]" />
      <div className="mask-fade-edges absolute inset-0">
        <LatticeCanvas />
      </div>
    </div>
  );
}
