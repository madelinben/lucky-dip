import { fitsSlots } from "./slots.ts";
import type { Candidate, Prefs } from "./types";

export const LIKED = 1;
export const SKIPPED = 0.05; // not zero: a lucky dip should still surprise
export const NEUTRAL = 0.25; // categories the user never rated
const IDEA_WEIGHT = 0.6; // dated events are a little more tempting than evergreen ideas
const SPONSORED_BOOST = 1.5; // always labelled "Sponsored" in the UI
const POOL = 15;
const SAME_CATEGORY_PENALTY = 0.4;

/** 0 = not eligible. Otherwise interest × time fit × sponsorship. */
export function scoreCandidate(c: Candidate, p: Prefs): number {
  if (c.priceBand > p.maxPrice) return 0;
  if (c.suits !== "any" && c.suits !== p.party) return 0;

  let time = IDEA_WEIGHT;
  if (c.startAt) {
    const start = Date.parse(c.startAt);
    const end = c.endAt ? Date.parse(c.endAt) : start;
    if (p.slots.length > 0 && !fitsSlots(start, end, p.slots)) return 0;
    time = 1;
  }

  const interest = c.categorySlugs.length ? Math.max(...c.categorySlugs.map((s) => p.interests[s] ?? NEUTRAL)) : NEUTRAL;
  return interest * time * (c.sponsored ? SPONSORED_BOOST : 1);
}

/**
 * Up to three picks: weighted-random from the best-scoring pool, nudged towards different categories.
 * `rand` is injected so results are reproducible in tests. `exclude` = ids already shown (reroll).
 */
export function pickThree(cands: Candidate[], p: Prefs, rand: () => number, exclude: ReadonlySet<string> = new Set()): Candidate[] {
  const pool = cands
    .filter((c) => !exclude.has(c.id))
    .map((c) => ({ c, s: scoreCandidate(c, p) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, POOL);

  const out: Candidate[] = [];
  while (out.length < 3 && pool.length > 0) {
    const weights = pool.map(({ c, s }) => (out.some((o) => o.categorySlugs[0] === c.categorySlugs[0]) ? s * SAME_CATEGORY_PENALTY : s));
    let r = rand() * weights.reduce((a, b) => a + b, 0);
    let i = weights.findIndex((w) => (r -= w) < 0);
    if (i < 0) i = pool.length - 1;
    out.push(pool[i].c);
    pool.splice(i, 1);
  }
  return out;
}
