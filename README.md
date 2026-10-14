# Lucky Dip

Not sure what to do this weekend? **Swipe** the kinds of things you like, **block out** the times you are free (plus budget and who is coming), then **flip one of three face-down cards**. Shuffle again for another hand.

- `pickThree()` is pure and unit-tested: interest × time fit × sponsorship, weighted-random from the best 15, nudged towards different categories. Dated events beat evergreen ideas slightly; skipped categories keep a small chance so it still surprises.
- The package has no data layer. The host passes `categories` and `candidates` (events + evergreen ideas) and receives `onInterests`, `onChoose`, `onEvent`.
- Preferences persist in localStorage (`lucky-dip:prefs`).

Two ways this repo ships, from the same `src/`:

| Target | How |
|---|---|
| **GitHub Pages** (`madelinben.github.io/lucky-dip/`) | `pnpm build:demo` builds `demo/` (sample data) into `docs/` (Pages source: `main` / `/docs`) |
| **get-out-there** (Cloudflare) | imported as workspace package `@get-out-there/feature-lucky-dip` (`LuckyDipApp`) with real events from the database |

```bash
pnpm install
pnpm dev          # demo at http://localhost:3105/lucky-dip/
pnpm test         # ranking + slot logic
pnpm build:demo   # static site -> docs/
```

Package rules: no router/auth/app imports; Tailwind default palette only; host must `@source` this folder. Peer deps: react, react-dom, lucide-react.
