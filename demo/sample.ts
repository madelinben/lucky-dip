import type { Candidate, Category, PriceBand } from "../src/lib/types";

export const categories: Category[] = [
  { slug: "running", name: "Running", icon: "PersonStanding", colour: "#f97316" },
  { slug: "cycling", name: "Cycling", icon: "Bike", colour: "#f97316" },
  { slug: "outdoors", name: "Outdoors", icon: "Mountain", colour: "#22c55e" },
  { slug: "arts-culture", name: "Arts & Culture", icon: "Palette", colour: "#a855f7" },
  { slug: "music", name: "Music", icon: "Music", colour: "#ec4899" },
  { slug: "food-drink", name: "Food & Drink", icon: "UtensilsCrossed", colour: "#f59e0b" },
  { slug: "social-community", name: "Social & Community", icon: "Users", colour: "#06b6d4" },
  { slug: "book-clubs", name: "Book clubs", icon: "BookOpen", colour: "#06b6d4" },
  { slug: "film", name: "Cinema", icon: "Camera", colour: "#a855f7" },
  { slug: "games", name: "Game night", icon: "CircleDot", colour: "#6366f1" },
];

const idea = (id: string, title: string, blurb: string, cat: string, priceBand: PriceBand, suits: Candidate["suits"] = "any"): Candidate => ({
  id,
  kind: "idea",
  title,
  blurb,
  categorySlugs: [cat],
  priceBand,
  suits,
  startAt: null,
  endAt: null,
  where: null,
  href: null,
  sponsored: false,
});

const at = (daysFromNow: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const event = (id: string, title: string, blurb: string, cat: string, priceBand: PriceBand, day: number, hour: number, where: string): Candidate => ({
  ...idea(id, title, blurb, cat, priceBand),
  kind: "event",
  startAt: at(day, hour),
  endAt: at(day, hour + 2),
  where,
});

export const candidates: Candidate[] = [
  idea("i1", "Board game café", "Pick a game from the shelf, order a coffee, lose gracefully.", "games", 1, "group"),
  idea("i2", "Go to the cinema", "Check what's on and take the cheap Tuesday seats if you can.", "film", 1),
  idea("i3", "Read a book in a park", "One chapter, one flask, zero screens.", "outdoors", 0, "solo"),
  idea("i4", "Bowling", "Shoes, lanes and a mildly competitive grudge match.", "games", 2, "group"),
  idea("i5", "Easy riverside loop", "Sixty minutes, no pace targets, a coffee at the end.", "running", 0),
  idea("i6", "Climbing wall taster", "Most walls do first-timer sessions with kit hire.", "outdoors", 2),
  idea("i7", "Free gallery wander", "Pick one room and look properly.", "arts-culture", 0),
  idea("i8", "Cook something you've never made", "Choose a cuisine, shop together, share the washing up.", "food-drink", 1, "group"),
  event("e1", "Saturday parkrun", "Free, timed 5k. Walk, jog or run.", "running", 0, 2, 9, "Your nearest parkrun"),
  event("e2", "Pub quiz night", "Teams of up to six. Bring a nerd.", "social-community", 1, 3, 19, "The Old Local"),
  event("e3", "Open-mic evening", "Acoustic sets, new acts, easy listening.", "music", 1, 4, 20, "Town Hall bar"),
  event("e4", "Book club: October pick", "Friendly group, any level of having-finished-it.", "book-clubs", 0, 5, 18, "Central library"),
  event("e5", "Sunday cycle club", "40 km at a social pace with a cake stop.", "cycling", 0, 3, 9, "Market Square"),
];
