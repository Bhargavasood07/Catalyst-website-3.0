# Catalyst Gen AI: official website

Next.js 15 (App Router), TypeScript, Tailwind CSS and Framer Motion.
Every word, photo, event and person on the site lives in the `content/` folder, so **you can run the society's website without touching any code.**

- [For committee members: updating the site](#for-committee-members-updating-the-site)
- [For developers: running and deploying](#for-developers-running-and-deploying)
- [How the site is built](#how-the-site-is-built)
- [Before you launch: checklist](#before-you-launch-checklist)

---

## For committee members: updating the site

You never need to install anything. Everything below can be done in the browser on github.com.

**The basic loop**

1. Open the file you want to change (see the table below) on GitHub and click the pencil icon.
2. Make your edit.
3. Scroll down, choose **Create a new branch and start a pull request**, and click **Propose changes**.
4. Wait about a minute. A green tick means the change is valid; a red cross means something needs fixing, and clicking **Details** tells you which file and which line. Fix it by editing the same file again.
5. Click **Merge pull request**. The live site updates in about two minutes.

| I want to…                         | Edit this                                          |
| ---------------------------------- | -------------------------------------------------- |
| Add or change an event or workshop | a file in `content/events/`                        |
| Add or remove a person             | `content/team.json`                                |
| Add a project                      | `content/projects.json`                            |
| Add photos to the gallery          | upload to `public/gallery/`, then `content/gallery.json` |
| Open or close applications         | `content/site.json` → `recruiting`                 |
| Change the hero text, manifesto or contact copy | `content/site.json`                   |

### Adding an event

1. Open `content/events/_TEMPLATE.md` and copy its contents.
2. Create a new file in `content/events/` named `YYYY-MM-DD-short-name.md`, for example `2026-12-05-rag-workshop.md`.
3. Paste the template, and fill it in.

```md
---
title: "RAG from scratch"
summary: "One or two sentences for the event card."
type: workshop          # workshop, hackathon, talk, reading-group, competition or social
start: "2026-12-05T16:00"
end: "2026-12-05T19:00"
venue: "AI Lab, Block C"
mode: offline           # offline, online or hybrid
registration:
  url: "https://forms.gle/your-form"
  label: "Register"
---

Write the full details here. **Bold**, lists and [links](https://example.com) all work.
```

**Rules that matter**

- **Dates go in quotes** and use 24-hour time: `"2026-12-05T16:00"` means 4 pm. They're read in the college's timezone, so don't convert anything.
- The site moves events from **Upcoming** to **Past** by itself once they finish. You never move or delete them.
- Set `featured: true` to make an event the big "Next up" card. Otherwise the soonest event gets it.
- Set `draft: true` to hide an event while you're still writing it.
- **After the event**, add a `recap:` block with `slides`, `recording`, `repo` or `photos`. See the commented example in the template.
- To cancel an event, delete its file.

### Adding a person

Open `content/team.json`, find the right group, and copy an existing person's block (from `{` to `}`, including the comma after it).

```json
{ "name": "Riya Choudhary", "role": "Workshops", "github": "riya-c", "linkedin": "https://www.linkedin.com/in/riya" }
```

- Only `name` and `role` are required. Anyone without a photo gets a coloured initials badge automatically.
- **Photo:** upload a square-ish image to `public/team/` and add `"photo": "/team/riya.jpg"`. Or add `"photo": "github"` to use their GitHub profile picture (needs their `github` username).
- `github` is just the username (`riya-c`), with no `@` or link.
- Each group has a `layout`: `feature` (large cards, good for faculty), `grid` (portrait cards) or `compact` (small rows, good for big teams).
- Every person needs a comma after their `}` except the last one in a group. If you forget, the check will tell you.

### Adding gallery photos

1. Upload the photo to `public/gallery/`. Use a descriptive file name and keep it under about 400 KB (resize at squoosh.app if it's bigger). The site makes smaller versions automatically.
2. Add an entry to `content/gallery.json`:

```json
{
  "src": "/gallery/synthesis-winners.jpg",
  "alt": "The winning team holding their trophy on stage",
  "caption": "Synthesis 2026 winners",
  "category": "hackathons",
  "date": "2026-03"
}
```

- `alt` describes the photo for people using screen readers and search engines. It is required.
- `category` must be one of the ids at the top of the file (`hackathons`, `workshops`, `lab`, `demos`, `community`). To add a category, add it to that list first.
- You don't need to enter the photo's size. The site reads it.
- To link an event's "Photos" button to a category, set `photos: "workshops"` in the event's `recap`.

### Adding a project

Copy a block in `content/projects.json`. `status` is `shipped`, `in-progress`, `research` or `archived`. If you give a GitHub `repo` link, the star count appears on the card automatically. Each project gets its own generated artwork, so there's no image to upload.

### Opening and closing applications

In `content/site.json`, find `recruiting`.

- `"open": true` shows the "Applications are open" banner, the "Apply now" button and the Join option in the form.
- `"closes"` is the deadline. A countdown appears in the last 30 days, and the banner hides itself after the deadline.
- Set `"open": false` to close applications manually.

### Which words can I change in `site.json`?

All of them. The file is grouped by where the text appears on the site (`hero`, `manifesto`, `contact`, and so on). The college name, address, email and social links in there appear in the footer and contact section too.

### What the checks tell you

When something is wrong, the message says the file, the field and the fix, for example:

```
There's a problem in content/events/2026-12-05-rag-workshop.md:
  • type must be one of: workshop, hackathon, talk, reading-group, competition, social
  • start needs quotes around it, like "2026-11-14T16:00"
```

Nothing broken can reach the live site. A change with a red cross can't be published until it's fixed.

---

## For developers: running and deploying

**Requirements:** Node 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev                  # http://localhost:3000
```

| Command                | What it does                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Development server                                             |
| `npm run build`        | Validates content, then makes the production build             |
| `npm run check:content`| Validates everything in `content/` with a readable summary     |
| `npm run new:event -- "Title" 2026-12-05` | Creates a draft event file from the template |
| `npm run typecheck`    | TypeScript                                                     |
| `npm run lint`         | ESLint                                                         |

### Environment variables

| Variable              | Needed? | Purpose                                                                 |
| --------------------- | ------- | ----------------------------------------------------------------------- |
| `CONTACT_WEBHOOK_URL` | **Yes, for the form to work in production** | Where form submissions go. |
| `GITHUB_TOKEN`        | No      | Raises the GitHub API limit for project star counts.                    |

**Setting up the contact form (5 minutes, free):**

1. In a private Discord channel: *Channel settings → Integrations → Webhooks → New webhook → Copy URL*. Slack incoming webhooks work the same way.
2. In Vercel: *Project → Settings → Environment Variables*, add `CONTACT_WEBHOOK_URL` with that URL, then redeploy.

Each submission arrives as a readable message. Any other URL (Zapier, Make, a Google Apps Script) receives the submission as JSON. Without the variable, the form shows visitors your email address instead of failing silently. In development, submissions are printed to the terminal.

The API route validates with the same schema as the form, silently drops bot submissions (hidden honeypot field), and allows 5 messages per 10 minutes per IP. The rate limit is held in memory per server instance. That's fine for a society site; use Upstash or Vercel KV if you ever need a strict global limit.

### Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel. No settings need changing.
2. Add `CONTACT_WEBHOOK_URL`.
3. Set `url` in `content/site.json` to your real domain. This feeds the sitemap, social previews and search metadata.

The GitHub Action in `.github/workflows/content-check.yml` runs the content check, type check, lint and build on every pull request, which is what gives committee members the green tick or red cross.

The home page re-renders hourly, so events move from Upcoming to Past without anyone redeploying.

---

## How the site is built

```
content/            Everything editable (JSON + Markdown). Validated at build time.
lib/
  schemas.ts        The rules for every content file (zod). Edit here to add a field.
  content.ts        Loaders: read, validate and type the content.
  dates.ts          Timezone-safe date handling.
  contact-*.ts      Form options and schema, shared by the form and the API route.
app/                Routes: home page, /events/[slug], contact API, SEO files.
components/         One folder per section (hero, events, gallery, projects, team…).
public/gallery/     Photos.   public/team/ for portraits.
scripts/            check-content and new-event helpers.
```

**Adding a field to a content file:** add it to the schema in `lib/schemas.ts`, then use it in the relevant component. TypeScript will show you everywhere it needs to be handled.

**Design tokens** (colours, fonts, radii) are in `tailwind.config.ts` and the `:root` block in `app/globals.css`. Change a colour once and the whole site follows.

### Decisions worth knowing about

- **Scripted scroll and animation are used sparingly.** The hero lattice, the 3D gallery wall and the scroll-reveal statement are the memorable moments. Heading reveals and card tilts use CSS and one shared observer instead of an animation library, which keeps hydration cheap on phones.
- **Everything respects reduced motion.** With the OS setting on, the lattice draws one still frame, the gallery opens as a grid, smooth scrolling and the cursor glow switch off, and text appears at full strength.
- **Touch devices** get the grid gallery by default, native scrolling, no cursor effects, and a lattice capped at 30 fps.
- **The gallery wall** only keeps about 11 columns of photos in the page at once, so it costs the same whether you have 18 photos or 500.
- **Fonts** (Plus Jakarta Sans, JetBrains Mono) are self-hosted from `app/fonts/`, so there is no third-party request and no layout shift.
- **Accessibility:** skip link, visible focus rings, a focus-trapping lightbox that returns focus on close, labelled forms with focus moved to the first error, and a countdown that screen readers hear as a sentence, not a ticking number.
- **Dates:** times without an offset are read in the timezone in `site.json`, so an event entered as 16:00 shows as 4 pm on every server and in every visitor's browser.

### Measured quality (Lighthouse, production build)

| Run                    | Performance | Accessibility | Best practices | SEO |
| ---------------------- | ----------- | ------------- | -------------- | --- |
| Desktop                | 99          | 100           | 100            | 100 |
| Mobile (simulated 4G, 4× CPU slowdown) | 69–81 in a slow, noisy sandbox | 100 | 100 | 100 |

Layout shift is 0.001–0.002 on mobile and 0 on desktop. **The mobile performance score has not reached 95 in testing.** Mobile scores varied by up to 30 points between identical runs on the machine this was built on. Please re-measure on the deployed site with [PageSpeed Insights](https://pagespeed.web.dev), which uses real infrastructure and a CDN. If mobile still falls short, the next steps are, in order: lazy-mount the Events and Contact sections when they near the viewport, trim the hero lattice further on small screens, and replace Framer Motion in the nav and events tabs with CSS.

---

## Before you launch: checklist

Everything below is placeholder content invented to show the layout. Replace it before going live.

- [ ] `content/site.json`: college name, address, `email`, social links, `url`, manifesto copy
- [ ] `content/team.json`: real faculty, leadership and core team (and photos)
- [ ] `content/projects.json`: real projects and links
- [ ] `content/events/`: delete the sample events, add your own
- [ ] `public/gallery/` and `content/gallery.json`: the 18 images are abstract placeholders labelled "Placeholder photo"; replace them with real photos and captions
- [ ] Event registration links (they currently point to `forms.gle/your-form`)
- [ ] `CONTACT_WEBHOOK_URL` set in Vercel, and a test message sent through the form
- [ ] `app/icon.svg` and `components/ui/Logo.tsx` if the society has its own logo
- [ ] Submit `https://your-domain/sitemap.xml` in Google Search Console
