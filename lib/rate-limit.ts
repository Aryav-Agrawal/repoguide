// Limits how many analyses each visitor can run, to protect the free Gemini quota.
// Server code only.
//
// The counts live in this server's memory. That keeps things simple (no database), but it's
// best-effort: on Vercel several copies of the server can run at once, and a copy forgets
// everything when it restarts. Gemini's own limit (the "ai_busy" error) is still the backstop.

export const VISITOR_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000; // one hour
// If this many visitors are being tracked, clear out the ones with no recent analyses.
const SWEEP_AT = 1000;

// Visitor IP -> times (in ms) of their analyses in the last hour.
const usage = new Map<string, number[]>();

// Only keep timestamps from the last hour. Older ones no longer count.
function recentUses(ip: string, now: number): number[] {
  const recent = (usage.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length > 0) {
    usage.set(ip, recent);
  } else {
    usage.delete(ip);
  }
  return recent;
}

export function checkVisitor(
  ip: string,
  now = Date.now(),
): { allowed: boolean; retryAfterMinutes: number } {
  const recent = recentUses(ip, now);
  if (recent.length < VISITOR_LIMIT) {
    return { allowed: true, retryAfterMinutes: 0 };
  }
  // A slot frees up an hour after the oldest analysis in the window.
  const oldest = Math.min(...recent);
  const retryAfterMinutes = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 60000));
  return { allowed: false, retryAfterMinutes };
}

export function recordVisitor(ip: string, now = Date.now()): void {
  const recent = recentUses(ip, now);
  usage.set(ip, [...recent, now]);

  if (usage.size > SWEEP_AT) {
    for (const key of [...usage.keys()]) {
      recentUses(key, now);
    }
  }
}

// Vercel sets these headers itself (overwriting anything the visitor sends), so they can't be faked there.
// "x-forwarded-for" can be a list like "client, proxy1, proxy2"; the first one is the visitor.
export function getVisitorIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
