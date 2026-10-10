"use client";

import { ScenarioPreset } from "@/lib/forecast";
import { useAppStore } from "@/lib/store";
import {
  CloudRain,
  Command,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Badge } from "../ui/Badge";
import { Kbd } from "../ui/Kbd";
import { SegmentedControl } from "../ui/SegmentedControl";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const {
    scenario,
    setScenario,
    forecast,
    setCommandPaletteOpen,
    setSettingsOpen,
  } = useAppStore();

  const scenarioOptions = [
    { value: "live", label: "Live" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Wordmark & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-[0_2px_6px_rgba(5,150,105,0.35),inset_0_1px_0_0_rgba(255,255,255,0.3)] border border-emerald-700/80 group-hover:scale-105 transition-transform">
                <CloudRain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                    NAGARSETU
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    PS-12
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Monsoon readiness for Metro stations
                </p>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200 text-xs font-medium">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  pathname === "/"
                    ? "bg-slate-100 text-emerald-800 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Overview
              </Link>

              <Link
                href="/communications"
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  pathname.startsWith("/communications")
                    ? "bg-slate-100 text-emerald-800 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Commuter Alerts
              </Link>

              <Link
                href="/plan/kalupur"
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  pathname.startsWith("/plan")
                    ? "bg-slate-100 text-emerald-800 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Export Brief
              </Link>
            </nav>
          </div>

          {/* Right Tools & Status Badges */}
          <div className="flex items-center gap-3">
            {/* Scenario Segmented Control */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Scenario:</span>
              <SegmentedControl<ScenarioPreset>
                size="sm"
                value={scenario}
                onChange={(val) => setScenario(val)}
                options={scenarioOptions as any}
              />
            </div>

            {/* Status Badges */}
            <div className="hidden sm:flex items-center gap-1.5">
              <Badge
                variant={
                  forecast.status === "LIVE"
                    ? "live"
                    : forecast.status === "CACHED"
                    ? "cached"
                    : "simulated"
                }
              >
                {forecast.status}
              </Badge>
              <Badge variant="simulated">SIMULATED INPUTS</Badge>
            </div>

            {/* ⌘K Command Palette Button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Command Palette (Ctrl+K)"
            >
              <Command className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs font-mono">⌘K</span>
            </button>

            {/* Settings Drawer Button */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-all cursor-pointer"
              title="Operational Threshold Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
