import type { Slot } from "./types";

export type Daypart = "morning" | "afternoon" | "evening";

export const DAYPARTS: { id: Daypart; label: string; from: number; to: number }[] = [
  { id: "morning", label: "Morning", from: 6, to: 12 },
  { id: "afternoon", label: "Afternoon", from: 12, to: 17 },
  { id: "evening", label: "Evening", from: 17, to: 24 },
];

const pad = (n: number) => String(n).padStart(2, "0");
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** "2026-10-17|evening" */
export const slotKey = (day: string, part: Daypart) => `${day}|${part}`;

export type Day = { key: string; label: string; weekend: boolean };

/** `n` consecutive local days starting at `from`. */
export function nextDays(from: Date, n = 7): Day[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const dow = d.getDay();
    return {
      key: dayKey(d),
      label: i === 0 ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }),
      weekend: dow === 0 || dow === 6,
    };
  });
}

/** Turn selected "day|part" keys into concrete local-time windows. */
export function slotsFrom(keys: string[]): Slot[] {
  return keys.flatMap((k) => {
    const [day, part] = k.split("|");
    const dp = DAYPARTS.find((p) => p.id === part);
    const [y, m, d] = day.split("-").map(Number);
    if (!dp || !y || !m || !d) return [];
    return [{ start: new Date(y, m - 1, d, dp.from).getTime(), end: new Date(y, m - 1, d, dp.to).getTime() }];
  });
}

/** True when [startMs, endMs] overlaps any slot. */
export const fitsSlots = (startMs: number, endMs: number, slots: Slot[]) =>
  slots.some((s) => startMs < s.end && Math.max(endMs, startMs) > s.start);

export type QuickPick = "tonight" | "weekend" | "anytime";

export function quickPick(kind: QuickPick, now: Date, days: Day[]): string[] {
  switch (kind) {
    case "tonight":
      return [slotKey(dayKey(now), "evening")];
    case "weekend":
      return days.filter((d) => d.weekend).flatMap((d) => DAYPARTS.map((p) => slotKey(d.key, p.id)));
    case "anytime":
      return [];
    default:
      return kind satisfies never;
  }
}
