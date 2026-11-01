import { NextResponse } from "next/server";
import { INTENTS } from "@/lib/contact-options";
import { ContactSchema, type ContactInput } from "@/lib/contact-schema";
import { getSite } from "@/lib/content";

/**
 * Validates submissions with the same schema the form uses, filters bots,
 * rate-limits per IP, and forwards to CONTACT_WEBHOOK_URL.
 * Discord and Slack webhooks get a readable message; anything else gets JSON.
 */

const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>(); // best-effort, per server instance

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function asText(d: ContactInput) {
  const intent = INTENTS.find((i) => i.id === d.intent)?.label ?? d.intent;
  const lines = [`**New ${intent.toLowerCase()} request**`, `From: ${d.name} <${d.email}>`];
  if (d.intent === "join") lines.push(`Year: ${d.year}`, `Branch: ${d.branch}`);
  else if (d.organisation) lines.push(`Organisation: ${d.organisation}`);
  lines.push("", d.message);
  return lines.join("\n");
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many messages from this connection. Try again in a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The form data was unreadable." }, { status: 400 });
  }

  // Honeypot filled in: pretend success so bots learn nothing.
  if (body && typeof body === "object" && "website" in body && (body as { website?: string }).website) {
    return NextResponse.json({ ok: true });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first?.message ?? "Some fields need fixing." }, { status: 422 });
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] CONTACT_WEBHOOK_URL not set; submission:\n" + asText(parsed.data));
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: `Online messages aren’t connected yet. Please email ${getSite().email} instead.` },
      { status: 503 },
    );
  }

  const chat = /discord(app)?\.com\/api\/webhooks|hooks\.slack\.com/.test(webhook);
  const payload = chat
    ? webhook.includes("slack")
      ? { text: asText(parsed.data) }
      : { content: asText(parsed.data).slice(0, 1990), allowed_mentions: { parse: [] } }
    : { ...parsed.data, receivedAt: new Date().toISOString() };

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch (err) {
    console.error("[contact] delivery failed", err);
    return NextResponse.json({ error: "We couldn’t deliver your message just now." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
