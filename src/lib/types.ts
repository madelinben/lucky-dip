/** 0 free · 1 up to ~£10 · 2 up to ~£30 · 3 splash out */
export type PriceBand = 0 | 1 | 2 | 3;
export type Party = "solo" | "group";

export type Category = { slug: string; name: string; icon: string | null; colour: string | null };

/** Something to do: a dated event (from the events table) or an evergreen idea (cinema, bowling, a good book...). */
export type Candidate = {
  id: string;
  kind: "event" | "idea";
  title: string;
  blurb: string;
  /** own category slug first, then parent slugs; interest = best match */
  categorySlugs: string[];
  priceBand: PriceBand;
  /** who it suits; "any" suits everyone */
  suits: Party | "any";
  /** ISO local date-times; null for ideas */
  startAt: string | null;
  endAt: string | null;
  where: string | null;
  href: string | null;
  sponsored: boolean;
};

/** A free window, epoch ms in the user's local time. */
export type Slot = { start: number; end: number };

export type Prefs = {
  /** category slug → 0..1 */
  interests: Record<string, number>;
  /** empty = any time */
  slots: Slot[];
  maxPrice: PriceBand;
  party: Party;
};

export const PRICE_LABELS: Record<PriceBand, string> = {
  0: "Free",
  1: "Up to £10",
  2: "Up to £30",
  3: "Splash out",
};
