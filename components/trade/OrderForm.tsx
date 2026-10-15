"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { Tabs } from "@/components/ui/Tabs";
import { TokenAvatar } from "@/components/ui/TokenAvatar";

export type OrderSide = "buy" | "sell";
export type OrderType = "limit" | "market";

export interface OrderDraft {
  side: OrderSide;
  type: OrderType;
  price: string;
  quantity: string;
  orderValue: string;
  percent: number;
}

interface OrderFormProps {
  base?: string;
  quote?: string;
  isAuthenticated?: boolean;
  balance?: string;
  onSubmit?: (order: OrderDraft) => void;
  onSignUp?: () => void;
  onLogIn?: () => void;
}

const TYPE_TABS = [
  { id: "limit", label: "Limit" },
  { id: "market", label: "Market" },
] as const;

const cleanNumber = (v: string) => v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");

export function OrderForm({
  base,
  quote,
  isAuthenticated = false,
  balance = "-",
  onSubmit,
  onSignUp,
  onLogIn,
}: OrderFormProps) {

  const uid = useId();
  const [side, setSide] = useState<OrderSide>("buy");
  const [type, setType] = useState<OrderType>("limit");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [orderValue, setOrderValue] = useState("");
  const [percent, setPercent] = useState(0);

  const accent = side === "buy" ? "up" : "down";
  const quoteIcon = <TokenAvatar baseSymbol={quote ?? ""} size={24} />;
  const baseIcon = <TokenAvatar baseSymbol={base ?? ""} size={24} />;

  const slider = (
    <div className="flex flex-col gap-0.5">
      <RangeSlider value={percent} onChange={setPercent} accent={accent} ariaLabel="Percent of balance" />
      <div className="num flex justify-between text-[12px] text-fg-3">
        <span>0</span>
        <span>100%</span>
      </div>
    </div>
  );

  return (
    <form
      aria-label="Place order"
      className="panel flex flex-col gap-4 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isAuthenticated) return;
        onSubmit?.({ side, type, price, quantity, orderValue, percent });
      }}
    >

      <div role="tablist" aria-label="Order side" data-side={side} className="side-toggle">
        <span aria-hidden className="side-thumb" />
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            data-side={s}
            aria-selected={side === s}
            onClick={() => setSide(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <Tabs label="Order type" variant="pill" items={TYPE_TABS} value={type} onChange={setType} className="-mt-1 gap-0.5" />

      <div className="flex items-center justify-between text-[12px]">
        <span className="text-fg-3">Balance</span>
        <span className="num text-fg-2">{balance}</span>
      </div>

      <div key={type} className="flex animate-swap flex-col gap-4">
        {type === "limit" ? (
          <>
            <Field id={`${uid}-price`} label="Price" value={price} onChange={setPrice} addon={quoteIcon} />
            <Field id={`${uid}-qty`} label="Quantity" value={quantity} onChange={setQuantity} addon={baseIcon} />
            {slider}
            <Field id={`${uid}-value`} label="Order Value" value={orderValue} onChange={setOrderValue} addon={quoteIcon} />
          </>
        ) : (
          <>
            <Field id={`${uid}-value`} label="Order Value" value={orderValue} onChange={setOrderValue} addon={quoteIcon} />
            {slider}
          </>
        )}
      </div>

      {isAuthenticated ? (
        <button type="submit" className={cn("btn btn-lg w-full", side === "buy" ? "btn-up" : "btn-down")}>
          {side === "buy" ? "Buy" : "Sell"} {base}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button type="button" onClick={onSignUp} className="btn btn-primary btn-lg w-full">
            Sign up to trade
          </button>
          <button type="button" onClick={onLogIn} className="btn btn-secondary btn-lg w-full">
            Log in to trade
          </button>
        </div>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  addon,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  addon: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] text-fg-3">
        {label}
      </label>
      <div className="field">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(cleanNumber(e.target.value))}
        />
        {addon}
      </div>
    </div>
  );
}
