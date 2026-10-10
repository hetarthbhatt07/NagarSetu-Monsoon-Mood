import { ConfidenceLevel, RiskBand } from "@/lib/schema";
import React from "react";
import { Badge } from "../ui/Badge";

interface UncertaintyBarProps {
  score: number;
  low: number;
  high: number;
  band: RiskBand;
  confidence: ConfidenceLevel;
}

export const UncertaintyBar: React.FC<UncertaintyBarProps> = ({
  score,
  low,
  high,
  band,
  confidence,
}) => {
  const bandBarColor = {
    Low: "bg-emerald-500",
    Medium: "bg-amber-500",
    High: "bg-rose-500",
  }[band];

  const bandBgColor = {
    Low: "bg-emerald-100",
    Medium: "bg-amber-100",
    High: "bg-rose-100",
  }[band];

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Uncertainty Band:</span>
          <span className="font-semibold text-slate-800">
            {low} – {high}
          </span>
          <span className="text-slate-400">/ 100</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[10px]">Confidence:</span>
          <Badge
            variant={confidence === "medium" ? "medium" : "simulated"}
            className="text-[10px] py-0"
          >
            {confidence.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Track bar */}
      <div className="relative w-full h-3 bg-slate-200/80 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)]">
        {/* Shaded Uncertainty Range */}
        <div
          className={`absolute top-0 bottom-0 ${bandBgColor} opacity-70 transition-all duration-300`}
          style={{
            left: `${Math.max(0, low)}%`,
            width: `${Math.min(100, high - low)}%`,
          }}
        />

        {/* Center Score Indicator */}
        <div
          className={`absolute top-0 bottom-0 w-1.5 ${bandBarColor} shadow-[0_0_4px_rgba(0,0,0,0.3)] transition-all duration-300 z-10`}
          style={{
            left: `calc(${score}% - 3px)`,
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
        <span>0 (Safe)</span>
        <span>35 (Watch)</span>
        <span>65 (Alert)</span>
        <span>100 (Severe)</span>
      </div>
    </div>
  );
};
