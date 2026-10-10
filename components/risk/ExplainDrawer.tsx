import { EntranceRiskResult } from "@/lib/schema";
import { AlertTriangle, Database, Info, ShieldCheck } from "lucide-react";
import React from "react";
import { Badge } from "../ui/Badge";
import { Drawer } from "../ui/Drawer";
import { RiskLamp } from "./RiskLamp";
import { UncertaintyBar } from "./UncertaintyBar";

interface ExplainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: EntranceRiskResult | null;
}

export const ExplainDrawer: React.FC<ExplainDrawerProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!result) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Explain Risk Score"
      subtitle={`Entrance Risk Analysis · ${result.entranceLabel}`}
      width="lg"
    >
      <div className="space-y-6">
        {/* Top Summary Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiskLamp band={result.band} />
              <span className="font-bold text-slate-900 text-lg">
                Score {result.score} / 100
              </span>
            </div>
            <Badge
              variant={
                result.band === "High"
                  ? "high"
                  : result.band === "Medium"
                  ? "medium"
                  : "low"
              }
            >
              {result.band} Band
            </Badge>
          </div>

          <UncertaintyBar
            score={result.score}
            low={result.low}
            high={result.high}
            band={result.band}
            confidence={result.confidence}
          />
        </div>

        {/* Hazard vs Vulnerability split */}
        <div>
          <div className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider mb-2">
            Mathematical Decomposition (50% Rain Hazard + 50% Site Vulnerability)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-mono text-slate-500 block">Rain Hazard (0–100)</span>
              <span className="text-xl font-bold text-slate-900">{result.rainHazardScore}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                55% intensity + 45% 24h volume
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-mono text-slate-500 block">Site Vulnerability (0–100)</span>
              <span className="text-xl font-bold text-slate-900">{result.vulnerabilityScore}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Depression, drainage, history, surface
              </span>
            </div>
          </div>
        </div>

        {/* Top Driver Contribution Breakdown */}
        <div>
          <div className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Primary Score Drivers</span>
            <span className="text-[10px] text-slate-400">Relative Weight</span>
          </div>
          <div className="space-y-2.5">
            {result.drivers.map((driver, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200/90 bg-white shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      {driver.factor}
                    </span>
                    <Badge
                      variant={
                        driver.quality === "simulated"
                          ? "simulated"
                          : driver.quality === "assumed"
                          ? "cached"
                          : "live"
                      }
                      className="text-[10px] py-0"
                    >
                      {driver.quality}
                    </Badge>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {driver.contribution}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, driver.contribution)}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500">{driver.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Used Panel */}
        <div>
          <div className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Evidence Log</span>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            {result.evidence.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory & Safety Disclaimers */}
        <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Non-Predictive Screening Engine</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800/90">
            This screening risk score reflects heuristic vulnerability under forecast precipitation.
            It does NOT compute hydrological flood depth or hydraulic velocity. Real operational
            closures require certified on-site supervisor clearance.
          </p>
        </div>
      </div>
    </Drawer>
  );
};
