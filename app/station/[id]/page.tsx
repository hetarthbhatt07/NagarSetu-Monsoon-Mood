"use client";

import { RiskTimelineChart } from "@/components/charts/RiskTimelineChart";
import { PageShell } from "@/components/layout/PageShell";
import { StationMiniMap } from "@/components/map/StationMiniMap";
import { AuditLog } from "@/components/plan/AuditLog";
import { ChecklistItem } from "@/components/plan/ChecklistItem";
import { ClosureReviewCard } from "@/components/plan/ClosureReviewCard";
import { PhaseTabs, PhaseType } from "@/components/plan/PhaseTabs";
import { EntranceRiskCard } from "@/components/risk/EntranceRiskCard";
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
  CheckCircle,
  Clock,
  Compass,
  Database,
  FileText,
  MessageSquare,
  ShieldAlert,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import React, { useMemo, useState } from "react";

export default function StationWorkbenchPage() {
  const params = useParams();
  const stationId = typeof params?.id === "string" ? params.id : "kalupur";

  const {
    stations,
    forecast,
    thresholds,
    checklistState,
    toggleChecklistAction,
    recordClosureDecision,
    closureDecisions,
    auditLog,
  } = useAppStore();

  const [selectedPhase, setSelectedPhase] = useState<PhaseType>("ALL");

  const station = stations.find((s) => s.id === stationId);

  const rollup = useMemo(() => {
    if (!station) return null;
    return calculateStationRollupRisk(station, forecast.data, thresholds);
  }, [station, forecast.data, thresholds]);

  const plan = useMemo(() => {
    if (!station || !rollup) return null;
    return generateReadinessPlan(station, rollup);
  }, [station, rollup]);

  if (!station || !rollup || !plan) {
    return (
      <PageShell>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Station Not Found</h2>
          <p className="text-sm text-slate-500">The requested station ID does not exist.</p>
          <Link href="/">
            <TactileButton variant="primary">Return to Overview Dashboard</TactileButton>
          </Link>
        </div>
      </PageShell>
    );
  }

  // Count done actions for progress meter
  const totalActionsCount = plan.actions.length;
  const doneActionsCount = plan.actions.filter((a) => checklistState[a.id]).length;
  const progressPercent = Math.round(
    totalActionsCount > 0 ? (doneActionsCount / totalActionsCount) * 100 : 0
  );

  // Phase filtering
  const filteredActions =
    selectedPhase === "ALL"
      ? plan.actions
      : plan.actions.filter((a) => a.phase === selectedPhase);

  const phaseCounts: Record<PhaseType, number> = {
    ALL: plan.actions.length,
    PREPARE: plan.actions.filter((a) => a.phase === "PREPARE").length,
    POSITION: plan.actions.filter((a) => a.phase === "POSITION").length,
    ACTIVE: plan.actions.filter((a) => a.phase === "ACTIVE").length,
    RECOVER: plan.actions.filter((a) => a.phase === "RECOVER").length,
  };

  // Hourly series from highest risk entrance for chart
  const primaryEntranceRisk = rollup.entranceResults.find(
    (e) => e.entranceId === rollup.highestRiskEntranceId
  ) || rollup.entranceResults[0];

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb & Station Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-900 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Network Overview
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <RiskLamp band={rollup.band} size="lg" />
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {station.name}
              </h1>
              <Badge variant="simulated">SIMULATED STATION DATA</Badge>
              <Badge variant={rollup.confidence === "medium" ? "medium" : "cached"}>
                Confidence: {rollup.confidence.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">{station.note}</p>
          </div>

          {/* Quick Nav Tools */}
          <div className="flex items-center gap-2">
            <Link href="/communications">
              <TactileButton size="sm" variant="outline">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Alerts & WhatsApp
              </TactileButton>
            </Link>
            <Link href={`/plan/${station.id}`}>
              <TactileButton size="sm" variant="primary">
                <FileText className="w-4 h-4" />
                Printable 1-Page Brief
              </TactileButton>
            </Link>
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <BentoCard className="p-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Max Screening Risk
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 flex items-center gap-2 mt-1">
              <span>{rollup.maxEntranceRisk}</span>
              <span className="text-xs text-slate-400 font-normal">/ 100</span>
              <RiskLamp band={rollup.band} size="sm" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              {rollup.highestRiskEntranceLabel.split(" (")[0]}
            </span>
          </BentoCard>

          <BentoCard className="p-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Peak Rain Window
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {rollup.peakHour}
            </div>
            <span className="text-[10px] font-mono text-emerald-700 mt-1 block">
              {rollup.peakIntensityMmPerH} mm/h expected
            </span>
          </BentoCard>

          <BentoCard className="p-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Approach Road Risk
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {rollup.approachRoadRisk}
              <span className="text-xs text-slate-400 font-normal ml-1">/ 100</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              {station.parking.low_lying ? "Low-lying parking" : "Normal run-off"}
            </span>
          </BentoCard>

          <BentoCard className="p-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Readiness Checklist
            </span>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
              {progressPercent}%
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              {doneActionsCount} of {totalActionsCount} completed
            </span>
          </BentoCard>
        </div>

        {/* Entrance Screening Risk Cards (Bento) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                SPEC · ENTRANCE VULNERABILITY
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Entrance Screening Risk & Uncertainty Analysis
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {station.entrances.length} Access Portals Evaluated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {station.entrances.map((ent) => {
              const res = rollup.entranceResults.find((r) => r.entranceId === ent.id);
              if (!res) return null;
              return (
                <EntranceRiskCard
                  key={ent.id}
                  result={res}
                  elevationM={ent.elevation_m}
                  lowPointDepthCm={ent.low_point_depth_cm}
                  surface={ent.surface}
                />
              );
            })}
          </div>
        </div>

        {/* Middle Section: 24h Risk Timeline Chart & Station Mini-Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Risk Over Time 24h Chart (7 cols) */}
          <div className="lg:col-span-7">
            <BentoCard className="p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                      SPEC · RISK DYNAMICS
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      24h Risk Profile Across Rain Window
                    </h3>
                  </div>
                  <Badge variant="simulated">3H ROLLING SUM</Badge>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Visualizes time-varying ingress risk reflecting forecast rain bursts and drainage saturation.
                </p>
              </div>

              {primaryEntranceRisk && (
                <RiskTimelineChart
                  series={primaryEntranceRisk.hourlyRiskSeries}
                  thresholds={thresholds}
                  height={220}
                />
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Peak Hazard Zone: {rollup.peakHour} ± 2h</span>
                <span className="text-amber-700 font-semibold">Watch: 35 | Alert: 65</span>
              </div>
            </BentoCard>
          </div>

          {/* Station Mini-Map & Pump Placement (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <BentoCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                    SPEC · ASSET GEO-STAGING
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Station Apron & Pump Staging Map
                  </h3>
                </div>
              </div>

              <StationMiniMap
                station={station}
                entranceRisks={rollup.entranceResults}
                rankedPumps={plan.rankedPumps}
              />

              {/* Pump placement priority list */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-700 uppercase block">
                  Prioritized Pump Deployment Roster:
                </span>
                <div className="space-y-1.5">
                  {plan.rankedPumps.map((pump) => (
                    <div
                      key={pump.id}
                      className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/60 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                          P{pump.rank}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800">{pump.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            ~{pump.distanceMetersApprox}m to {pump.targetEntranceLabel.split(" (")[0]}
                          </span>
                        </div>
                      </div>
                      <Badge variant="live" className="text-[10px] py-0">
                        Priority #{pump.rank}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>
          </div>
        </div>

        {/* Closure Review Cards (Operator Review Workflow) */}
        {plan.closureRecommendations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase text-rose-600">
                  CRITICAL PROTOCOL · OPERATOR ACTION REQUIRED
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Entrance Closure Review Recommendations
                </h3>
              </div>
              <Badge variant="high">HIGH VULNERABILITY</Badge>
            </div>

            <div className="space-y-4">
              {plan.closureRecommendations.map((rec) => (
                <ClosureReviewCard
                  key={rec.id}
                  rec={rec}
                  savedDecision={closureDecisions[rec.id]}
                  onRecordDecision={recordClosureDecision}
                />
              ))}
            </div>
          </div>
        )}

        {/* 24-Hour Station Readiness Plan Checklist */}
        <BentoCard className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                SPEC · OPERATIONAL PROTOCOL
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                24-Hour Phased Station Readiness Plan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic trigger-threshold actions tied to forecast rain intensity and site vulnerabilities.
              </p>
            </div>

            {/* Progress Meter */}
            <div className="flex items-center gap-3 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-xs font-mono font-bold text-slate-800">
                  {doneActionsCount} / {totalActionsCount} Actions Signed
                </div>
                <div className="w-28 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Phase Segmented Control */}
          <div className="mb-6">
            <PhaseTabs
              currentPhase={selectedPhase}
              onChange={setSelectedPhase}
              counts={phaseCounts}
            />
          </div>

          {/* Checklist items */}
          <div className="space-y-3">
            {filteredActions.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 font-mono">
                No active actions in this phase.
              </div>
            ) : (
              filteredActions.map((action) => (
                <ChecklistItem
                  key={action.id}
                  action={action}
                  isDone={Boolean(checklistState[action.id])}
                  onToggle={() => toggleChecklistAction(action.id)}
                />
              ))
            )}
          </div>
        </BentoCard>

        {/* Bottom Dual Grid: Audit Log & Evidence Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Audit Log (6 cols) */}
          <div className="lg:col-span-6">
            <BentoCard className="p-5 h-full">
              <AuditLog entries={auditLog} stationId={station.id} />
            </BentoCard>
          </div>

          {/* Evidence Used Panel (6 cols) */}
          <div className="lg:col-span-6">
            <BentoCard className="p-5 h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Station Evidence & Telemetry Sources
                  </h4>
                </div>
                <Badge variant="simulated">ALL SIMULATED</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">Drainage Capacity & Blockage</span>
                    <span className="text-[11px] text-slate-500 block">
                      Capacity index: {station.drainage.capacity_index} · Blockage: {(station.drainage.blockage_risk * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Badge variant="simulated">SIMULATED</Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">Historical Incident Log</span>
                    <span className="text-[11px] text-slate-500 block">
                      {station.history.known_waterlogging_points} prior recorded events ({station.history.last_event_note})
                    </span>
                  </div>
                  <Badge variant="simulated">SIMULATED</Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">Digital Elevation Model (DEM)</span>
                    <span className="text-[11px] text-slate-500 block">
                      Entrance threshold elevations (48.2m – 55.2m)
                    </span>
                  </div>
                  <Badge variant="simulated">SIMULATED</Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">Open-Meteo Weather Forecast</span>
                    <span className="text-[11px] text-slate-500 block">
                      Live hourly precipitation & probability (Ahmedabad node)
                    </span>
                  </div>
                  <Badge variant={forecast.status === "LIVE" ? "live" : "cached"}>
                    {forecast.status}
                  </Badge>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
