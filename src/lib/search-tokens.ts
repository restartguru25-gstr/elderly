'use client';

export function makeSearchTokens(input: string): string[] {
  const raw = String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  // keep short tokens like "bp" out; de-dupe
  const out: string[] = [];
  for (const t of raw) {
    if (t.length < 2) continue;
    if (!out.includes(t)) out.push(t);
  }
  return out.slice(0, 30);
}

