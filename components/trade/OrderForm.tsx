"use client";

import { useId, useState, type ReactNode } from "react";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import type { Market } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Checkbox } from "@/components/ui/Checkbox";
import { Menu } from "@/components/ui/Menu";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { Tabs } from "@/components/ui/Tabs";
import { TokenAvatar } from "@/components/ui/TokenAvatar";

export type OrderSide = "buy" | "sell";
export type OrderType = "limit" | "market" | "conditional";
export type TriggerType = "mark" | "last" | "index";

/** Everything the ticket knows when the user presses the button. Validate and send it however you like. */
export interface OrderDraft {
  side: OrderSide;
  type: OrderType;
  price: string;
  quantity: string;
  orderValue: string;
  /** 0–100 from the slider. */
  percent: number;
  postOnly: boolean;
  ioc: boolean;
  triggerType: TriggerType;
  triggerPrice: string;
  /** Conditional orders: also set a limit price once triggered. */
  useLimitPrice: boolean;
  /** Market orders: is `orderValue` in the quote asset (true) or the base asset (false)? */
  valueInQuote: boolean;
}

interface OrderFormProps {
  market: Market;
  isAuthenticated?: boolean;
  /** Free balance shown under the tabs. "-" while logged out. */
  balance?: string;
  onSubmit?: (order: OrderDraft) => void;
  onSignUp?: () => void;
  onLogIn?: () => void;
  onPricePreset?: (preset: "mid" | "bbo") => void;
}

const TYPE_TABS = [
  { id: "limit", label: "Limit" },
  { id: "market", label: "Market" },
  {
    id: "conditional",
    label: (
      <>
        Conditional <ChevronDown size={14} />
      </>
    ),
  },
] as const;

const TRIGGERS = [
  { id: "mark", label: "Mark" },
  { id: "last", label: "Last" },
  { id: "index", label: "Index" },
] as const;

/** Digits and a single dot only. */
const cleanNumber = (v: string) => v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");

/**
 * Order ticket. All state here is local; nothing is calculated.
 * Quantity ↔ order value ↔ slider are deliberately NOT linked — wire your maths in `onSubmit`
 * or by lifting the state up.
 *
 * TODO(api): balance, price presets (Mid / BBO), submit, and the auth buttons.
 */
