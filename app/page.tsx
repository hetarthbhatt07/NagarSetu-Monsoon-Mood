"use client";

import { RainfallChart } from "@/components/charts/RainfallChart";
import { PageShell } from "@/components/layout/PageShell";
import { RiskMap } from "@/components/map/RiskMap";
import { RiskLamp } from "@/components/risk/RiskLamp";
import { Badge } from "@/components/ui/Badge";
import { BentoCard } from "@/components/ui/BentoCard";
import { TactileButton } from "@/components/ui/TactileButton";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { generateReadinessPlan } from "@/lib/plan";
import { calculateStationRollupRisk } from "@/lib/risk";
import { RiskBand, StationRollupRisk } from "@/lib/schema";
import { useAppStore } from "@/lib/store";
import {
  AlertTriangle,
  ArrowRight,
  CloudRain,
  Droplets,
  ExternalLink,
  Layers,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

export default function OverviewPage() {
  const router = useRouter();
  const {
    stations,
    forecast,
    thresholds,
    selectedStationId,
    setSelectedStationId,
    mapLayers,
    toggleMapLayer,
  } = useAppStore();

  // Compute rollups for all stations
  const { rollups, sortedRollups, networkAlerts, peakNetworkIntensity, totalNetworkRain } =
    useMemo(() => {
      const map: Record<string, StationRollupRisk> = {};
      const allActions: { stationName: string; stationId: string; actionText: string; priority: string; trigger: string }[] = [];
      let maxPeak = 0;
      let totalRain = 0;

      stations.forEach((st) => {
        const res = calculateStationRollupRisk(st, forecast.data, thresholds);
        map[st.id] = res;

        if (res.peakIntensityMmPerH > maxPeak) maxPeak = res.peakIntensityMmPerH;
        if (res.totalRain24h > totalRain) totalRain = res.totalRain24h;

        const plan = generateReadinessPlan(st, res);
        plan.actions.forEach((act) => {
          if (act.priority === "High") {
            allActions.push({
              stationName: st.name,
              stationId: st.id,
              actionText: act.text,
              priority: act.priority,
              trigger: act.trigger,
            });
          }
        });
      });

      const sorted = [...stations].sort((a, b) => {
        const scoreA = map[a.id]?.maxEntranceRisk || 0;
        const scoreB = map[b.id]?.maxEntranceRisk || 0;
        return scoreB - scoreA;
      });

      return {
        rollups: map,
        sortedRollups: sorted,
        networkAlerts: allActions.slice(0, 3),
        peakNetworkIntensity: maxPeak,
        totalNetworkRain: totalRain,
      };
    }, [stations, forecast.data, thresholds]);

  const mapRollupDict: Record<string, { band: RiskBand; score: number }> = useMemo(() => {
    const dict: Record<string, { band: RiskBand; score: number }> = {};
    Object.keys(rollups).forEach((k) => {
      dict[k] = {
        band: rollups[k].band,
        score: rollups[k].maxEntranceRisk,
      };
    });
    return dict;
  }, [rollups]);

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Network Alerts Strip */}
        {networkAlerts.length > 0 && (
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                Priority Operations Alerts · Network Screening Summary
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {networkAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 p-3 rounded-lg border border-amber-200/70 text-xs text-slate-800 flex flex-col justify-between space-y-1.5"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{alert.stationName}</span>
                    <p className="text-slate-600 line-clamp-2 mt-0.5">{alert.actionText}</p>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-amber-800 font-semibold">{alert.priority} Priority</span>
                    <Link
                      href={`/station/${alert.stationId}`}
                      className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-0.5"
                    >
                      View Plan <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main 12-Column Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Interactive Map & Layer Controls */}
          <div className="lg:col-span-8 space-y-6">
            <BentoCard className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                      SPEC · NETWORK RISK MAP
                    </span>
                    <Badge variant="simulated">SIMULATED TERRAIN</Badge>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Ahmedabad Metro Corridor Vulnerability Map
                  </h2>
                </div>

                {/* Layer Toggles */}
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <ToggleSwitch
                    label="Lamps"
                    checked={mapLayers.riskLamps}
                    onChange={() => toggleMapLayer("riskLamps")}
                  />
                  <ToggleSwitch
                    label="Entrances"
                    checked={mapLayers.entrances}
                    onChange={() => toggleMapLayer("entrances")}
                  />
                  <ToggleSwitch
                    label="Pumps"
                    checked={mapLayers.pumpPoints}
                    onChange={() => toggleMapLayer("pumpPoints")}
                  />
                </div>
              </div>

              {/* Map Canvas */}
              <RiskMap
                stations={stations}
                stationRollups={mapRollupDict}
                selectedStationId={selectedStationId}
                onSelectStation={(id) => {
                  setSelectedStationId(id);
                  router.push(`/station/${id}`);
                }}
                layers={mapLayers}
              />

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Click station marker to inspect 24h entrance readiness plan</span>
                <span>Source: Open-Meteo Ahmedabad</span>
              </div>
            </BentoCard>

            {/* Quick Station Readiness Matrix */}
            <BentoCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                    SPEC · RAPID DISPATCH SUMMARY
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Station Readiness Overview (5 Network Nodes)
                  </h3>
                </div>
                <Link href="/communications">
                  <TactileButton size="sm" variant="outline">
                    Generate Commuter Alerts →
                  </TactileButton>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stations.map((st) => {
                  const r = rollups[st.id];
                  return (
                    <Link
                      key={st.id}
                      href={`/station/${st.id}`}
                      className="p-3.5 rounded-lg border border-slate-200 hover:border-emerald-500/80 bg-slate-50/50 hover:bg-white transition-all shadow-xs group block"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <RiskLamp band={r?.band || "Low"} />
                        <span className="text-lg font-black font-mono text-slate-900 group-hover:text-emerald-700">
                          {r?.maxEntranceRisk || 0}
                          <span className="text-xs text-slate-400 font-normal">/100</span>
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {st.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {st.note}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>Peak: {r?.peakHour}</span>
                        <span className="text-emerald-700 font-semibold group-hover:underline">
                          Workbench →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </BentoCard>
          </div>

          {/* Right Column (4 cols): Rainfall Telemetry & Ranked Stations List */}
          <div className="lg:col-span-4 space-y-6">
            {/* Stat Tiles */}
            <div className="grid grid-cols-2 gap-3">
              <BentoCard className="p-4">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Peak Intensity</span>
                </div>
                <div className="text-2xl font-black font-mono text-slate-900">
                  {peakNetworkIntensity.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500 ml-1">mm/h</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-700 mt-1">
                  Hourly Maximum
                </div>
              </BentoCard>

              <BentoCard className="p-4">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 mb-1">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  <span>24h Total Rain</span>
                </div>
                <div className="text-2xl font-black font-mono text-slate-900">
                  {totalNetworkRain.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500 ml-1">mm</span>
                </div>
                <div className="text-[10px] font-mono text-blue-700 mt-1">
                  Next 24 Hours Sum
                </div>
              </BentoCard>
            </div>

            {/* 24-Hour Rainfall Forecast Chart */}
            <BentoCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                    SPEC · PRECIPITATION
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    24h Forecast Profile (Ahmedabad)
                  </h3>
                </div>
                <Badge variant="live">HOURLY</Badge>
              </div>

              <RainfallChart forecast={forecast.data} height={190} />

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
                  Precipitation (mm)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" />
                  Probability (%)
                </span>
              </div>
            </BentoCard>

            {/* Ranked Station Vulnerability Leaderboard */}
            <BentoCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                    SPEC · RANKED ROSTER
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Vulnerability Rank (High to Low)
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Sorted</span>
              </div>

              <div className="space-y-2">
                {sortedRollups.map((st, idx) => {
                  const r = rollups[st.id];
                  return (
                    <Link
                      key={st.id}
                      href={`/station/${st.id}`}
                      className="p-3 rounded-lg border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/80 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-slate-400 w-4">
                          #{idx + 1}
                        </span>
                        <RiskLamp band={r?.band || "Low"} />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                            {st.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Highest: {r?.highestRiskEntranceLabel.split(" (")[0]}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-slate-900">
                          {r?.maxEntranceRisk || 0}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {r?.band}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
