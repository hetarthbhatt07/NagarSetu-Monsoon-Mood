import React from "react";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  badge?: string;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = "",
  size = "md",
}: SegmentedControlProps<T>) {
  const padStyles = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-xs sm:text-sm";

  return (
    <div
      role="radiogroup"
      className={`inline-flex items-center p-1 bg-slate-200/70 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border border-slate-300/60 ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 rounded-md font-medium transition-all duration-150 cursor-pointer ${padStyles} ${
              isSelected
                ? "bg-white text-slate-900 shadow-[0_2px_4px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.95)] border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <span>{opt.label}</span>
            {opt.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? "bg-slate-100 text-slate-700" : "bg-slate-300/60 text-slate-600"
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
