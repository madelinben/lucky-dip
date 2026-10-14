import { useEffect, useState } from "react";
import { FlipCards } from "./components/FlipCards";
import { SwipeDeck } from "./components/SwipeDeck";
import { type When, WhenPanel } from "./components/WhenPanel";
import { LIKED, pickThree, SKIPPED } from "./lib/pick";
import { slotsFrom } from "./lib/slots";
import { loadSaved, save } from "./lib/storage";
import type { Candidate, Category, Party, PriceBand } from "./lib/types";

const DECK_SIZE = 10;

type Stage = "swipe" | "when" | "cards";
export type DipEvent = "swipe_done" | "when_done" | "reroll" | "choose";

export interface LuckyDipAppProps {
  categories: Category[];
  candidates: Candidate[];
  /** category slug → 0..1, e.g. saved interests of a signed-in user */
  initialInterests?: Record<string, number>;
  /** liked / skipped category slugs after the swipe step (host can persist them) */
  onInterests?: (liked: string[], skipped: string[]) => void;
  onChoose?: (c: Candidate) => void;
  /** lightweight analytics hook */
  onEvent?: (e: DipEvent, detail?: string) => void;
}

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export function LuckyDipApp({
  categories,
  candidates,
  initialInterests,
  onInterests,
  onChoose,
  onEvent,
}: LuckyDipAppProps) {
  const [stage, setStage] = useState<Stage>("swipe");
  const [interests, setInterests] = useState<Record<string, number>>(initialInterests ?? {});
  const [maxPrice, setMaxPrice] = useState<PriceBand>(3);
  const [party, setParty] = useState<Party>("group");
  const [when, setWhen] = useState<When | null>(null);
  const [picks, setPicks] = useState<Candidate[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [deck, setDeck] = useState<Category[]>([]);

  // Restore saved preferences once on the client, then skip straight to "when" if we already know their taste.
  // Mount-only on purpose: re-running when the host passes new array identities would reset the user's progress.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only restore
  useEffect(() => {
    const saved = loadSaved();
    const known = { ...(initialInterests ?? {}), ...(saved?.interests ?? {}) };
    setInterests(known);
    if (saved) {
      setMaxPrice(saved.maxPrice);
      setParty(saved.party);
    }
    setDeck(shuffled(categories).slice(0, DECK_SIZE));
    if (Object.keys(known).length > 0) setStage("when");
  }, []);

  function deal(w: When, exclude: Set<string>, nextInterests = interests) {
    const prefs = {
      interests: nextInterests,
      slots: slotsFrom(w.keys),
      maxPrice: w.maxPrice,
      party: w.party,
    };
    let next = pickThree(candidates, prefs, Math.random, exclude);
    let ids = new Set([...exclude, ...next.map((c) => c.id)]);
    if (next.length === 0 && exclude.size > 0) {
      // ran out of fresh options: start the pool again
      next = pickThree(candidates, prefs, Math.random);
      ids = new Set(next.map((c) => c.id));
    }
    setPicks(next);
    setSeen(ids);
    setStage("cards");
  }

  function swipeDone(liked: string[], skipped: string[]) {
    const next = {
      ...interests,
      ...Object.fromEntries(skipped.map((s) => [s, SKIPPED])),
      ...Object.fromEntries(liked.map((s) => [s, LIKED])),
    };
    setInterests(next);
    save({ interests: next, maxPrice, party });
    onInterests?.(liked, skipped);
    onEvent?.("swipe_done", String(liked.length));
    setStage("when");
  }

  function whenDone(w: When) {
    setWhen(w);
    setMaxPrice(w.maxPrice);
    setParty(w.party);
    save({ interests, maxPrice: w.maxPrice, party: w.party });
    onEvent?.("when_done", `${w.keys.length}|${w.maxPrice}|${w.party}`);
    deal(w, new Set());
  }

  return (
    <div className="bg-white text-slate-900">
      {stage === "swipe" && (
        <SwipeDeck
          categories={deck.length ? deck : categories.slice(0, DECK_SIZE)}
          onDone={swipeDone}
        />
      )}
      {stage === "when" && (
        <>
          <WhenPanel initial={{ maxPrice, party }} onDone={whenDone} />
          <div className="pb-4 text-center">
            <button
              type="button"
              onClick={() => setStage("swipe")}
              className="text-sm text-slate-400 underline"
            >
              Redo my interests
            </button>
          </div>
        </>
      )}
      {stage === "cards" && (
        <FlipCards
          picks={picks}
          onAgain={() => {
            onEvent?.("reroll");
            if (when) deal(when, seen);
          }}
          onChangeTime={() => setStage("when")}
          onChoose={(c) => {
            onEvent?.("choose", c.id);
            onChoose?.(c);
          }}
        />
      )}
    </div>
  );
}
