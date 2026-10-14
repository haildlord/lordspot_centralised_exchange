# LordsPot — exchange UI

Front end for a Backpack-style order-book exchange (Next.js 16, React 19, Tailwind 4, Cache Components on).
Phase 1 is the UI only; the matching engine and API come in phase 2.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Landing page: search, trending markets, markets table |
| `/trade/[market]` | Terminal: ticker, chart slot, order book / trades, order form |

## Data

Live market list comes from Backpack's public API (`lib/api.ts`, axios). Everything else — tickers, order book,
trades, chart — is not wired yet; those panels render empty states. Shapes the components expect are in `lib/types.ts`.

## Run

```bash
bun install
bun run dev        # http://localhost:3000
./node_modules/.bin/next build   # production build (use Node; `bun run build` fails on Bun 1.1.25)
```

## Layout

- `app/` — routes, root layout, `globals.css` (design tokens, buttons, tabs, motion)
- `components/landing` — landing sections · `components/search` — market search · `components/trade` — terminal panels
- `components/ui` — small shared pieces (logo, tabs, slider, avatar)