export function OrderForm({
  market,
  isAuthenticated = false,
  balance = "-",
  onSubmit,
  onSignUp,
  onLogIn,
  onPricePreset,
}: OrderFormProps) {
  const uid = useId();
  const [side, setSide] = useState<OrderSide>("buy");
  const [type, setType] = useState<OrderType>("limit");
  const [price, setPrice] = useState(market.lastPrice.replaceAll(",", ""));
  const [quantity, setQuantity] = useState("");
  const [orderValue, setOrderValue] = useState("");
  const [percent, setPercent] = useState(0);
  const [postOnly, setPostOnly] = useState(false);
  const [ioc, setIoc] = useState(false);
  const [triggerType, setTriggerType] = useState<TriggerType>("mark");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [useLimitPrice, setUseLimitPrice] = useState(false);
  const [valueInQuote, setValueInQuote] = useState(true);

  const accent = side === "buy" ? "up" : "down";
  const quoteIcon = <TokenAvatar symbol={market.quote} size={24} />;
  const baseIcon = <TokenAvatar symbol={market.base} size={24} />;

  const priceField = (
    <Field
      id={`${uid}-price`}
      label={type === "conditional" ? "Limit Price" : "Price"}
      value={price}
      onChange={setPrice}
      addon={quoteIcon}
      right={
        type === "limit" ? (
          <span className="flex items-center gap-2.5 text-[12px] font-medium">
            <button type="button" onClick={() => onPricePreset?.("mid")} className="text-iris hover:underline">
              Mid
            </button>
            <button type="button" onClick={() => onPricePreset?.("bbo")} className="text-iris hover:underline">
              BBO
            </button>
          </span>
        ) : undefined
      }
    />
  );

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
        onSubmit?.({
          side,
          type,
          price,
          quantity,
          orderValue,
          percent,
          postOnly,
          ioc,
          triggerType,
          triggerPrice,
          useLimitPrice,
          valueInQuote,
        });
      }}
    >
      {/* buy / sell — one thumb slides and re-tints */}
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

      {/* keyed on the order type so the fields cross-fade when it changes */}
      <div key={type} className="flex animate-swap flex-col gap-4">
        {/* ── Limit ── */}
        {type === "limit" && (
          <>
            {priceField}
            <Field
              id={`${uid}-qty`}
              label="Quantity"
              value={quantity}
              onChange={setQuantity}
              addon={baseIcon}
            />
            {slider}
            <Field
              id={`${uid}-value`}
              label="Order Value"
              value={orderValue}
              onChange={setOrderValue}
              addon={quoteIcon}
            />
          </>
        )}

        {/* ── Market ── */}
        {type === "market" && (
          <>
            <Field
              id={`${uid}-value`}
              label={
                <span className="flex items-center gap-1.5">
                  Order Value
                  <button
                    type="button"
                    aria-label="Switch order value unit"
                    onClick={() => setValueInQuote((q) => !q)}
                    className="text-fg-3 hover:text-fg"
                  >
                    <ArrowLeftRight size={13} />
                  </button>
                </span>
              }
              right={<span className="num text-fg-3">≈ 0 {valueInQuote ? market.base : market.quote}</span>}
              value={orderValue}
              onChange={setOrderValue}
              addon={valueInQuote ? quoteIcon : baseIcon}
            />
            {slider}
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-fg-3">Max Slippage</span>
              <button type="button" className="num font-medium text-iris hover:underline">
                1%
              </button>
            </div>
          </>
        )}

        {/* ── Conditional ── */}
        {type === "conditional" && (
          <>
            <Field
              id={`${uid}-trigger`}
              label="Trigger Price"
              value={triggerPrice}
              onChange={setTriggerPrice}
              addon={quoteIcon}
              right={
                <Menu
                  label="Trigger price type"
                  items={TRIGGERS}
                  value={triggerType}
                  onSelect={(id) => setTriggerType(id as TriggerType)}
                  align="right"
                  triggerClassName="flex items-center gap-1 text-[12px] font-medium text-fg-2 hover:text-fg"
                  trigger={(open) => (
                    <>
                      {TRIGGERS.find((t) => t.id === triggerType)?.label}
                      <ChevronDown size={13} className={cn("transition", open && "rotate-180")} />
                    </>
                  )}
                />
              }
            />
            <Field
              id={`${uid}-qty`}
              label="Quantity"
              right={<span className="num text-fg-3">≈ 0.00000 {market.quote}</span>}
              value={quantity}
              onChange={setQuantity}
              addon={baseIcon}
            />
            {slider}
            {useLimitPrice && priceField}
          </>
        )}
      </div>

      {/* ── actions ── */}
      {isAuthenticated ? (
        <button type="submit" className={cn("btn btn-lg w-full", side === "buy" ? "btn-up" : "btn-down")}>
          {side === "buy" ? "Buy" : "Sell"} {market.base}
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

      {type === "limit" && (
        <div className="flex items-center gap-5">
          <Checkbox label="Post Only" checked={postOnly} onChange={setPostOnly} />
          <Checkbox label="IOC" checked={ioc} onChange={setIoc} />
        </div>
      )}
      {type === "conditional" && (
        <Checkbox label="Limit Price" checked={useLimitPrice} onChange={setUseLimitPrice} />
      )}
    </form>
  );
}

function Field({
  id,
  label,
  right,
  value,
  onChange,
  addon,
}: {
  id: string;
  label: ReactNode;
  right?: ReactNode;
  value: string;
  onChange: (v: string) => void;
  addon: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex min-h-4 items-center justify-between text-[12px]">
        <label htmlFor={id} className="text-fg-3">
          {label}
        </label>
        {right}
      </div>
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
