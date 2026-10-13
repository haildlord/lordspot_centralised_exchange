import type { Trend } from "@/lib/types";

/** Text colour per trend. Full class names so Tailwind can see them. */
export const TREND_TEXT: Record<Trend, string> = {
  up: "text-up",
  down: "text-down",
  flat: "text-fg-2",
};
