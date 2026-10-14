import { CalendarDays, MapPin, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { type Candidate, PRICE_LABELS } from "../lib/types";

const when = (c: Candidate) =>
  c.startAt
    ? new Date(c.startAt).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "Any time";

function Face({ c, onChoose }: { c: Candidate; onChoose: (c: Candidate) => void }) {
  return (
    <div className="flex h-full flex-col gap-2 p-4 text-left">
      {c.sponsored && <span className="w-fit rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">Sponsored</span>}
      <h3 className="text-lg font-black leading-tight text-slate-900">{c.title}</h3>
      <p className="line-clamp-4 text-sm text-slate-600">{c.blurb}</p>
      <div className="mt-auto flex flex-col gap-1 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1">
          <CalendarDays size={12} /> {when(c)}
        </span>
        {c.where && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {c.where}
          </span>
        )}
        <span>{PRICE_LABELS[c.priceBand]}</span>
      </div>
      <button type="button" onClick={() => onChoose(c)} className="mt-2 min-h-11 rounded-xl bg-orange-600 text-sm font-extrabold text-white transition active:scale-[0.97]">
        Let&apos;s do this
      </button>
    </div>
  );
}

function FlipCard({ c, index, onChoose }: { c: Candidate; index: number; onChoose: (c: Candidate) => void }) {
  const [up, setUp] = useState(false);
  return (
    <div className="h-72 w-full [perspective:900px]">
      <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:duration-0" style={{ transform: up ? "rotateY(180deg)" : "none" }}>
        <button
          type="button"
          aria-label={`Reveal card ${index + 1}`}
          aria-hidden={up}
          tabIndex={up ? -1 : 0}
          onClick={() => setUp(true)}
          className="absolute inset-0 grid place-items-center rounded-3xl bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-xl [backface-visibility:hidden]"
        >
          <span className="flex flex-col items-center gap-2">
            <Sparkles size={40} />
            <span className="text-5xl font-black">?</span>
            <span className="text-sm font-semibold opacity-80">Tap to flip</span>
          </span>
        </button>
        <div aria-hidden={!up} className="absolute inset-0 overflow-hidden rounded-3xl bg-white shadow-xl ring-2 ring-orange-200 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {up && <Face c={c} onChoose={onChoose} />}
        </div>
      </div>
    </div>
  );
}

interface FlipCardsProps {
  picks: Candidate[];
  onAgain: () => void;
  onChangeTime: () => void;
  onChoose: (c: Candidate) => void;
}

export function FlipCards({ picks, onAgain, onChangeTime, onChoose }: FlipCardsProps) {
  if (picks.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <p className="text-lg font-bold text-slate-800">Nothing matches that combination yet.</p>
        <p className="text-sm text-slate-500">Try more free time slots or a bigger budget.</p>
        <button type="button" onClick={onChangeTime} className="min-h-12 rounded-xl bg-orange-600 px-6 font-bold text-white">
          Change my free time
        </button>
      </div>
    );
  }
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4">
      <h2 className="text-center text-2xl font-black text-slate-900">Pick a card, any card</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {picks.map((c, i) => (
          <FlipCard key={c.id} c={c} index={i} onChoose={onChoose} />
        ))}
      </div>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={onAgain} className="flex min-h-12 items-center gap-2 rounded-xl bg-slate-100 px-4 font-bold text-slate-700 transition active:scale-[0.97]">
          <RotateCcw size={16} /> Shuffle again
        </button>
        <button type="button" onClick={onChangeTime} className="min-h-12 rounded-xl px-4 font-semibold text-slate-500">
          Change time
        </button>
      </div>
    </div>
  );
}
