/**
 * npm run new:event -- "Event title" 2026-12-05
 * Creates content/events/2026-12-05-event-title.md from the template.
 */
import fs from "node:fs";
import path from "node:path";
import { slugify } from "../lib/utils";

const [title, date] = process.argv.slice(2);
if (!title || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.log('Usage: npm run new:event -- "Event title" YYYY-MM-DD');
  process.exit(1);
}

const dir = path.join(process.cwd(), "content", "events");
const file = path.join(dir, `${date}-${slugify(title)}.md`);
if (fs.existsSync(file)) {
  console.log(`That file already exists: ${path.relative(process.cwd(), file)}`);
  process.exit(1);
}

const template = fs
  .readFileSync(path.join(dir, "_TEMPLATE.md"), "utf8")
  .replace(/^# .*\n/gm, "")
  .replace('title: "Event title"', `title: ${JSON.stringify(title)}`)
  .replace(/2026-12-05T16:00/g, `${date}T16:00`)
  .replace(/2026-12-05T19:00/g, `${date}T19:00`)
  .replace("draft: false ", "draft: true  ");

fs.writeFileSync(file, template);
console.log(`Created ${path.relative(process.cwd(), file)}`);
console.log("It starts as a draft. Fill it in, then set draft: false to publish.");
