"use client";

import { EntranceRiskResult, Station } from "@/lib/schema";
import { Zap } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface StationMiniMapProps {
  station: Station;
  entranceRisks: EntranceRiskResult[];
  rankedPumps: {
    id: string;
    label: string;
    lat: number;
    lng: number;
    rank: number;
  }[];
}

export const StationMiniMap: React.FC<StationMiniMapProps> = ({
  station,
  entranceRisks,
  rankedPumps,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isSubscribed = true;

    async function initMiniMap() {
      const L = (await import("leaflet")).default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [station.lat, station.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Station Center Icon
      const centerIcon = L.divIcon({
        className: "station-center-pin",
        html: `<div class="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono font-bold shadow-md border border-slate-700 whitespace-nowrap">${station.name}</div>`,
        iconSize: [100, 20],
        iconAnchor: [50, 10],
      });
      L.marker([station.lat, station.lng], { icon: centerIcon }).addTo(map);

      // Entrances
      station.entrances.forEach((ent) => {
        const entRisk = entranceRisks.find((r) => r.entranceId === ent.id);
        const bandColor =
          entRisk?.band === "High"
            ? "#e11d48"
            : entRisk?.band === "Medium"
            ? "#f59e0b"
            : "#10b981";

        const entIcon = L.divIcon({
          className: "ent-pin",
          html: `
            <div class="flex flex-col items-center">
              <div style="background-color: ${bandColor};" class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold font-mono">
                ${entRisk ? entRisk.score : "!"}
              </div>
              <div class="mt-0.5 px-1.5 py-0.2 bg-white/95 text-slate-800 rounded text-[9px] font-mono border border-slate-300 shadow-xs whitespace-nowrap">
                ${ent.label.split(" (")[0]}
              </div>
            </div>
          `,
          iconSize: [60, 40],
          iconAnchor: [30, 20],
        });

        L.marker([ent.lat, ent.lng], { icon: entIcon })
          .bindPopup(`<b>${ent.label}</b><br/>Approach: ${ent.approach_road}<br/>Risk: ${entRisk?.score || 0}`)
          .addTo(map);
      });

      // Pump Candidate Points
      rankedPumps.forEach((pump) => {
        const pumpIcon = L.divIcon({
          className: "pump-pin",
          html: `
            <div class="flex flex-col items-center">
              <div class="w-6 h-6 rounded-md bg-blue-600 text-white font-mono font-bold text-[11px] flex items-center justify-center border-2 border-white shadow-md">
                P${pump.rank}
              </div>
              <div class="mt-0.5 px-1 bg-blue-900 text-blue-100 rounded text-[8px] font-mono whitespace-nowrap">
                Pump #${pump.rank}
              </div>
            </div>
          `,
          iconSize: [40, 35],
          iconAnchor: [20, 18],
        });

        L.marker([pump.lat, pump.lng], { icon: pumpIcon })
          .bindPopup(`<b>${pump.label}</b><br/>Deployment Priority: #${pump.rank}`)
          .addTo(map);
      });

      // Electrical room pin near highest-risk entrance or first entrance with electrical room
      const entWithElec = station.entrances.find((e) => e.has_electrical_room_nearby);
      if (entWithElec) {
        const elecIcon = L.divIcon({
          className: "elec-pin",
          html: `
            <div class="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 border-white shadow-md" title="Electrical Asset Zone">
              ⚡
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        L.marker([entWithElec.lat + 0.0003, entWithElec.lng + 0.0003], { icon: elecIcon })
          .bindPopup(`<b>Critical Asset</b><br/>${station.assets.electrical_room}`)
          .addTo(map);
      }
    }

    initMiniMap();

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [station, entranceRisks, rankedPumps]);

  return (
    <div className="relative w-full h-[280px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Mini Legend overlay */}
      <div className="absolute bottom-2 left-2 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200 rounded-md px-2.5 py-1.5 shadow text-[10px] font-mono text-slate-700 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Entrance
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block text-white text-[8px] text-center">P</span> Pump
        </span>
        <span className="flex items-center gap-1 text-amber-600">
          <Zap className="w-2.5 h-2.5" /> Substation
        </span>
      </div>
    </div>
  );
};
