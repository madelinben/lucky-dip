import assert from "node:assert/strict";
import { test } from "node:test";
import { LIKED, pickThree, SKIPPED, scoreCandidate } from "./pick.ts";
import { dayKey, fitsSlots, nextDays, quickPick, slotKey, slotsFrom } from "./slots.ts";
import type { Candidate, Prefs } from "./types.ts";

const idea = (id: string, cat: string, o: Partial<Candidate> = {}): Candidate => ({
  id,
  kind: "idea",
  title: id,
  blurb: "",
  categorySlugs: [cat],
  priceBand: 0,
  suits: "any",
  startAt: null,
  endAt: null,
  where: null,
  href: null,
  sponsored: false,
  ...o,
});
const prefs = (o: Partial<Prefs> = {}): Prefs => ({
  interests: {},
  slots: [],
  maxPrice: 3,
  party: "group",
  ...o,
});
const seq = (...vals: number[]) => {
  let i = 0;
  return () => vals[i++ % vals.length];
};

// Saturday 17 Oct 2026, local time
const SAT = new Date(2026, 9, 17, 12);

test("slots: keys become local windows; overlap is half-open", () => {
  const [eve] = slotsFrom([slotKey("2026-10-17", "evening")]);
  assert.equal(new Date(eve.start).getHours(), 17);
  assert.ok(
    fitsSlots(new Date(2026, 9, 17, 18).getTime(), new Date(2026, 9, 17, 20).getTime(), [eve])
  );
  assert.ok(
    !fitsSlots(new Date(2026, 9, 17, 9).getTime(), new Date(2026, 9, 17, 11).getTime(), [eve])
  );
  assert.ok(
    fitsSlots(new Date(2026, 9, 17, 16).getTime(), new Date(2026, 9, 17, 18).getTime(), [eve])
  ); // straddles 17:00
});

test("quickPick: tonight, weekend, anytime", () => {
  const days = nextDays(SAT, 7);
  assert.equal(days[0].key, dayKey(SAT));
  assert.deepEqual(quickPick("tonight", SAT, days), ["2026-10-17|evening"]);
  const weekend = quickPick("weekend", SAT, days);
  assert.equal(weekend.length, 6); // Sat + Sun x 3 dayparts
  assert.deepEqual(quickPick("anytime", SAT, days), []);
});

test("score: price, party and time gates make a candidate ineligible", () => {
  assert.equal(scoreCandidate(idea("a", "x", { priceBand: 2 }), prefs({ maxPrice: 1 })), 0);
  assert.equal(scoreCandidate(idea("a", "x", { suits: "solo" }), prefs({ party: "group" })), 0);
  const ev = idea("e", "x", {
    kind: "event",
    startAt: new Date(2026, 9, 18, 10).toISOString(),
    endAt: new Date(2026, 9, 18, 12).toISOString(),
  });
  assert.equal(
    scoreCandidate(ev, prefs({ slots: slotsFrom([slotKey("2026-10-17", "evening")]) })),
    0
  );
  assert.ok(
    scoreCandidate(ev, prefs({ slots: slotsFrom([slotKey("2026-10-18", "morning")]) })) > 0
  );
});

test("score: liked beats skipped; events beat ideas; sponsored is boosted", () => {
  const p = prefs({ interests: { a: LIKED, b: SKIPPED } });
  assert.ok(scoreCandidate(idea("1", "a"), p) > scoreCandidate(idea("2", "b"), p));
  const ev = idea("e", "a", { kind: "event", startAt: new Date().toISOString() });
  assert.ok(scoreCandidate(ev, p) > scoreCandidate(idea("1", "a"), p));
  assert.ok(
    scoreCandidate(idea("s", "a", { sponsored: true }), p) > scoreCandidate(idea("1", "a"), p)
  );
});

test("pickThree: three distinct picks, spread across categories, reproducible", () => {
  const cands = [
    idea("a1", "a"),
    idea("a2", "a"),
    idea("b1", "b"),
    idea("c1", "c"),
    idea("a3", "a"),
  ];
  const p = prefs({ interests: { a: LIKED, b: LIKED, c: LIKED } });
  const first = pickThree(cands, p, seq(0.1, 0.1, 0.1));
  assert.equal(new Set(first.map((c) => c.id)).size, 3);
  assert.deepEqual(
    first.map((c) => c.id),
    pickThree(cands, p, seq(0.1, 0.1, 0.1)).map((c) => c.id)
  );
  assert.ok(new Set(first.map((c) => c.categorySlugs[0])).size >= 2);
});

test("pickThree: exclude drives rerolls; fewer than three eligible returns what exists", () => {
  const cands = [idea("a", "a"), idea("b", "b"), idea("c", "c"), idea("d", "d")];
  const shown = new Set(pickThree(cands, prefs(), Math.random).map((c) => c.id));
  const again = pickThree(cands, prefs(), Math.random, shown);
  assert.equal(again.length, 1);
  assert.ok(!shown.has(again[0].id));
  assert.deepEqual(pickThree([], prefs(), Math.random), []);
  assert.deepEqual(pickThree(cands, prefs({ maxPrice: 0 }), Math.random).length, 3);
});
