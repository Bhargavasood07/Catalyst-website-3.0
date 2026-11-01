import Link from "next/link";
import { AttentionGlyph } from "@/components/projects/AttentionGlyph";

export default function NotFound() {
  return (
    <section className="container flex min-h-[80svh] flex-col items-center justify-center pt-24 text-center">
      <AttentionGlyph seed="404" size={8} className="h-24 w-24 opacity-80" />
      <h1 className="mt-8 text-display font-semibold text-ink">This page isn’t in our training data</h1>
      <p className="mt-4 max-w-md text-lg text-ink-muted">The link may be old, or the event may have moved. Everything current is on the home page.</p>
      <Link href="/" className="mt-8 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-void hover:bg-cyan">
        Go to the home page
      </Link>
    </section>
  );
}
