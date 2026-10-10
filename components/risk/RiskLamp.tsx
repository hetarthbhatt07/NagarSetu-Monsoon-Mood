import { RiskBand } from "@/lib/schema";
import React from "react";

interface RiskLampProps {
  band: RiskBand;
  size?: "sm" | "md" | "lg";
  withLabel?: boolean;
  className?: string;
}

export const RiskLamp: React.FC<RiskLampProps> = ({
  band,
  size = "md",
  withLabel = false,
  className = "",
}) => {
  const sizeClass = {
    sm: "w-2.5 h-2.5",
    md: "w-3.5 h-3.5",
    lg: "w-4.5 h-4.5",
  }[size];

  const lampStyles = {
    Low: "bg-emerald-500 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.2)]",
    Medium:
      "bg-amber-500 border-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.5),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.2)]",
    High: "bg-rose-600 border-rose-700 shadow-[0_0_10px_rgba(225,29,72,0.7),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.2)] animate-pulse",
  }[band];

  const labelColor = {
    Low: "text-emerald-700 font-semibold",
    Medium: "text-amber-700 font-semibold",
    High: "text-rose-700 font-bold",
  }[band];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-label={`Status Lamp: ${band} Risk`}
        className={`relative inline-block rounded-full border ${sizeClass} ${lampStyles}`}
      >
        {/* Core highlight dot */}
        <span className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/70 pointer-events-none" />
      </span>
      {withLabel && (
        <span className={`text-xs font-mono uppercase tracking-wider ${labelColor}`}>
          {band} Risk
        </span>
      )}
    </div>
  );
};
