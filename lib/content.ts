import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { marked } from "marked";
import { imageSize } from "image-size";
import type { ZodError, ZodType, ZodTypeDef } from "zod";
import { toEpoch } from "./dates";
import {
  EventFrontmatterSchema,
  GallerySchema,
  ProjectsSchema,
  SiteSchema,
  TeamSchema,
  type EventFrontmatter,
  type GalleryData,
  type Project,
  type Site,
  type Team,
} from "./schemas";

/**
 * The content layer. Components never read files directly; they call these
 * loaders, which validate everything in /content and return typed data.
 */

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const PUBLIC_DIR = path.join(ROOT, "public");

export class ContentError extends Error {
  constructor(file: string, error: ZodError) {
    const details = error.issues
      .map((issue) => {
        const where = issue.path.length ? issue.path.join(" > ") : "(file)";
        return `  • ${where} ${issue.message}`;
      })
      .join("\n");
    super(`\n\nThere's a problem in content/${file}:\n${details}\n`);
    this.name = "ContentError";
  }
}

function readJson(file: string): unknown {
  const full = path.join(CONTENT_DIR, file);
  const raw = fs.readFileSync(full, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `\n\ncontent/${file} is not valid JSON: ${(err as Error).message}\n` +
        `  Tip: check for a missing comma, or a trailing comma after the last item.\n`,
    );
  }
}

function parse<Out, In>(schema: ZodType<Out, ZodTypeDef, In>, data: unknown, file: string): Out {
  const result = schema.safeParse(data);
  if (!result.success) throw new ContentError(file, result.error);
  return result.data;
}

/* ------------------------------------------------------------------ site */

export const getSite = cache((): Site => {
  const site = parse(SiteSchema, readJson("site.json"), "site.json");
  if (site.recruiting.closes) site.recruiting.closes = iso(site.recruiting.closes, site.timezone);
  return site;
});

/** Normalise any content date to a full ISO string so components can Date.parse it safely. */
const iso = (value: string, timeZone: string) => new Date(toEpoch(value, timeZone)).toISOString();

/* ---------------------------------------------------------------- events */

export type EventStatus = "upcoming" | "live" | "past";

export type CatalystEvent = EventFrontmatter & {
  slug: string;
  /** Rendered HTML of the markdown body (trusted: written by the committee). */
  html: string;
  startMs: number;
  endMs: number;
};

const DEFAULT_EVENT_HOURS = 3;

export const getEvents = cache((): CatalystEvent[] => {
  const dir = path.join(CONTENT_DIR, "events");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_"));

  const { timezone } = getSite();
  const events = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const fm = parse(EventFrontmatterSchema, data, `events/${file}`);
    if (fm.cover) assertPublicFile(fm.cover, `events/${file}`);
    const startMs = toEpoch(fm.start, timezone);
    const endMs = fm.end ? toEpoch(fm.end, timezone) : startMs + DEFAULT_EVENT_HOURS * 3_600_000;
    if (endMs < startMs) {
      throw new Error(`\n\nIn content/events/${file}, "end" is before "start". Check the dates.\n`);
    }
    return {
      ...fm,
      start: new Date(startMs).toISOString(),
      end: new Date(endMs).toISOString(),
      registration: fm.registration && {
        ...fm.registration,
        closes: fm.registration.closes ? iso(fm.registration.closes, timezone) : undefined,
      },
      slug: file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, ""),
      html: marked.parse(content.trim(), { async: false, gfm: true }) as string,
      startMs,
      endMs,
    };
  });

  const slugs = new Set<string>();
  for (const e of events) {
    if (slugs.has(e.slug)) throw new Error(`\n\nTwo event files produce the same link "/events/${e.slug}". Rename one of them.\n`);
    slugs.add(e.slug);
  }

  return events.filter((e) => !e.draft).sort((a, b) => a.startMs - b.startMs);
});

export function getEventStatus(event: Pick<CatalystEvent, "startMs" | "endMs">, now = Date.now()): EventStatus {
  if (now < event.startMs) return "upcoming";
  if (now <= event.endMs) return "live";
  return "past";
}

export function splitEvents(events: CatalystEvent[], now = Date.now()) {
  const upcoming = events.filter((e) => getEventStatus(e, now) !== "past");
  const past = events.filter((e) => getEventStatus(e, now) === "past").reverse();
  return { upcoming, past };
}

export const getEventBySlug = (slug: string) => getEvents().find((e) => e.slug === slug);

/* ------------------------------------------------------------------ team */

export const getTeam = cache((): Team => {
  const team = parse(TeamSchema, readJson("team.json"), "team.json");
  team.groups.forEach((g) =>
    g.members.forEach((m) => {
      if (m.photo && m.photo !== "github") assertPublicFile(m.photo, "team.json");
      if (m.photo === "github" && !m.github) {
        throw new Error(`\n\nIn content/team.json, ${m.name} uses "photo": "github" but has no "github" username.\n`);
      }
    }),
  );
  return team;
});

/* -------------------------------------------------------------- projects */

export const getProjects = cache((): Project[] => {
  const { projects } = parse(ProjectsSchema, readJson("projects.json"), "projects.json");
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year);
});

/* --------------------------------------------------------------- gallery */

export type GalleryImage = GalleryData["items"][number] & { width: number; height: number };
export type Gallery = { categories: GalleryData["categories"]; items: GalleryImage[] };

export const getGallery = cache((): Gallery => {
  const data = parse(GallerySchema, readJson("gallery.json"), "gallery.json");
  const items = data.items.map((item) => {
    const full = assertPublicFile(item.src, "gallery.json");
    // Dimensions are read from the file so nobody has to type them,
    // and next/image can reserve space (zero layout shift).
    const { width, height } = imageSize(fs.readFileSync(full));
    if (!width || !height) throw new Error(`\n\nCould not read the size of public${item.src}. Is it a valid image?\n`);
    return { ...item, width, height };
  });
  return { categories: data.categories, items };
});

/* --------------------------------------------------------------- helpers */

function assertPublicFile(publicPath: string, referencedFrom: string) {
  const full = path.join(PUBLIC_DIR, publicPath);
  if (!fs.existsSync(full)) {
    throw new Error(
      `\n\ncontent/${referencedFrom} points to "${publicPath}", but there is no file at public${publicPath}.\n` +
        `  Tip: file names are case-sensitive, and the path starts after "public".\n`,
    );
  }
  return full;
}
