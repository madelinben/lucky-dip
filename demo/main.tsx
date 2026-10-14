import { createRoot } from "react-dom/client";
import { LuckyDipApp } from "../src";
import "./demo.css";
import { candidates, categories } from "./sample";

createRoot(document.getElementById("root") as HTMLElement).render(
  <div className="mx-auto max-w-4xl">
    <h1 className="px-4 pt-6 text-center text-3xl font-black">Lucky Dip</h1>
    <p className="px-4 pb-2 text-center text-sm text-slate-500">Demo with sample data. The full version uses real local events at get-out-there.app.</p>
    <LuckyDipApp categories={categories} candidates={candidates} onChoose={(c) => alert(`You picked: ${c.title}`)} />
  </div>,
);
