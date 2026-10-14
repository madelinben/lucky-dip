export { type DipEvent, LuckyDipApp, type LuckyDipAppProps } from "./LuckyDipApp";
export { pickThree, scoreCandidate } from "./lib/pick";
export type { Candidate, Category, PriceBand } from "./lib/types";

export const meta = {
  id: "lucky-dip",
  title: "Lucky Dip",
  description:
    "Swipe your interests, block out your free time, flip a card and get something to do",
} as const;
