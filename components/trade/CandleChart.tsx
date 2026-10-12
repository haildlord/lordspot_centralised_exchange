"use client";

import { useState, type PointerEvent } from "react";
import type { Candle } from "@/lib/types";
import { useElementSize } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const AXIS_W = 64; // price axis on the right
const TIME_H = 26; // time axis along the bottom
const PAD_T = 10;
const GAP = 10; // between price pane and volume pane
const RIGHT_SLOTS = 4; // empty candle-widths of breathing room on the right

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad2 = (n: number) => String(n).padStart(2, "0");

/** Axis label: the day number at midnight, otherwise HH:mm (UTC). */
function axisTime(ms: number): string {
  const d = new Date(ms);
  return d.getUTCHours() === 0 && d.getUTCMinutes() === 0
    ? String(d.getUTCDate())
    : `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

/** Crosshair label: "12 Oct 14:00" (UTC). */
function fullTime(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

/** A 1 / 2 / 5 × 10ⁿ step that yields about `target` gridlines over `range`. */
function niceStep(range: number, target: number): number {
  const raw = range / target;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / magnitude;
  const factor = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  return factor * magnitude;
}

interface CandleChartProps {
  candles: readonly Candle[];
  decimals: number;
  /** Small caption in the volume pane, e.g. "Volume SMA 20.516K". */
  volumeLabel?: string;
  /** Fires with the candle under the crosshair, or null when the pointer leaves. */
  onHover?: (candle: Candle | null) => void;
  className?: string;
}

/**
 * Dependency-free SVG candlestick + volume chart. It fills its parent, measures
 * itself with ResizeObserver, and renders whatever `candles` you pass.
 *
 * TODO(api): feed it real klines. If you'd rather use TradingView's
 * lightweight-charts, mount it in this same box and delete this file.
 */
export function CandleChart({ candles, decimals, volumeLabel, onHover, className }: CandleChartProps) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const [cursor, setCursor] = useState<{ index: number; y: number } | null>(null);

  const ready = width > AXIS_W + 60 && height > 140 && candles.length > 1;

  return (
    <div ref={ref} className={cn("select-none", className)}>
      {ready && (
        <Plot
          width={width}
          height={height}
          candles={candles}
          decimals={decimals}
          volumeLabel={volumeLabel}
          cursor={cursor}
          setCursor={setCursor}
          onHover={onHover}
        />
      )}
    </div>
  );
}

interface PlotProps extends Omit<CandleChartProps, "className"> {
  width: number;
  height: number;
  cursor: { index: number; y: number } | null;
  setCursor: (c: { index: number; y: number } | null) => void;
}

function Plot({ width, height, candles, decimals, volumeLabel, cursor, setCursor, onHover }: PlotProps) {
  const n = candles.length;
  const plotW = width - AXIS_W;
  const bottom = height - TIME_H;
  const volH = Math.max(40, Math.round((bottom - PAD_T) * 0.17));
  const priceBottom = bottom - volH - GAP;
  const priceH = priceBottom - PAD_T;
  const slot = plotW / (n + RIGHT_SLOTS);
  const bodyW = Math.max(1, Math.min(slot * 0.62, 14));

  let lo = Infinity;
  let hi = -Infinity;
  let volMax = 0;
  for (const c of candles) {
    if (c.low < lo) lo = c.low;
    if (c.high > hi) hi = c.high;
    if (c.volume > volMax) volMax = c.volume;
  }
  const padY = (hi - lo) * 0.08 || 1;
  const min = lo - padY;
  const max = hi + padY;

  const x = (i: number) => (i + 0.5) * slot;
  const y = (price: number) => PAD_T + ((max - price) / (max - min)) * priceH;
  const volY = (v: number) => bottom - (v / volMax) * (volH - 6);
  const priceAt = (py: number) => max - ((py - PAD_T) / priceH) * (max - min);

  const step = niceStep(max - min, 6);
  const priceTicks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) priceTicks.push(v);

  const every = 6 * Math.ceil(76 / (slot * 6));
  const timeTicks: number[] = [];
  for (let i = n - 1; i >= 0; i -= every) timeTicks.push(i);

  const last = candles[n - 1];
  const lastUp = last.close >= last.open;
  const lastColor = lastUp ? "var(--color-up)" : "var(--color-down)";
  const lastY = y(last.close);

  function handleMove(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    if (px < 0 || px > plotW || py < 0 || py > bottom) return handleLeave();
    const index = Math.min(n - 1, Math.max(0, Math.floor(px / slot)));
    setCursor({ index, y: py });
    onHover?.(candles[index]);
  }
  function handleLeave() {
    if (!cursor) return;
    setCursor(null);
    onHover?.(null);
  }

  const hovered = cursor ? candles[cursor.index] : null;

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label="Price chart"
      className="block touch-pan-y"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {/* grid */}
      {priceTicks.map((v) => (
        <g key={v}>
          <line x1={0} x2={plotW} y1={y(v)} y2={y(v)} stroke="var(--color-line)" strokeOpacity={0.7} shapeRendering="crispEdges" />
          <text x={plotW + 10} y={y(v) + 4} fontSize={11} className="num" fill="var(--color-fg-3)">
            {v.toFixed(decimals)}
          </text>
        </g>
      ))}
      {timeTicks.map((i) => (
        <g key={i}>
          <line x1={x(i)} x2={x(i)} y1={PAD_T} y2={bottom} stroke="var(--color-line)" strokeOpacity={0.45} shapeRendering="crispEdges" />
          <text x={x(i)} y={height - 8} fontSize={11} textAnchor="middle" className="num" fill="var(--color-fg-3)">
            {axisTime(candles[i].time)}
          </text>
        </g>
      ))}
      <line x1={0} x2={plotW + 4} y1={bottom} y2={bottom} stroke="var(--color-line-2)" shapeRendering="crispEdges" />
      <line x1={plotW} x2={plotW} y1={0} y2={bottom} stroke="var(--color-line)" shapeRendering="crispEdges" />

      {/* volume caption */}
      {volumeLabel && (
        <text x={8} y={priceBottom + GAP + 13} fontSize={11} className="num" fill="var(--color-fg-3)">
          {volumeLabel}
        </text>
      )}

      {/* candles + volume */}
      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const color = up ? "var(--color-up)" : "var(--color-down)";
        const cx = x(i);
        const top = y(Math.max(c.open, c.close));
        const bodyH = Math.max(1, Math.abs(y(c.open) - y(c.close)));
        return (
          <g key={c.time}>
            <line x1={cx} x2={cx} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1} shapeRendering="crispEdges" />
            <rect x={cx - bodyW / 2} y={top} width={bodyW} height={bodyH} fill={color} shapeRendering="crispEdges" />
            <rect
              x={cx - bodyW / 2}
              y={volY(c.volume)}
              width={bodyW}
              height={bottom - volY(c.volume)}
              fill={color}
              opacity={0.38}
              shapeRendering="crispEdges"
            />
          </g>
        );
      })}

      {/* last-price line + tag */}
      <line x1={0} x2={plotW} y1={lastY} y2={lastY} stroke={lastColor} strokeDasharray="3 4" strokeOpacity={0.75} />
      <g>
        <rect x={plotW} y={lastY - 10} width={AXIS_W} height={20} rx={4} fill={lastColor} />
        <text x={plotW + 10} y={lastY + 4} fontSize={11} fontWeight={600} className="num" fill="#06130d">
          {last.close.toFixed(decimals)}
        </text>
      </g>

      {/* crosshair */}
      {cursor && hovered && (
        <g pointerEvents="none">
          <line x1={x(cursor.index)} x2={x(cursor.index)} y1={PAD_T} y2={bottom} stroke="var(--color-fg-3)" strokeDasharray="3 3" />
          {cursor.y <= priceBottom && (
            <>
              <line x1={0} x2={plotW} y1={cursor.y} y2={cursor.y} stroke="var(--color-fg-3)" strokeDasharray="3 3" />
              <rect x={plotW} y={cursor.y - 10} width={AXIS_W} height={20} rx={4} fill="var(--color-line-2)" />
              <text x={plotW + 10} y={cursor.y + 4} fontSize={11} className="num" fill="var(--color-fg)">
                {priceAt(cursor.y).toFixed(decimals)}
              </text>
            </>
          )}
          <rect x={x(cursor.index) - 44} y={bottom + 3} width={88} height={20} rx={4} fill="var(--color-line-2)" />
          <text x={x(cursor.index)} y={bottom + 17} fontSize={11} textAnchor="middle" className="num" fill="var(--color-fg)">
            {fullTime(hovered.time)}
          </text>
        </g>
      )}
    </svg>
  );
}
