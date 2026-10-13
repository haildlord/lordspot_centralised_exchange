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
import {
  ArrowDown,
  ChartCandlestick,
  Coins,
  LayoutGrid,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { Market } from "@/lib/types";
import { cn } from "@/lib/cn";
import { PairLabel } from "@/components/ui/PairLabel";
import { Tabs } from "@/components/ui/Tabs";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { TREND_TEXT } from "@/components/ui/trend";

type CategoryId = "all" | "stocks" | "crypto" | "perps";
type Scope = "all" | "watchlist";

const CATEGORIES: ReadonlyArray<{ id: CategoryId; label: string; icon: LucideIcon }> = [
  { id: "all", label: "All markets", icon: LayoutGrid },
  { id: "stocks", label: "Stocks", icon: ChartCandlestick },
  { id: "crypto", label: "Crypto", icon: Coins },
  { id: "perps", label: "Perps", icon: TrendingUp },
];

const SCOPES = [
  { id: "all", label: "All" },
  { id: "watchlist", label: "Watchlist" },
] as const;

const COLS = "grid-cols-[minmax(0,1fr)_116px_92px_96px]";

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Market search (the "command palette").
 * Everything here is client-side UI state; filtering runs over the `markets` prop.
 *
 * `closing` plays the exit animation; the provider unmounts us right after.
 *
 * TODO(api): to search server-side, replace the `results` memo with a fetch keyed on
 *            `query` / `category`. Watchlist stars are local state — persist them.
 *            `onAiSearch` is a placeholder for the AI Search buttons.
 */
export function MarketPalette({
  markets,
  closing,
  onClose,
  onAiSearch,
}: {
  markets: Market[];
  closing: boolean;
  onClose: () => void;
  onAiSearch?: (query: string) => void;
}) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId>("all");
  const [scope, setScope] = useState<Scope>("all");
  const [active, setActive] = useState(0);
  const [watchlist, setWatchlist] = useState<ReadonlySet<string>>(new Set());
  // Rows stagger in on first open only — not every time the list is re-filtered.
  const [intro, setIntro] = useState(true);

  const results = useMemo(() => {
    const q = normalize(query);
    return markets.filter((m) => {
      if (category !== "all" && m.category !== category) return false;
      if (scope === "watchlist" && !watchlist.has(m.symbol)) return false;
      if (!q) return true;
      return normalize(m.symbol).includes(q) || normalize(m.name).includes(q);
    });
  }, [markets, query, category, scope, watchlist]);

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
  function changeScope(next: Scope) {
    setScope(next);
    setActive(0);
  }
  function cycleCategory(delta: number) {
    const i = CATEGORIES.findIndex((c) => c.id === category);
    changeCategory(CATEGORIES[(i + delta + CATEGORIES.length) % CATEGORIES.length].id);
  }
  function toggleWatch(symbol: string) {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (!next.delete(symbol)) next.add(symbol);
      return next;
    });
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
    } else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      cycleCategory(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      changeScope(scope === "all" ? "watchlist" : "all");
    } else if (e.key === "Tab") {
      e.preventDefault();
      changeScope(scope === "all" ? "watchlist" : "all");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length) setActive((activeIndex + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length) setActive((activeIndex - 1 + results.length) % results.length);
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
          <div className="mx-3 my-3 h-px bg-line" />
          <button
            type="button"
            onClick={() => onAiSearch?.(query)}
            className="group flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-fg-2 transition-[background-color,color] duration-300 hover:bg-white/[0.04] hover:text-fg"
          >
            <Sparkles size={18} className="text-iris transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
            AI Search
          </button>
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
              <button type="button" onClick={() => onAiSearch?.(query)} className="btn btn-secondary btn-sm">
                <Sparkles size={15} className="text-iris" />
                AI Search
              </button>
            </div>

            <Tabs
              label="Market list scope"
              variant="pill"
              items={SCOPES}
              value={scope}
              onChange={changeScope}
              className="mt-3 gap-1"
            />

            <div className={cn("mt-3 grid items-center gap-x-3 px-3 pr-14 text-[12px] font-medium text-fg-3", COLS)}>
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
              const watched = watchlist.has(m.symbol);
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
                  className="palette-row group relative flex items-center rounded-2xl"
                >
                  <Link
                    href={`/trade/${m.symbol}`}
                    onClick={onClose}
                    tabIndex={-1}
                    className={cn("grid min-w-0 flex-1 items-center gap-x-3 px-3 py-2.5", COLS)}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <TokenAvatar symbol={m.base} size={38} />
                      <span className="min-w-0">
                        <span className="block text-[16px] leading-tight">
                          <PairLabel market={m} />
                        </span>
                        <span className="block truncate text-[13px] text-fg-3">{m.name}</span>
                      </span>
                    </span>
                    <span className="num text-right text-[15px] font-medium text-fg">{m.lastPrice}</span>
                    <span className={cn("num text-right text-[14px]", TREND_TEXT[m.trend])}>
                      {m.changePct}
                    </span>
                    <span className="num text-right text-[14px] text-fg-2">{m.volume}</span>
                  </Link>
                  <button
                    type="button"
                    aria-pressed={watched}
                    aria-label={watched ? `Remove ${m.symbol} from watchlist` : `Add ${m.symbol} to watchlist`}
                    onClick={() => toggleWatch(m.symbol)}
                    className={cn(
                      "icon-btn mr-2 size-10",
                      watched ? "text-gold-400" : "text-fg-3 opacity-70 group-data-[active=true]:opacity-100",
                    )}
                  >
                    <Star
                      size={18}
                      className={cn("transition-transform duration-300 ease-spring", watched && "scale-110 fill-current")}
                    />
                  </button>
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
