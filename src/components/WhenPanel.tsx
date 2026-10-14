import { useMemo, useState } from "react";
import { DAYPARTS, type Day, nextDays, type QuickPick, quickPick, slotKey } from "../lib/slots";
import { type Party, PRICE_LABELS, type PriceBand } from "../lib/types";

export type When = { keys: string[]; maxPrice: PriceBand; party: Party };

interface WhenPanelProps {
  initial: Pick<When, "maxPrice" | "party">;
  onDone: (w: When) => void;
}

const chip = (on: boolean) =>
  `min-h-11 rounded-xl px-3 text-sm font-bold transition active:scale-[0.97] ${on ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700"}`;

const QUICK: { id: QuickPick; label: string }[] = [
  { id: "tonight", label: "Tonight" },
  { id: "weekend", label: "This weekend" },
  { id: "anytime", label: "Any time" },
];

export function WhenPanel({ initial, onDone }: WhenPanelProps) {
  const now = useMemo(() => new Date(), []);
  const days: Day[] = useMemo(() => nextDays(now, 7), [now]);
  const [keys, setKeys] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<PriceBand>(initial.maxPrice);
  const [party, setParty] = useState<Party>(initial.party);

  const toggle = (k: string) =>
    setKeys((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 p-4">
      <h2 className="text-2xl font-black text-slate-900">When are you free?</h2>

      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q.id}
            type="button"
            className={chip(false)}
            onClick={() => setKeys(quickPick(q.id, now, days))}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center">
          <tbody>
            {days.map((d) => (
              <tr key={d.key}>
                <th
                  scope="row"
                  className="py-1 pr-2 text-left text-sm font-semibold text-slate-600"
                >
                  {d.label}
                </th>
                {DAYPARTS.map((p) => {
                  const k = slotKey(d.key, p.id);
                  return (
                    <td key={p.id} className="p-1">
                      <button
                        type="button"
                        aria-label={`${d.label} ${p.label}`}
                        aria-pressed={keys.includes(k)}
                        onClick={() => toggle(k)}
                        className={`${chip(keys.includes(k))} w-full`}
                      >
                        {p.label}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="-mt-3 text-xs text-slate-500">
        {keys.length
          ? `${keys.length} slot${keys.length === 1 ? "" : "s"} blocked out`
          : "Nothing selected means any time in the next two weeks."}
      </p>

      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-1 text-sm font-semibold text-slate-700">Budget</legend>
        {([0, 1, 2, 3] as PriceBand[]).map((b) => (
          <button
            key={b}
            type="button"
            aria-pressed={maxPrice === b}
            className={chip(maxPrice === b)}
            onClick={() => setMaxPrice(b)}
          >
            {PRICE_LABELS[b]}
          </button>
        ))}
      </fieldset>

      <fieldset className="flex gap-2">
        <legend className="mb-1 text-sm font-semibold text-slate-700">Who&apos;s coming?</legend>
        {(["solo", "group"] as Party[]).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={party === p}
            className={chip(party === p)}
            onClick={() => setParty(p)}
          >
            {p === "solo" ? "Just me" : "With friends"}
          </button>
        ))}
      </fieldset>

      <button
        type="button"
        onClick={() => onDone({ keys, maxPrice, party })}
        className="min-h-14 rounded-2xl bg-orange-600 text-lg font-extrabold text-white shadow-lg transition active:scale-[0.98]"
      >
        Deal me three cards
      </button>
    </div>
  );
}
