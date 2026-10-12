"use client";

import { useState, type ReactNode } from "react";
import {
  BellRing,
  Calendar,
  Camera,
  ChartCandlestick,
  ChevronDown,
  Hexagon,
  Maximize,
  Redo2,
  Undo2,
} from "lucide-react";
import type { Candle, TerminalData } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useUtcClock } from "@/lib/hooks";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { Menu } from "@/components/ui/Menu";
import { CandleChart } from "./CandleChart";

const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"].map((id) => ({ id, label: id }));
const RANGES = ["All", "1y", "6m", "3m", "1m", "5d", "1d"] as const;

/**
 * "Chart" tab: toolbar, OHLC legend, candlestick chart and the range footer.
 * All toolbar controls are local UI state for now.
 *
 * TODO(api): on `timeframe` / `range` change, refetch klines and pass new `candles`.
 */
export function PriceChart({ data }: { data: TerminalData }) {
  const { candles, decimals, volumeLabel, market } = data;
  const [timeframe, setTimeframe] = useState("1h");
  const [range, setRange] = useState<(typeof RANGES)[number]>("All");
  const [overlays, setOverlays] = useState({ ol: true, te: true });
  const [scale, setScale] = useState({ pct: false, log: false, auto: true });
  const [hovered, setHovered] = useState<Candle | null>(null);

  const shown = hovered ?? candles[candles.length - 1];
  const diff = shown.close - shown.open;
  const up = diff >= 0;
  const tone = up ? "text-up" : "text-down";
  const f = (v: number) => v.toFixed(decimals);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* toolbar */}
      <div className="no-scrollbar flex h-10 shrink-0 items-center gap-0.5 overflow-x-auto border-b border-line px-2">
        <Menu
          label="Chart interval"
          items={INTERVALS}
          value={timeframe}
          onSelect={setTimeframe}
          triggerClassName="flex h-8 items-center gap-1 rounded-lg px-2.5 text-[13px] font-medium text-fg-2 hover:bg-white/[0.06] hover:text-fg"
          trigger={(open) => (
            <>
              {timeframe}
              <ChevronDown size={13} className={cn("transition", open && "rotate-180")} />
            </>
          )}
        />
        <Divider />
        <ToolButton label="Candles">
          <ChartCandlestick size={17} />
        </ToolButton>
        <Divider />
        <ToolButton label="Indicators">
          <span className="font-display text-[17px] italic leading-none">fx</span>
        </ToolButton>
        <TextToggle active={overlays.ol} onClick={() => setOverlays((o) => ({ ...o, ol: !o.ol }))} title="Order lines">
          OL
        </TextToggle>
        <TextToggle active={overlays.te} onClick={() => setOverlays((o) => ({ ...o, te: !o.te }))} title="Trade executions">
          TE
        </TextToggle>
        <Divider />
        <ToolButton label="Undo" disabled>
          <Undo2 size={16} />
        </ToolButton>
        <ToolButton label="Redo" disabled>
          <Redo2 size={16} />
        </ToolButton>
        <Divider />
        <ToolButton label="Alerts">
          <BellRing size={16} />
        </ToolButton>
        <ToolButton label="Chart settings">
          <Hexagon size={16} />
        </ToolButton>
        <ToolButton label="Fullscreen">
          <Maximize size={16} />
        </ToolButton>
        <ToolButton label="Screenshot">
          <Camera size={16} />
        </ToolButton>
        <button type="button" className="ml-auto shrink-0 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-fg-3 hover:text-fg">
          Reset
        </button>
      </div>

      {/* chart */}
      <div className="relative min-h-0 flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 opacity-[0.05]"
        >
          <LogoMark size={64} />
          <Wordmark className="text-[56px]" />
        </div>

        <div className="pointer-events-none absolute left-3 top-2 z-10 max-w-[calc(100%-96px)]">
          <div className="flex items-center gap-2 text-[13px] text-fg-2">
            <span className="truncate">
              {market.base}/{market.quote} · {timeframe} · LordsPot
            </span>
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-up/60" />
              <span className="relative size-2 rounded-full bg-up" />
            </span>
          </div>
          <div className="num mt-0.5 flex flex-wrap gap-x-2.5 text-[12px]">
            <Ohlc label="O" value={f(shown.open)} tone={tone} />
            <Ohlc label="H" value={f(shown.high)} tone={tone} />
            <Ohlc label="L" value={f(shown.low)} tone={tone} />
            <Ohlc label="C" value={f(shown.close)} tone={tone} />
            <span className={tone}>
              {up ? "+" : ""}
              {f(diff)} ({up ? "+" : ""}
              {((diff / shown.open) * 100).toFixed(2)}%)
            </span>
          </div>
        </div>

        <CandleChart
          className="absolute inset-0"
          candles={candles}
          decimals={decimals}
          volumeLabel={volumeLabel}
          onHover={setHovered}
        />
      </div>

      {/* footer */}
      <div className="@container flex h-9 shrink-0 items-center gap-0.5 border-t border-line px-2 text-[12px]">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={range === r}
            onClick={() => setRange(r)}
            className={cn(
              "h-6 rounded-md px-2 font-medium transition hover:text-fg",
              range === r ? "bg-raise text-fg" : "text-fg-3",
            )}
          >
            {r}
          </button>
        ))}
        <button type="button" aria-label="Go to date" className="icon-btn ml-1 size-6">
          <Calendar size={14} />
        </button>
        <span className="num ml-auto mr-2 whitespace-nowrap text-fg-3 @max-[560px]:hidden">
          <UtcClock /> (UTC)
        </span>
        <span className="ml-auto @min-[561px]:hidden" aria-hidden />
        {(["pct", "log", "auto"] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={scale[key]}
            onClick={() => setScale((s) => ({ ...s, [key]: !s[key] }))}
            className={cn(
              "h-6 rounded-md px-2 font-medium transition hover:text-fg",
              scale[key] ? "text-gold-400" : "text-fg-3",
            )}
          >
            {key === "pct" ? "%" : key}
          </button>
        ))}
      </div>
    </div>
  );
}

function UtcClock() {
  return <>{useUtcClock()}</>;
}

function Divider() {
  return <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-line" />;
}

function ToolButton({ label, disabled, children }: { label: string; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} className="icon-btn shrink-0 disabled:opacity-40">
      {children}
    </button>
  );
}

function TextToggle({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-8 shrink-0 rounded-lg px-2.5 text-[13px] font-semibold transition hover:bg-white/[0.06]",
        active ? "text-iris" : "text-fg-3",
      )}
    >
      {children}
    </button>
  );
}

function Ohlc({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span>
      <span className="text-fg-3">{label}</span>
      <span className={tone}>{value}</span>
    </span>
  );
}
