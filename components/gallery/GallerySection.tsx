import { Section } from "@/components/ui/Section";
import type { Gallery } from "@/lib/content";
import { GalleryExplorer } from "./GalleryExplorer";

export function GallerySection({ gallery }: { gallery: Gallery }) {
  return (
    <Section
      id="gallery"
      title="Life at Catalyst"
      intro="Hackathon nights, lab benches, demo days and the people behind them."
    >
      {gallery.items.length ? (
        <GalleryExplorer items={gallery.items} categories={gallery.categories} />
      ) : (
        <p className="text-ink-muted">Photos from our first events are on their way.</p>
      )}
    </Section>
  );
}
