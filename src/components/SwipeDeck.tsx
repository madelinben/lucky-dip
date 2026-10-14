import { Heart, X } from "lucide-react";
import { useRef, useState } from "react";
import type { Category } from "../lib/types";
import { CategoryIcon } from "./CategoryIcon";

const THRESHOLD = 90;

type Choice = "like" | "skip";

function Card({
  cat,
  depth,
  onSwipe,
}: {
  cat: Category;
  depth: number;
  onSwipe: (c: Choice) => void;
}) {
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const startX = useRef(0);
  const top = depth === 0;
  const colour = cat.colour ?? "#f97316";

  const end = () => {
    if (!drag) return;
    setDrag(false);
    if (Math.abs(dx) >= THRESHOLD) onSwipe(dx > 0 ? "like" : "skip");
    else setDx(0);
  };

  return (
    <div
      className="absolute inset-0 flex select-none flex-col items-center justify-center gap-5 rounded-3xl border-4 bg-white p-6 shadow-xl"
      style={{
        borderColor: colour,
        zIndex: 10 - depth,
        touchAction: "none",
        cursor: top ? (drag ? "grabbing" : "grab") : "default",
        transition: drag ? "none" : "transform 0.25s ease",
        transform: top
          ? `translateX(${dx}px) rotate(${dx * 0.05}deg)`
          : `translateY(${depth * 12}px) scale(${1 - depth * 0.05})`,
      }}
      onPointerDown={(e) => {
        if (!top) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        startX.current = e.clientX;
        setDrag(true);
      }}
      onPointerMove={(e) => drag && setDx(e.clientX - startX.current)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <span
        className="pointer-events-none absolute left-4 top-4 -rotate-12 rounded-xl border-4 border-emerald-500 px-3 py-1 text-2xl font-black text-emerald-500"
        style={{ opacity: Math.max(0, Math.min(1, dx / THRESHOLD)) }}
      >
        YES
      </span>
      <span
        className="pointer-events-none absolute right-4 top-4 rotate-12 rounded-xl border-4 border-rose-500 px-3 py-1 text-2xl font-black text-rose-500"
        style={{ opacity: Math.max(0, Math.min(1, -dx / THRESHOLD)) }}
      >
        NOPE
      </span>
      <span
        className="grid size-28 place-items-center rounded-full text-white"
        style={{ backgroundColor: colour }}
      >
        <CategoryIcon name={cat.icon} />
      </span>
      <h3 className="text-center text-3xl font-black text-slate-900">{cat.name}</h3>
      <p className="text-sm text-slate-500">Drag right if you fancy it, left if not</p>
    </div>
  );
}

interface SwipeDeckProps {
  categories: Category[];
  onDone: (liked: string[], skipped: string[]) => void;
}

export function SwipeDeck({ categories, onDone }: SwipeDeckProps) {
  const [i, setI] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);

  function swipe(choice: Choice) {
    const cat = categories[i];
    if (!cat) return;
    const l = choice === "like" ? [...liked, cat.slug] : liked;
    const s = choice === "skip" ? [...skipped, cat.slug] : skipped;
    setLiked(l);
    setSkipped(s);
    if (i + 1 >= categories.length) onDone(l, s);
    else setI(i + 1);
  }

  const visible = categories.slice(i, i + 3);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <p className="text-sm font-semibold text-slate-500">
        {i + 1} of {categories.length} · {liked.length} liked
      </p>
      <div className="relative h-80 w-72 sm:h-96 sm:w-80">
        {[...visible].reverse().map((cat, idx) => {
          const depth = visible.length - 1 - idx;
          return (
            <Card key={cat.slug} cat={cat} depth={depth} onSwipe={depth === 0 ? swipe : () => {}} />
          );
        })}
      </div>
      <div className="flex items-center gap-8">
        <button
          type="button"
          aria-label="Not for me"
          onClick={() => swipe("skip")}
          className="grid size-16 place-items-center rounded-full border-2 border-rose-200 bg-white text-rose-500 shadow-md transition active:scale-90"
        >
          <X size={28} />
        </button>
        <button
          type="button"
          aria-label="Sounds good"
          onClick={() => swipe("like")}
          className="grid size-20 place-items-center rounded-full border-2 border-emerald-200 bg-white text-emerald-500 shadow-lg transition active:scale-90"
        >
          <Heart size={34} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onDone(liked, skipped)}
        className="text-sm text-slate-400 underline"
      >
        Enough, surprise me
      </button>
    </div>
  );
}
