import { hashString } from "@/lib/utils";

export type Token = { text: string; confidence: number };

/**
 * A rough BPE-flavoured split: whitespace stays attached to the next word,
 * long words break into sub-word pieces. Confidence is deterministic per
 * token so the server and client agree.
 */
export function tokenize(text: string): Token[] {
  const pieces = text.match(/\s*[\w'’]+|\s*[^\s\w]/g) ?? [];
  const out: Token[] = [];
  pieces.forEach((piece, i) => {
    const lead = piece.match(/^\s*/)?.[0] ?? "";
    const word = piece.slice(lead.length);
    const parts = word.length > 8 ? [word.slice(0, Math.ceil(word.length * 0.6)), word.slice(Math.ceil(word.length * 0.6))] : [word];
    parts.forEach((p, j) => {
      const h = hashString(`${p}-${i}-${j}`);
      // Most tokens are confident; a few are genuinely uncertain.
      const confidence = h % 7 === 0 ? 0.32 + (h % 30) / 100 : 0.72 + (h % 28) / 100;
      out.push({ text: (j === 0 ? lead : "") + p, confidence });
    });
  });
  return out;
}
