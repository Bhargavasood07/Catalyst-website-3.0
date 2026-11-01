import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { CursorGlow } from "@/components/layout/CursorGlow";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Providers } from "@/components/providers/Providers";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { getSite } from "@/lib/content";
import "./globals.css";

// Self-hosted variable fonts: no third-party request, no layout shift.
const sans = localFont({
  src: "./fonts/PlusJakartaSans-Variable.woff2",
  variable: "--font-sans",
  weight: "200 800",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
});
const mono = localFont({
  src: "./fonts/JetBrainsMono-Variable.woff2",
  variable: "--font-mono",
  weight: "100 800",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function generateMetadata(): Metadata {
  const site = getSite();
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name}: ${site.tagline}`, template: `%s | ${site.name}` },
    description: site.description,
    applicationName: site.name,
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.locale,
      url: site.url,
      title: site.name,
      description: site.description,
    },
    twitter: { card: "summary_large_image", title: site.name, description: site.description },
    alternates: { canonical: "/" },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const site = getSite();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    email: site.email,
    description: site.description,
    parentOrganization: { "@type": "CollegeOrUniversity", name: site.college.name },
    sameAs: Object.values(site.socials).filter(Boolean),
  };

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="grain min-h-dvh">
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-void transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Providers>
          <RevealObserver />
          <CursorGlow />
          <Nav name={site.name} recruiting={site.recruiting.open} />
          <main id="main" className="relative z-[2]">
            {children}
          </main>
          <Footer site={site} />
        </Providers>
        <noscript>
          <style>{"[data-reveal] .split-word{transform:none!important}.hero-line{animation:none!important}"}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </body>
    </html>
  );
}
