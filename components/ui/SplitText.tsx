import { createElement } from "react";

/**
 * Word-by-word reveal from behind a mask. A server component: no client JS
 * per word. <RevealObserver /> (mounted once in the layout) flips data-in
 * when the heading scrolls into view, and CSS does the animation.
 * Screen readers get the plain sentence via aria-label.
 */
export function SplitText({
  text,
  as = "h2",
  className,
  delay = 0,
  id,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  id?: string;
}) {
  const words = text.split(" ");
  return createElement(
    as,
    { className, "aria-label": text, id },
    <span aria-hidden data-reveal style={{ "--d": `${delay}s` } as React.CSSProperties}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="split-mask" style={{ "--i": i } as React.CSSProperties}>
          <span className="split-word">
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>,
  );
}
