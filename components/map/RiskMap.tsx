"use client";

import { RiskBand, Station } from "@/lib/schema";
import { Layers, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { RiskLamp } from "../risk/RiskLamp";
import { SvgFallbackMap } from "./SvgFallbackMap";

interface RiskMapProps {
  stations: Station[];
  stationRollups: Record<string, { band: RiskBand; score: number }>;
  selectedStationId?: string;
  onSelectStation?: (id: string) => void;
  layers: {
    riskLamps: boolean;
    entrances: boolean;
    pumpPoints: boolean;
  };
}

export const RiskMap: React.FC<RiskMapProps> = ({
  stations,
  stationRollups,
  selectedStationId,
  onSelectStation,
  layers,
}) => {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [useFallback, setUseFallback] = useState(false);
  const [tileErrorOccurred, setTileErrorOccurred] = useState(false);

  useEffect(() => {
    if (useFallback || typeof window === "undefined" || !mapContainerRef.current) return;

    let isSubscribed = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      // Fix default marker icon issues if any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      if (!mapContainerRef.current) return;

      // Clean existing map instance if already mounted
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Ahmedabad center: ~ 23.05, 72.58, zoom 12
      const map = L.map(mapContainerRef.current, {
        center: [23.055, 72.585],
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
      });

      mapInstanceRef.current = map;

      // Tile layer
      const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      });

      tileLayer.on("tileerror", () => {
        if (isSubscribed) {
          setTileErrorOccurred(true);
        }
      });

      tileLayer.addTo(map);

      // Render markers
      renderMarkers(L, map);
    }

    initMap();

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [useFallback]);

  // Update markers when rollups, layers, or selected station change
  useEffect(() => {
    if (!mapInstanceRef.current || useFallback || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      renderMarkers(L.default, mapInstanceRef.current);
    });
  }, [stations, stationRollups, selectedStationId, layers, useFallback]);

  const renderMarkers = (L: any, map: any) => {
    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stations.forEach((st) => {
      const rollup = stationRollups[st.id] || { band: "Low", score: 20 };
      const isSelected = selectedStationId === st.id;

      const bandColor = {
        Low: "#10b981",
        Medium: "#f59e0b",
        High: "#e11d48",
      }[rollup.band];

      const html = `
        <div class="cursor-pointer group flex flex-col items-center">
          <div style="background-color: ${bandColor}; box-shadow: 0 0 10px ${bandColor}80;" 
               class="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[11px] font-mono font-bold transition-transform transform group-hover:scale-110 ${
                 isSelected ? "scale-125 ring-4 ring-emerald-500/40" : ""
               }">
            ${rollup.score}
          </div>
          <div class="mt-1 px-2 py-0.5 bg-slate-900/90 text-white rounded text-[10px] font-medium tracking-tight whitespace-nowrap shadow-md">
            ${st.name.split(" ")[0]}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-station-pin",
        html,
        iconSize: [40, 50],
        iconAnchor: [20, 25],
      });

      const marker = L.marker([st.lat, st.lng], { icon: customIcon });

      marker.on("click", () => {
        if (onSelectStation) {
          onSelectStation(st.id);
        } else {
          router.push(`/station/${st.id}`);
        }
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <h4 style="font-weight: bold; margin: 0 0 4px; font-size: 13px;">${st.name}</h4>
          <p style="margin: 0 0 6px; font-size: 11px; color: #475569;">${st.note}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
            <span>Rollup Risk: <b>${rollup.score}/100 (${rollup.band})</b></span>
            <a href="/station/${st.id}" style="color: #059669; font-weight: bold; text-decoration: underline;">Open Plan →</a>
          </div>
        </div>
      `);

      marker.addTo(map);
      markersRef.current.push(marker);

      // Also render entrances and pump points if layers toggled
      if (layers.entrances) {
        st.entrances.forEach((ent) => {
          const entIcon = L.divIcon({
            className: "ent-pin",
            html: `<div class="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white" title="${ent.label}"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });
          const entMarker = L.marker([ent.lat, ent.lng], { icon: entIcon });
          entMarker.addTo(map);
          markersRef.current.push(entMarker);
        });
      }

      if (layers.pumpPoints) {
        st.assets.pump_candidate_points.forEach((pump, pIdx) => {
          const pumpIcon = L.divIcon({
            className: "pump-pin",
            html: `<div class="w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[9px] flex items-center justify-center border border-white" title="${pump.label}">P${pIdx + 1}</div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          const pumpMarker = L.marker([pump.lat, pump.lng], { icon: pumpIcon });
          pumpMarker.addTo(map);
          markersRef.current.push(pumpMarker);
        });
      }
    });
  };

  if (useFallback) {
    return (
      <div className="relative">
        <SvgFallbackMap
          stations={stations}
          stationRollups={stationRollups}
          selectedStationId={selectedStationId}
          onSelectStation={onSelectStation}
        />
        <button
          onClick={() => setUseFallback(false)}
          className="absolute top-3 right-3 z-20 px-2.5 py-1 text-xs bg-white text-slate-800 rounded border border-slate-300 shadow-sm hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Switch to Tile Map
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Controls Overlay */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
        {tileErrorOccurred && (
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono border border-amber-300">
            Tile Warning
          </span>
        )}
        <button
          onClick={() => setUseFallback(true)}
          className="px-2.5 py-1 text-xs font-mono bg-white/95 text-slate-800 rounded-md border border-slate-300 shadow-sm hover:bg-slate-50 flex items-center gap-1 cursor-pointer backdrop-blur-xs"
        >
          <Layers className="w-3.5 h-3.5 text-slate-600" />
          Schematic Fallback
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-lg p-2.5 shadow-md flex items-center gap-3">
        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Risk:</span>
        <RiskLamp band="Low" withLabel size="sm" />
        <RiskLamp band="Medium" withLabel size="sm" />
        <RiskLamp band="High" withLabel size="sm" />
      </div>
    </div>
  );
};
