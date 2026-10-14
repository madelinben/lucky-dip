import type { Party, PriceBand } from "./types";

const KEY = "lucky-dip:prefs";

export type Saved = { interests: Record<string, number>; maxPrice: PriceBand; party: Party };

export function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

export function save(s: Saved): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}
