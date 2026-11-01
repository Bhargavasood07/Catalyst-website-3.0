import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "quiet";

const styles: Record<Variant, string> = {
  primary:
    "relative overflow-hidden bg-[linear-gradient(110deg,#22d3ee,#5b5bf6_45%,#8b5cf6)] text-void font-semibold shadow-[0_10px_40px_-12px_rgba(91,91,246,0.8)] hover:shadow-[0_14px_50px_-10px_rgba(34,211,238,0.7)] [background-size:180%_100%] hover:[background-position:100%_0]",
  ghost: "glass text-ink hover:border-white/25 hover:bg-white/[0.06]",
  quiet: "text-ink-muted hover:text-ink",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50";

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
  external,
  ...rest
}: { href: string; variant?: Variant; external?: boolean; children: ReactNode } & Omit<ComponentProps<"a">, "href">) {
  const cls = cn(base, styles[variant], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: { variant?: Variant; children: ReactNode } & ComponentProps<"button">) {
  return (
    <button className={cn(base, styles[variant], className)} {...rest}>
      {children}
    </button>
  );
}
