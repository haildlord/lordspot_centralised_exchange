"use client";

import { useState } from "react";
import type { TerminalData } from "@/lib/types";
import { Tabs } from "@/components/ui/Tabs";
import { OrderBook } from "./OrderBook";
import { RecentTrades } from "./RecentTrades";

const TABS = [
  { id: "book", label: "Book" },
  { id: "trades", label: "Trades" },
] as const;
type BookTab = (typeof TABS)[number]["id"];

/** Middle column: Book | Trades. */
export function BookPanel({ data }: { data: TerminalData }) {
  const [tab, setTab] = useState<BookTab>("book");
  const { market } = data;

  return (
    <section aria-label="Order book" className="panel flex h-full min-h-0 flex-col overflow-hidden">
      <Tabs label="Book views" items={TABS} value={tab} onChange={setTab} className="shrink-0 border-b border-line px-2" />
      {/* keyed so the content cross-fades whenever the tab changes */}
      <div key={tab} className="min-h-0 flex-1 animate-fade-in">
        {tab === "book" ? (
          <OrderBook book={data.book} base={market.base} quote={market.quote} tickSize={data.tickSize} />
        ) : (
          <RecentTrades trades={data.trades} base={market.base} quote={market.quote} />
        )}
      </div>
    </section>
  );
}
