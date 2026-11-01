/**
 * All dates are formatted in the society's timezone (site.json → timezone),
 * so the server and every visitor's browser render identical text.
 */

export function formatDate(ms: number, timeZone: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", { timeZone, ...opts }).format(ms);
}

export function eventDateParts(ms: number, timeZone: string) {
  return {
    day: formatDate(ms, timeZone, { day: "2-digit" }),
    month: formatDate(ms, timeZone, { month: "short" }),
    year: formatDate(ms, timeZone, { year: "numeric" }),
    weekday: formatDate(ms, timeZone, { weekday: "long" }),
    time: formatDate(ms, timeZone, { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase(),
  };
}

export function formatEventRange(startMs: number, endMs: number, timeZone: string) {
  const sameDay =
    formatDate(startMs, timeZone, { dateStyle: "medium" }) === formatDate(endMs, timeZone, { dateStyle: "medium" });
  const s = eventDateParts(startMs, timeZone);
  const e = eventDateParts(endMs, timeZone);
  if (sameDay) return `${s.weekday}, ${s.day} ${s.month} ${s.year}, ${s.time} to ${e.time}`;
  return `${s.day} ${s.month}, ${s.time} to ${e.day} ${e.month} ${e.year}, ${e.time}`;
}

export function daysUntil(targetMs: number, now = Date.now()) {
  return Math.ceil((targetMs - now) / 86_400_000);
}

const HAS_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/;

/**
 * Converts a content date string to epoch ms. Strings with an offset are
 * exact; strings without one are wall-clock time in the given timezone.
 */
export function toEpoch(value: string, timeZone: string): number {
  const normalised = value.replace(" ", "T");
  if (HAS_OFFSET.test(normalised)) return Date.parse(normalised);
  const local = normalised.length === 10 ? `${normalised}T00:00:00` : normalised;
  const guess = Date.parse(`${local}Z`);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(guess)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year!, +parts.month! - 1, +parts.day!, +parts.hour!, +parts.minute!, +parts.second!);
  return guess - (asUtc - guess);
}
