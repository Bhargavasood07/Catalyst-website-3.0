/**
 * npm run check:content
 * Validates everything in /content and prints a friendly summary.
 * Runs in CI on every pull request, so mistakes never reach the live site.
 */
import { getEvents, getGallery, getProjects, getSite, getTeam, splitEvents } from "../lib/content";

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

const checks: [string, () => string][] = [
  ["site.json", () => getSite().name],
  [
    "events/",
    () => {
      const { upcoming, past } = splitEvents(getEvents());
      return `${upcoming.length} upcoming, ${past.length} past`;
    },
  ],
  ["team.json", () => `${getTeam().groups.reduce((n, g) => n + g.members.length, 0)} people in ${getTeam().groups.length} groups`],
  ["projects.json", () => `${getProjects().length} projects`],
  ["gallery.json", () => `${getGallery().items.length} photos`],
];

let failed = 0;
for (const [name, run] of checks) {
  try {
    console.log(`${green("✓")} ${name} ${dim(run())}`);
  } catch (err) {
    failed++;
    console.log(`${red("✗")} ${name}${(err as Error).message}`);
  }
}

if (failed) {
  console.log(red(`\n${failed} file(s) need fixing before the site can be published.\n`));
  process.exit(1);
}
console.log(green("\nAll content is valid.\n"));
