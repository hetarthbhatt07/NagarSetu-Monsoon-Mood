import { HourlyForecast } from "@/lib/schema";
import React, { useEffect, useState } from "react";
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RainfallChartProps {
  forecast: HourlyForecast;
  height?: number;
}

export const RainfallChart: React.FC<RainfallChartProps> = ({
  forecast,
  height = 200,
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
        Loading Rainfall Chart...
      </div>
    );
  }

  const times = (forecast.time || []).slice(0, 24);
  const rain = (forecast.precipitation || []).slice(0, 24);
  const prob = (forecast.precipitation_probability || []).slice(0, 24);

  const chartData = times.map((t, idx) => {
    const hourLabel = t.includes("T") ? t.split("T")[1].slice(0, 5) : `${idx}:00`;
    return {
      hour: hourLabel,
      rain: Number((rain[idx] || 0).toFixed(1)),
      probability: prob[idx] || 0,
    };
  });

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: "#64748B", fontFamily: "monospace" }}
            tickLine={false}
            axisLine={{ stroke: "#CBD5E1" }}
            interval={2}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 10, fill: "#059669", fontFamily: "monospace" }}
            tickLine={false}
            axisLine={{ stroke: "#CBD5E1" }}
            unit="mm"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#3B82F6", fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            unit="%"
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
              if (name === "rain") return [`${value} mm`, "Precipitation"];
              if (name === "probability") return [`${value}%`, "Rain Probability"];
              return [value, name];
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="rain"
            fill="#059669"
            radius={[3, 3, 0, 0]}
            name="rain"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="probability"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            name="probability"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
