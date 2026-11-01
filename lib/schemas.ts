import { z } from "zod";

/**
 * Every file in /content is checked against these schemas at build time.
 * If a committee member makes a typo, the build stops with a message that
 * names the file and the exact field, instead of shipping a broken page.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * Dates must be quoted strings like "2026-11-14T16:00". Without quotes, YAML
 * turns them into UTC timestamps behind our back, so we reject that with a
 * clear message. Times without an offset are read in site.json's timezone.
 */
const dateString = z.preprocess(
  (value) => (value instanceof Date ? { unquoted: true } : value),
  z
    .string({
      required_error: 'is missing. Use a date like "2026-11-14T16:00"',
      invalid_type_error: 'needs quotes around it, like "2026-11-14T16:00"',
    })
    .regex(ISO_DATE, 'is not a valid date. Use the format "2026-11-14T16:00" (year-month-day, then 24-hour time)'),
);

const url = z.string().url({ message: "must be a full link starting with https://" });
const publicPath = z
  .string()
  .regex(/^\/[^\s]+\.(jpe?g|png|webp|avif)$/i, "must be a path inside /public, like /gallery/hackathon-01.jpg");

const cta = z.object({ label: z.string().min(1), href: z.string().min(1) });

/* ----------------------------------------------------------------------- */
/* site.json                                                                */
/* ----------------------------------------------------------------------- */

export const SiteSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1).max(200, "should be under 200 characters (it's used for Google results)"),
  url,
  locale: z.string().default("en_IN"),
  timezone: z.string().default("Asia/Kolkata"),
  email: z.string().email(),
  college: z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    mapUrl: url.optional(),
  }),
  socials: z
    .object({
      github: url,
      linkedin: url,
      instagram: url,
      x: url,
      discord: url,
      youtube: url,
    })
    .partial(),
  recruiting: z.object({
    open: z.boolean(),
    closes: dateString.optional(),
    note: z.string().min(1),
  }),
  hero: z.object({
    lede: z.string().min(1),
    primaryCta: cta,
    secondaryCta: cta,
    model: z.string().default("catalyst-1"),
    prompts: z
      .array(z.object({ prompt: z.string().min(1), completion: z.string().min(1) }))
      .min(1, "needs at least one prompt"),
  }),
  manifesto: z.object({
    statement: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
    loop: z.array(z.object({ title: z.string().min(1), body: z.string().min(1) })).min(2).max(6),
  }),
  contact: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    responseTime: z.string().min(1),
    perks: z.array(z.string().min(1)).default([]),
  }),
});
export type Site = z.infer<typeof SiteSchema>;

/* ----------------------------------------------------------------------- */
/* content/events/*.md frontmatter                                          */
/* ----------------------------------------------------------------------- */

export const EVENT_TYPES = ["workshop", "hackathon", "talk", "reading-group", "competition", "social"] as const;

export const EventFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1).max(240, "should be under 240 characters; put the rest in the body"),
    type: z.enum(EVENT_TYPES, {
      errorMap: () => ({ message: `must be one of: ${EVENT_TYPES.join(", ")}` }),
    }),
    start: dateString,
    end: dateString.optional(),
    venue: z.string().min(1),
    mode: z.enum(["offline", "online", "hybrid"]).default("offline"),
    registration: z
      .object({
        url,
        closes: dateString.optional(),
        label: z.string().default("Register"),
      })
      .optional(),
    tags: z.array(z.string()).default([]),
    speakers: z
      .array(z.object({ name: z.string().min(1), role: z.string().optional(), url: url.optional() }))
      .default([]),
    cover: publicPath.optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    recap: z
      .object({ slides: url, recording: url, repo: url, photos: z.string() })
      .partial()
      .optional(),
  });
export type EventFrontmatter = z.infer<typeof EventFrontmatterSchema>;
export type EventType = (typeof EVENT_TYPES)[number];

/* ----------------------------------------------------------------------- */
/* team.json                                                                */
/* ----------------------------------------------------------------------- */

const MemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  /** A path in /public, or the word "github" to use their GitHub avatar. Leave out for a monogram. */
  photo: z.union([z.literal("github"), publicPath]).optional(),
  github: z
    .string()
    .regex(/^[A-Za-z0-9-]+$/, "should be just the username, like octocat (no @ or link)")
    .optional(),
  linkedin: url.optional(),
  x: url.optional(),
  website: url.optional(),
  email: z.string().email().optional(),
  bio: z.string().max(160, "should be under 160 characters").optional(),
});

export const TeamSchema = z.object({
  groups: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/, "use lowercase letters, numbers and dashes"),
        title: z.string().min(1),
        description: z.string().optional(),
        layout: z.enum(["feature", "grid", "compact"]).default("grid"),
        members: z.array(MemberSchema).min(1),
      }),
    )
    .min(1),
});
export type Team = z.infer<typeof TeamSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type TeamGroup = Team["groups"][number];

/* ----------------------------------------------------------------------- */
/* projects.json                                                            */
/* ----------------------------------------------------------------------- */

export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "use lowercase letters, numbers and dashes"),
  name: z.string().min(1),
  summary: z.string().min(1).max(200, "should be under 200 characters"),
  status: z.enum(["shipped", "in-progress", "research", "archived"]),
  year: z.number().int().min(2015).max(2100),
  stack: z.array(z.string()).default([]),
  team: z.array(z.string()).default([]),
  links: z.object({ repo: url, demo: url, paper: url, video: url }).partial().default({}),
  featured: z.boolean().default(false),
});
export const ProjectsSchema = z.object({ projects: z.array(ProjectSchema) });
export type Project = z.infer<typeof ProjectSchema>;

/* ----------------------------------------------------------------------- */
/* gallery.json                                                             */
/* ----------------------------------------------------------------------- */

export const GallerySchema = z
  .object({
    categories: z
      .array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), label: z.string().min(1) }))
      .min(1),
    items: z.array(
      z.object({
        src: publicPath,
        alt: z.string().min(4, "needs a short description of the photo (for screen readers and SEO)"),
        caption: z.string().optional(),
        category: z.string(),
        event: z.string().optional(),
        date: z.string().optional(),
      }),
    ),
  })
  .superRefine((g, ctx) => {
    const ids = new Set(g.categories.map((c) => c.id));
    g.items.forEach((item, i) => {
      if (!ids.has(item.category)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", i, "category"],
          message: `"${item.category}" is not one of the categories: ${[...ids].join(", ")}`,
        });
      }
    });
  });
export type GalleryData = z.infer<typeof GallerySchema>;
