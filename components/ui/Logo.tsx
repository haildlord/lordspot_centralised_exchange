import { cn } from "@/lib/cn";

/**
 * Gold crown tile. The tile is a CSS gradient (not an SVG <defs> gradient) on purpose:
 * SVG gradient ids are document-global, so a copy inside a display:none subtree
 * (e.g. the desktop rail on mobile) would break every other copy. Swap the crown path
 * for your own mark whenever.
 */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid shrink-0 place-items-center shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_4px_14px_-4px_rgb(243_177_58/0.5)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: "linear-gradient(135deg, #ffdc8f 0%, #f3b13a 55%, #c98a1a 100%)",
      }}
    >
      <svg width={size * 0.72} height={size * 0.72} viewBox="4 4 24 24" fill="#1a1206">
        <path d="M7.5 22.5 6 11.5l5.2 4.1L16 8l4.8 7.6L26 11.5l-1.5 11z" />
        <rect x="8" y="24" width="16" height="2.2" rx="1.1" />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight", className)}>
      Lords<span className="text-gold-400">Pot</span>
    </span>
  );
}

export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <Wordmark className="text-[17px]" />
    </span>
  );
}
