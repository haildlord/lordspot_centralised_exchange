"use client";

import { useState } from "react";
import type { Depth, OrderBookData, RecentTrade } from "@/lib/types";
import { Tabs } from "@/components/ui/Tabs";
import { OrderBook } from "./OrderBook";
import { RecentTrades } from "./RecentTrades";

const TABS = [
  { id: "book", label: "Book" },
  { id: "trades", label: "Trades" },
] as const;
type BookTab = (typeof TABS)[number]["id"];

export function BookPanel({
  symbol,
  book,
  trades,
  base,
  quote,
  tickSize,
  depth
}: {
  symbol: string;
  book?: OrderBookData;
  trades?: RecentTrade[];
  base?: string;
  quote?: string;
  tickSize?: string;
  depth: Depth
}) {
  const [tab, setTab] = useState<BookTab>("book");

  return (
    <section aria-label="Order book" className="panel flex h-full min-h-0 flex-col overflow-hidden">
      <Tabs label="Book views" items={TABS} value={tab} onChange={setTab} className="shrink-0 border-b border-line px-2" />
      <div key={tab} className="min-h-0 flex-1 animate-fade-in">
        {tab === "book" ? (
          <OrderBook symbol={symbol} book={book} base={base} quote={quote} tickSize={tickSize} depth={depth} />
        ) : (
          <RecentTrades trades={trades} base={base} quote={quote} />
        )}
      </div>
    </section>
  );
}
