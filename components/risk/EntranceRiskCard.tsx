import { EntranceRiskResult } from "@/lib/schema";
import { AlertCircle, HelpCircle, Zap } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "../ui/Badge";
import { BentoCard } from "../ui/BentoCard";
import { TactileButton } from "../ui/TactileButton";
import { ExplainDrawer } from "./ExplainDrawer";
import { RiskLamp } from "./RiskLamp";
import { UncertaintyBar } from "./UncertaintyBar";

interface EntranceRiskCardProps {
  result: EntranceRiskResult;
  elevationM: number;
  lowPointDepthCm: number;
  surface: string;
}

export const EntranceRiskCard: React.FC<EntranceRiskCardProps> = ({
  result,
  elevationM,
  lowPointDepthCm,
  surface,
}) => {
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  if (result.isIncomplete) {
    return (
      <BentoCard className="border-rose-200 bg-rose-50/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900">{result.entranceLabel}</h3>
          </div>
          <Badge variant="incomplete">INCOMPLETE</Badge>
        </div>
        <p className="text-xs text-rose-700 mb-3">
          Required telemetry or entrance vulnerability parameters are missing. A screening score
          cannot be reliably determined without inventing data.
        </p>
        <div className="text-[11px] font-mono text-slate-500">
          Action required: Inspect site or upload verified station entrance configuration.
        </div>
      </BentoCard>
    );
  }

  return (
    <>
      <BentoCard className="flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <RiskLamp band={result.band} />
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  {result.entranceLabel}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge
                  variant={
                    result.band === "High"
                      ? "high"
                      : result.band === "Medium"
                      ? "medium"
                      : "low"
                  }
                >
                  {result.band} Risk
                </Badge>
                {result.hasElectricalExposure && (
                  <Badge variant="cached" className="flex items-center gap-1 text-[10px]">
                    <Zap className="w-2.5 h-2.5 text-amber-500" />
                    Electrical Exposed
                  </Badge>
                )}
                <Badge variant="simulated">SIMULATED</Badge>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-mono text-slate-900">
                {result.score}
              </span>
              <span className="text-xs font-mono text-slate-400 block">/ 100</span>
            </div>
          </div>

          {/* Uncertainty Range */}
          <div className="mb-4">
            <UncertaintyBar
              score={result.score}
              low={result.low}
              high={result.high}
              band={result.band}
              confidence={result.confidence}
            />
          </div>

          {/* Site Metrics Chips */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-200/80 mb-4 text-center">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Elevation</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{elevationM}m</span>
              <span className="text-[9px] text-amber-700 block font-mono">SIMULATED</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Low Point</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{lowPointDepthCm}cm</span>
              <span className="text-[9px] text-amber-700 block font-mono">SIMULATED</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Surface</span>
              <span className="text-xs font-bold text-slate-800 capitalize">{surface}</span>
              <span className="text-[9px] text-slate-500 block font-mono">RUNOFF</span>
            </div>
          </div>

          {/* Peak Forecast Notice */}
          <div className="text-xs text-slate-600 mb-4 flex items-center justify-between">
            <span>Peak Forecast Impact:</span>
            <span className="font-mono font-medium text-slate-900">
              {result.peakHourlyMm} mm/h @ {result.peakHour}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Top driver: {result.drivers[0]?.factor || "Rainfall"}
          </span>
          <TactileButton
            size="sm"
            variant="outline"
            onClick={() => setIsExplainOpen(true)}
            className="text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Explain Score
          </TactileButton>
        </div>
      </BentoCard>

      <ExplainDrawer
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        result={result}
      />
    </>
  );
};
