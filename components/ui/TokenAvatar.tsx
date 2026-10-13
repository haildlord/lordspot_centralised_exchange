import { cn } from "@/lib/cn";

function hueOf(symbol: string): number {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) % 360;
  return h;
}

/**
 * Round token badge. Colour is derived from the symbol, so every asset gets a
 * stable look without shipping logos. `USD` renders as a green "$".
 *
 * TODO: when you have real icons, render an <img> here instead.
 */
export function TokenAvatar({
  symbol,
  size = 28,
  className,
}: {
  symbol: string;
  size?: number;
  className?: string;
}) {
  const s = symbol.toUpperCase();
  const isDollar = s === "USD";
  const hue = isDollar ? 156 : hueOf(s);
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-bold leading-none text-white/95 shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_0_0_1px_rgb(255_255_255/0.08)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.44),
        background: s
          ? `linear-gradient(135deg, hsl(${hue} 72% 56%), hsl(${(hue + 36) % 360} 70% 34%))`
          : "linear-gradient(135deg, var(--color-line-2), var(--color-raise))",
      }}
    >
      {isDollar ? "$" : s.slice(0, 1) || "·"}
    </span>
  );
}
