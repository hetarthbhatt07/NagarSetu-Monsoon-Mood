import { Thresholds } from "@/lib/schema";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RiskTimelineChartProps {
  series: { hour: string; risk: number; rainMm: number }[];
  thresholds: Thresholds;
  height?: number;
}

export const RiskTimelineChart: React.FC<RiskTimelineChartProps> = ({
  series,
  thresholds,
  height = 220,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className="w-full bg-slate-100/60 rounded-lg animate-pulse flex items-center justify-center text-xs font-mono text-slate-400"
        style={{ height }}
      >
        Loading Risk Timeline Chart...
      </div>
    );
  }

  const watchThreshold = thresholds.risk_bands.medium[0]; // e.g. 35
  const alertThreshold = thresholds.risk_bands.high[0]; // e.g. 65

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E11D48" stopOpacity={0.6} />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          {/* Shaded Threshold Bands */}
          <ReferenceArea y1={0} y2={watchThreshold} fill="#ECFDF5" fillOpacity={0.6} />
          <ReferenceArea
            y1={watchThreshold}
            y2={alertThreshold}
            fill="#FFFBEB"
            fillOpacity={0.6}
          />
          <ReferenceArea y1={alertThreshold} y2={100} fill="#FFF1F2" fillOpacity={0.6} />

          <ReferenceLine
            y={watchThreshold}
            stroke="#D97706"
            strokeDasharray="3 3"
            label={{
              value: "Watch (35)",
              fill: "#D97706",
              fontSize: 10,
              position: "insideTopRight",
              fontFamily: "monospace",
            }}
          />
          <ReferenceLine
            y={alertThreshold}
            stroke="#E11D48"
            strokeDasharray="3 3"
            label={{
              value: "Alert (65)",
              fill: "#E11D48",
              fontSize: 10,
              position: "insideTopRight",
              fontFamily: "monospace",
            }}
          />

          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: "#64748B", fontFamily: "monospace" }}
            tickLine={false}
            axisLine={{ stroke: "#CBD5E1" }}
            interval={2}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#64748B", fontFamily: "monospace" }}
            tickLine={false}
            axisLine={{ stroke: "#CBD5E1" }}
            unit="/100"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
            formatter={(value: any, name: string) => {
              if (name === "risk") return [`${value} / 100`, "Calculated Risk"];
              if (name === "rainMm") return [`${value} mm`, "Rainfall Intensity"];
              return [value, name];
            }}
          />
          <Area
            type="monotone"
            dataKey="risk"
            stroke="#0F172A"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#riskGradient)"
            name="risk"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
