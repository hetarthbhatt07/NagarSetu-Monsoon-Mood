import { RiskBand, Station } from "@/lib/schema";
import { useRouter } from "next/navigation";
import React from "react";
import { RiskLamp } from "../risk/RiskLamp";

interface SvgFallbackMapProps {
  stations: Station[];
  stationRollups: Record<string, { band: RiskBand; score: number }>;
  selectedStationId?: string;
  onSelectStation?: (id: string) => void;
}

export const SvgFallbackMap: React.FC<SvgFallbackMapProps> = ({
  stations,
  stationRollups,
  selectedStationId,
  onSelectStation,
}) => {
  const router = useRouter();

  // Schematic coordinates for Ahmedabad metro network
  // Bounds ~ Lat 23.01 - 23.10, Lng 72.50 - 72.67
  const getSvgCoords = (lat: number, lng: number) => {
    const minLat = 23.01;
    const maxLat = 23.10;
    const minLng = 72.50;
    const maxLng = 72.68;

    const x = ((lng - minLng) / (maxLng - minLng)) * 700 + 50;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 360 + 40;
    return { x, y };
  };

  return (
    <div className="relative w-full h-[380px] bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
      <div className="absolute top-3 left-3 z-10 bg-slate-800/90 backdrop-blur-xs border border-slate-700 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300">
        OFFLINE / SCHEMATIC FALLBACK VECTOR
      </div>

      <svg
        viewBox="0 0 800 440"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* River Sabarmati schematic curve */}
        <path
          d="M 420 20 Q 390 140, 370 240 T 360 420"
          fill="none"
          stroke="#0284c7"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.4"
        />
        <text x="350" y="240" fill="#38bdf8" fontSize="10" fontFamily="monospace" opacity="0.6">
          SABARMATI RIVER
        </text>

        {/* Metro East-West corridor track */}
        <line x1="80" y1="230" x2="720" y2="390" stroke="#475569" strokeWidth="6" strokeDasharray="4 2" />
        {/* Metro North-South corridor track */}
        <line x1="430" y1="60" x2="380" y2="380" stroke="#475569" strokeWidth="6" strokeDasharray="4 2" />

        {/* Stations */}
        {stations.map((st) => {
          const { x, y } = getSvgCoords(st.lat, st.lng);
          const rollup = stationRollups[st.id] || { band: "Low", score: 20 };
          const isSelected = selectedStationId === st.id;

          const dotColor = {
            Low: "#10b981",
            Medium: "#f59e0b",
            High: "#f43f5e",
          }[rollup.band];

          return (
            <g
              key={st.id}
              onClick={() => {
                if (onSelectStation) onSelectStation(st.id);
                else router.push(`/station/${st.id}`);
              }}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              {/* Outer halo */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 18 : 14}
                fill={dotColor}
                opacity="0.2"
                className={rollup.band === "High" ? "animate-ping" : ""}
              />
              {/* Core Station Dot */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 9 : 7}
                fill={dotColor}
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Station Label */}
              <rect
                x={x - 60}
                y={y - 28}
                width="120"
                height="20"
                rx="4"
                fill="#0f172a"
                fillOpacity="0.85"
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x={x}
                y={y - 15}
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {st.name.split(" ")[0]} ({rollup.score})
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend overlay */}
      <div className="absolute bottom-3 right-3 z-10 bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-300 flex items-center gap-3">
        <RiskLamp band="Low" withLabel size="sm" />
        <RiskLamp band="Medium" withLabel size="sm" />
        <RiskLamp band="High" withLabel size="sm" />
      </div>
    </div>
  );
};
