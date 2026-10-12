import { redirect } from "next/navigation";
import { DEFAULT_MARKET, tradeHref } from "@/lib/config";

/** /trade has no screen of its own — it opens the default market. */
export default function TradeIndex() {
  redirect(tradeHref(DEFAULT_MARKET));
}
