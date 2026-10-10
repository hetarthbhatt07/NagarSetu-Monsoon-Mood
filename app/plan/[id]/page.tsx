"use client";

import { RiskLamp } from "@/components/risk/RiskLamp";
import { Badge } from "@/components/ui/Badge";
import { BentoCard } from "@/components/ui/BentoCard";
import { TactileButton } from "@/components/ui/TactileButton";
import { generateReadinessPlan } from "@/lib/plan";
import { calculateStationRollupRisk } from "@/lib/risk";
import { useAppStore } from "@/lib/store";
import {
  AlertTriangle,
  ArrowLeft,
  CheckSquare,
  Droplets,
  MapPin,
  Printer,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";

export default function PrintablePlanPage() {
  const params = useParams();
  const stationId = typeof params?.id === "string" ? params.id : "kalupur";

  const { stations, forecast, thresholds, checklistState, closureDecisions } =
    useAppStore();

  const station = stations.find((s) => s.id === stationId) || stations[0];

  const rollup = useMemo(() => {
    if (!station) return null;
    return calculateStationRollupRisk(station, forecast.data, thresholds);
  }, [station, forecast.data, thresholds]);

  const plan = useMemo(() => {
    if (!station || !rollup) return null;
    return generateReadinessPlan(station, rollup);
  }, [station, rollup]);

  if (!station || !rollup || !plan) {
    return <div>Loading plan brief...</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
      {/* Top Non-print Bar */}
      <div className="no-print flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          href={`/station/${station.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Station Workbench
        </Link>

        <div className="flex items-center gap-2">
          <TactileButton size="sm" variant="outline" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5" />
            Print / Save as PDF
          </TactileButton>
        </div>
      </div>

      {/* Printable Brief Header */}
      <div className="border-b-2 border-slate-900 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-800 uppercase">
                AHMEDABAD METRO RAIL · MONSOON OPERATIONS BRIEF
              </span>
              <Badge variant="simulated" className="text-[10px]">
                SIMULATED DATA
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-950 uppercase tracking-tight">
              {station.name}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">{station.note}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400 block uppercase">
              Operational Window
            </span>
            <span className="text-sm font-mono font-bold text-slate-900">
              Next 24 Hours (Peak {rollup.peakHour})
            </span>
            <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
              Ref: METRO-MONSOON-PS12
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-4 gap-3 py-3 border-b border-slate-200 text-xs font-mono">
        <div className="p-3 bg-slate-50 rounded border border-slate-200">
          <span className="text-slate-400 block text-[10px]">ROLLUP RISK</span>
          <span className="text-xl font-bold text-slate-900">
            {rollup.maxEntranceRisk} / 100 ({rollup.band})
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded border border-slate-200">
          <span className="text-slate-400 block text-[10px]">PEAK RAIN INTENSITY</span>
          <span className="text-xl font-bold text-slate-900">
            {rollup.peakIntensityMmPerH} mm/h
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded border border-slate-200">
          <span className="text-slate-400 block text-[10px]">24H TOTAL VOLUME</span>
          <span className="text-xl font-bold text-slate-900">
            {rollup.totalRain24h} mm
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded border border-slate-200">
          <span className="text-slate-400 block text-[10px]">APPROACH ROAD RISK</span>
          <span className="text-xl font-bold text-slate-900">
            {rollup.approachRoadRisk} / 100
          </span>
        </div>
      </div>

      {/* Entrances Vulnerability Table */}
      <div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-2">
          1. Entrance Screening Vulnerability Matrix
        </h3>
        <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200">
          <thead className="bg-slate-100 font-mono text-[11px] text-slate-700">
            <tr>
              <th className="p-2 text-left">Entrance</th>
              <th className="p-2 text-center">Score (0–100)</th>
              <th className="p-2 text-center">Uncertainty</th>
              <th className="p-2 text-center">Elevation</th>
              <th className="p-2 text-center">Low Point</th>
              <th className="p-2 text-left">Approach Road</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {station.entrances.map((ent) => {
              const r = rollup.entranceResults.find((res) => res.entranceId === ent.id);
              return (
                <tr key={ent.id} className="hover:bg-slate-50">
                  <td className="p-2 font-sans font-medium">{ent.label}</td>
                  <td className="p-2 text-center font-bold">
                    {r?.score} ({r?.band})
                  </td>
                  <td className="p-2 text-center text-slate-500">
                    {r?.low}–{r?.high}
                  </td>
                  <td className="p-2 text-center">{ent.elevation_m}m</td>
                  <td className="p-2 text-center">{ent.low_point_depth_cm}cm</td>
                  <td className="p-2 font-sans">{ent.approach_road}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Closure Recommendations if any */}
      {plan.closureRecommendations.length > 0 && (
        <div className="p-4 border-2 border-rose-600 bg-rose-50/40 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-mono text-xs font-bold uppercase">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Operational Entrance Closure Review Advisory</span>
          </div>
          {plan.closureRecommendations.map((rec) => {
            const dec = closureDecisions[rec.id];
            return (
              <div key={rec.id} className="text-xs text-slate-800 font-mono space-y-1">
                <div>
                  <b>Recommendation:</b> Review {rec.entranceLabel} for closure during peak downpour ({rec.score}/100).
                </div>
                <div>
                  <b>Primary Drivers:</b> {rec.driversSummary}
                </div>
                <div>
                  <b>Suggested Alternate:</b> {rec.suggestedAlternateEntrance}
                </div>
                <div className="text-[11px] text-slate-600 pt-1 border-t border-rose-200">
                  Status: <b>{dec ? dec.decision.toUpperCase() : "PENDING OPERATOR SIGN-OFF"}</b>{" "}
                  {dec && `(Signed by: ${dec.operatorName} at ${new Date(dec.timestamp).toLocaleTimeString()})`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prioritized Pump Placement */}
      <div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-2">
          2. Dewatering Pump Deployment Schedule
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          {plan.rankedPumps.map((pump) => (
            <div key={pump.id} className="p-2.5 border border-slate-200 rounded bg-slate-50">
              <span className="font-bold text-blue-800 block">
                PRIORITY #{pump.rank} — {pump.label}
              </span>
              <span className="text-[11px] text-slate-600">
                Approx distance: {pump.distanceMetersApprox}m to target ingress portal
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 24-Hour Phased Checklist */}
      <div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-2">
          3. Mandatory 24-Hour Readiness Checklist
        </h3>
        <div className="space-y-2">
          {plan.actions.map((act) => {
            const isDone = Boolean(checklistState[act.id]);
            return (
              <div
                key={act.id}
                className="p-2.5 border border-slate-200 rounded flex items-start gap-2.5 text-xs"
              >
                <div className="w-4 h-4 rounded border border-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                  {isDone ? "✓" : ""}
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900">{act.text}</div>
                  <div className="font-mono text-[10px] text-slate-500">
                    Phase: {act.phase} | Role: {act.owner_role} | Trigger: {act.trigger}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sign-off & Regulatory Footer */}
      <div className="pt-6 border-t-2 border-slate-900 text-[10px] font-mono text-slate-600 space-y-4">
        <div className="grid grid-cols-2 gap-8 pt-4">
          <div className="border-t border-slate-400 pt-1">
            Station Operations Supervisor (Signature & Stamp)
          </div>
          <div className="border-t border-slate-400 pt-1">
            Central OCC Controller (Acknowledgment & Date)
          </div>
        </div>

        <p className="text-slate-500 text-center leading-relaxed">
          Preparedness prototype. Not a validated flood-prediction system. Not an authority for entrance closures.
          Operator review required. All drainage indices and elevation values are simulated.
        </p>
      </div>
    </div>
  );
}
