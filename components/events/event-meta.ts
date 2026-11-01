import type { EventType } from "@/lib/schemas";

export const TYPE_LABELS: Record<EventType, string> = {
  workshop: "Workshop",
  hackathon: "Hackathon",
  talk: "Talk",
  "reading-group": "Reading group",
  competition: "Competition",
  social: "Social",
};

export const MODE_LABELS = { offline: "In person", online: "Online", hybrid: "In person and online" } as const;

/** What the client needs; keeps the payload lean (no raw markdown). */
export type EventView = {
  slug: string;
  title: string;
  summary: string;
  type: EventType;
  startMs: number;
  endMs: number;
  venue: string;
  mode: keyof typeof MODE_LABELS;
  registration?: { url: string; closes?: string; label: string };
  tags: string[];
  speakers: { name: string; role?: string; url?: string }[];
  recap?: { slides?: string; recording?: string; repo?: string; photos?: string };
  featured: boolean;
  html: string;
};
