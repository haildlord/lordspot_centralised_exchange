"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

/** Styled native checkbox. The label gets a dashed underline (tooltip-able, like the reference). */
export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <label
      className={cn(
        "group inline-flex cursor-pointer select-none items-center gap-2 text-[13px] text-fg-2 hover:text-fg",
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="grid size-4 place-items-center rounded-[5px] border border-line-2 bg-bg text-transparent transition-[background-color,border-color,color,box-shadow] duration-200 group-hover:border-fg-3 peer-checked:border-gold-500 peer-checked:bg-gold-500 peer-checked:text-[#1a1206] peer-checked:shadow-[0_0_14px_-2px_rgb(243_177_58/0.6)] peer-focus-visible:ring-2 peer-focus-visible:ring-gold-500/60 [&>svg]:scale-50 [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:ease-spring peer-checked:[&>svg]:scale-100">
        <Check size={12} strokeWidth={3.5} />
      </span>
      <span className="hint">{label}</span>
    </label>
  );
}
