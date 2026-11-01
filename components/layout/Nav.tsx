"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./nav-links";

export function Nav({ name, recruiting }: { name: string; recruiting: boolean }) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const { scrollTo } = useSmoothScroll();
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  // Scroll spy: the section crossing the upper third of the viewport is "active".
  useEffect(() => {
    if (!onHome) return;
    const ids = [...NAV_LINKS.map((l) => l.id), "join"];
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (window.scrollY < window.innerHeight * 0.4) setActive(null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [onHome]);

  useEffect(() => {
    if (!onHome) setScrolled(true);
  }, [onHome]);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (!onHome) return; // let Next navigate to /#id
    e.preventDefault();
    scrollTo(`#${id}`, { offset: id === "top" ? 0 : -16 });
    history.replaceState(null, "", id === "top" ? "/" : `#${id}`);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 md:pt-4">
      <nav
        aria-label="Main"
        className={cn(
          "flex w-full max-w-[1100px] items-center justify-between rounded-full py-2 pl-4 pr-2 transition-all duration-500",
          scrolled ? "glass bg-void/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]" : "border border-transparent",
        )}
      >
        <Link href="/#top" onClick={go("top")} className="rounded-full py-1" aria-label={`${name}, back to top`}>
          <Logo name={name} />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <Link
                href={`/#${link.id}`}
                onClick={go(link.id)}
                aria-current={active === link.id ? "true" : undefined}
                className={cn(
                  "relative block rounded-full px-4 py-2 text-sm transition-colors",
                  active === link.id ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {active === link.id ? (
                  <m.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-white/10"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/#join"
            onClick={go("join")}
            className="hidden rounded-full bg-ink px-4 py-2 text-sm font-semibold text-void transition-colors hover:bg-cyan sm:inline-flex"
          >
            {recruiting ? "Apply now" : "Contact us"}
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <m.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass absolute inset-x-3 top-[4.5rem] rounded-surface bg-void/90 p-3 md:hidden"
          >
            <ul className="grid">
              {[...NAV_LINKS, { id: "join", label: recruiting ? "Apply now" : "Contact us" }].map((link, i) => (
                <li key={link.id}>
                  <Link
                    ref={i === 0 ? firstLink : undefined}
                    href={`/#${link.id}`}
                    onClick={go(link.id)}
                    className="flex items-center justify-between rounded-card px-4 py-4 text-lg font-medium text-ink hover:bg-white/5"
                  >
                    {link.label}
                    <Icon name="chevronRight" className="h-4 w-4 text-ink-faint" />
                  </Link>
                </li>
              ))}
            </ul>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
