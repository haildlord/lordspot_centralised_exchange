"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { ArrowDown, ChartCandlestick, Coins, LayoutGrid, Search, TrendingUp, type LucideIcon } from "lucide-react";
import type { Market, Ticker, Trend } from "@/lib/types";
import { cn } from "@/lib/cn";
import { PairLabel } from "@/components/ui/PairLabel";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { TREND_TEXT } from "@/components/ui/trend";

type CategoryId = "all" | "stocks" | "crypto" | "perps";

const CATEGORIES: ReadonlyArray<{ id: CategoryId; label: string; icon: LucideIcon }> = [
  { id: "all", label: "All markets", icon: LayoutGrid },
  { id: "stocks", label: "Stocks", icon: ChartCandlestick },
  { id: "crypto", label: "Crypto", icon: Coins },
  { id: "perps", label: "Perps", icon: TrendingUp },
];

const COLS = "grid-cols-[minmax(0,1fr)_116px_92px_96px]";
const EMPTY = "—";

/** Which sidebar category a market lives under: perps, then tokenized stocks / indexes, else crypto. */
function categoryOf(m: Market): Exclude<CategoryId, "all"> {
  if (m.marketType === "PERP") return "perps";
  return m.rwaMarketType ? "stocks" : "crypto";
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Market search. Filtering runs client-side over the `markets` prop.
 * Inside the open dialog: ↑ / ↓ move the highlight, Enter opens it, Esc closes.
 * `closing` plays the exit animation; the provider unmounts us right after.
 * Price, change and volume come from `tickers` (keyed by market symbol); dashes until it is passed.
 */
export function MarketPalette({
  markets,
  tickers,
  closing,
  onClose,
}: {
  markets: Market[];
  tickers?: Record<string, Ticker>;
  closing: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId>("all");
  const [active, setActive] = useState(0);
  // Rows stagger in on first open only — not every time the list is re-filtered.
  const [intro, setIntro] = useState(true);

  const results = useMemo(() => {
    const q = normalize(query);
    return markets.filter((m) => {
      if (category !== "all" && categoryOf(m) !== category) return false;
      if (!q) return true;
      return normalize(m.symbol).includes(q) || normalize(m.baseSymbol).includes(q);
    });
  }, [markets, query, category]);

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  // Focus the input on open, lock page scroll, and give focus back on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const introTimer = setTimeout(() => setIntro(false), 900);
    return () => {
      clearTimeout(introTimer);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Glide the highlight to the active row (before paint, so it never lags a frame)
  // and keep that row in view while arrowing through a long list.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const row = list.querySelector<HTMLElement>('[data-active="true"]');
    if (!row) {
      list.style.setProperty("--glide-o", "0");
      return;
    }
    list.style.setProperty("--glide-y", `${row.offsetTop}px`);
    list.style.setProperty("--glide-h", `${row.offsetHeight}px`);
    list.style.setProperty("--glide-o", "1");
    row.scrollIntoView({ block: "nearest" });
  }, [activeIndex, results]);

  function changeCategory(next: CategoryId) {
    setCategory(next);
    setActive(0);
  }
  function open(market: Market) {
    router.push(`/trade/${market.symbol}`);
    onClose();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (closing) return;
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length) setActive((a) => (Math.min(a, results.length - 1) + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length) setActive((a) => (Math.min(a, results.length - 1) - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      const market = results[activeIndex];
      if (market) {
        e.preventDefault();
        open(market);
      }
    }
  }

  return (
    <div
      className="palette-overlay fixed inset-0 z-[100] flex items-start justify-center p-8 pt-[7vh]"
      data-state={closing ? "closed" : "open"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !closing) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search markets"
        onKeyDown={onKeyDown}
        className="palette-dialog grid h-[min(680px,calc(100dvh-14vh))] w-full max-w-[1000px] grid-cols-[212px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] overflow-hidden rounded-3xl border border-line-2 bg-panel shadow-[0_50px_140px_-30px_rgb(0_0_0/0.95),0_0_0_1px_rgb(255_255_255/0.03)]"
      >
        {/* ── category sidebar ── */}
        <aside className="flex flex-col border-r border-line bg-bg/60 p-3">
          <p className="px-3 pb-2 pt-2 text-[11px] font-semibold tracking-[0.16em] text-fg-3">CATEGORY</p>
          <nav className="flex flex-col gap-1" aria-label="Market category">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={category === id}
                onClick={() => changeCategory(id)}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-[background-color,color,box-shadow] duration-300",
                  category === id
                    ? "bg-raise text-fg shadow-[inset_0_0_0_1px_var(--color-line-2)]"
                    : "text-fg-2 hover:bg-white/[0.04] hover:text-fg",
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "transition-[color,transform] duration-300",
                    category === id ? "text-gold-400" : "text-fg-3 group-hover:scale-110 group-hover:text-fg-2",
                  )}
                />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── main column ── */}
        <div className="flex min-h-0 flex-col">
          <div className="p-4 pb-0">
            <div className="group flex h-14 items-center gap-3 rounded-2xl border border-line bg-bg px-4 transition-[border-color,box-shadow] duration-300 focus-within:border-gold-500/70 focus-within:shadow-[0_0_0_4px_rgb(243_177_58/0.1),0_12px_32px_-16px_rgb(243_177_58/0.45)]">
              <Search size={20} className="shrink-0 text-fg-3 transition-colors group-focus-within:text-gold-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
                aria-label="Search a ticker or name"
                placeholder="Search a ticker or name"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent text-[17px] text-fg outline-none placeholder:text-fg-3"
              />
            </div>

            <div className={cn("mt-4 grid items-center gap-x-3 px-3 text-[12px] font-medium text-fg-3", COLS)}>
              <span>Market</span>
              <span className="text-right">Last price</span>
              <span className="text-right">24h change</span>
              <span className="flex items-center justify-end gap-1 text-fg">
                24h volume <ArrowDown size={13} />
              </span>
            </div>
          </div>

          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Markets"
            className="palette-list mt-1 min-h-0 flex-1 overflow-y-auto px-3 pb-2"
          >
            <li role="presentation" aria-hidden className="palette-glide" />

            {results.map((m, i) => {
              const isActive = i === activeIndex;
              const t = tickers?.[m.symbol];
              const pct = Number(t?.priceChangePercent ?? 0);
              const trend: Trend = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
              const changePct = t?.priceChangePercent ? `${pct > 0 ? "+" : ""}${(pct * 100).toFixed(2)}%` : EMPTY;
              return (
                <li
                  key={m.symbol}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isActive}
                  data-active={isActive}
                  data-intro={intro}
                  style={{ "--i": i } as CSSProperties}
                  onMouseMove={() => i !== active && setActive(i)}
                  className="palette-row relative flex items-center rounded-2xl"
                >
                  <Link
                    href={`/trade/${m.symbol}`}
                    onClick={onClose}
                    tabIndex={-1}
                    className={cn("grid min-w-0 flex-1 items-center gap-x-3 px-3 py-2.5", COLS)}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <TokenAvatar baseSymbol={m.baseSymbol} size={38} />
                      <span className="min-w-0">
                        <span className="block text-[16px] leading-tight">
                          <PairLabel market={m} />
                        </span>
                        <span className="block truncate text-[13px] text-fg-3">
                          {m.marketType === "PERP" ? "Perpetual" : "Spot"}
                        </span>
                      </span>
                    </span>
                    <span className="num text-right text-[15px] font-medium text-fg">{t?.lastPrice ?? EMPTY}</span>
                    <span className={cn("num text-right text-[14px]", TREND_TEXT[trend])}>
                      {changePct}
                    </span>
                    <span className="num text-right text-[14px] text-fg-2">{t?.volume ?? EMPTY}</span>
                  </Link>
                </li>
              );
            })}

            {results.length === 0 && (
              <li role="presentation" className="animate-fade-in px-6 py-16 text-center text-[14px] text-fg-3">
                No markets found
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
