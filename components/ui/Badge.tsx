import React from "react";

export type BadgeVariant =
  | "simulated"
  | "live"
  | "cached"
  | "incomplete"
  | "low"
  | "medium"
  | "high"
  | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  className = "",
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    simulated: "bg-amber-50 text-amber-800 border-amber-300/80",
    live: "bg-emerald-50 text-emerald-800 border-emerald-300/80",
    cached: "bg-slate-100 text-slate-700 border-slate-300",
    incomplete: "bg-rose-50 text-rose-800 border-rose-300 font-bold",
    low: "bg-emerald-50 text-emerald-800 border-emerald-200",
    medium: "bg-amber-50 text-amber-800 border-amber-200",
    high: "bg-rose-50 text-rose-800 border-rose-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-semibold border shadow-xs ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
