import { useAppStore } from "@/lib/store";
import {
  CloudSun,
  FileText,
  MapPin,
  MessageSquare,
  Search,
  Sliders,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Kbd } from "./Kbd";

export const CommandPalette: React.FC = () => {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    stations,
    setScenario,
    setSettingsOpen,
  } = useAppStore();

  const [query, setQuery] = useState("");

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  interface CommandItem {
    id: string;
    title: string;
    category: string;
    icon: React.ReactNode;
    action: () => void;
  }

  const items: CommandItem[] = [
    // Stations
    ...stations.map((st) => ({
      id: `station-${st.id}`,
      title: `Go to ${st.name}`,
      category: "Stations",
      icon: <MapPin className="w-4 h-4 text-emerald-600" />,
      action: () => {
        router.push(`/station/${st.id}`);
        setCommandPaletteOpen(false);
      },
    })),
    // Scenarios
    {
      id: "sc-live",
      title: "Switch scenario: Live Forecast (Open-Meteo)",
      category: "Weather Scenarios",
      icon: <CloudSun className="w-4 h-4 text-blue-600" />,
      action: () => {
        setScenario("live");
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "sc-low",
      title: "Switch scenario: Low (≤5 mm/h peak, 20mm/24h)",
      category: "Weather Scenarios",
      icon: <CloudSun className="w-4 h-4 text-emerald-600" />,
      action: () => {
        setScenario("low");
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "sc-med",
      title: "Switch scenario: Medium (~20 mm/h peak, 80mm/24h)",
      category: "Weather Scenarios",
      icon: <CloudSun className="w-4 h-4 text-amber-600" />,
      action: () => {
        setScenario("medium");
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "sc-high",
      title: "Switch scenario: High (~55 mm/h peak, 180mm/24h burst)",
      category: "Weather Scenarios",
      icon: <CloudSun className="w-4 h-4 text-rose-600" />,
      action: () => {
        setScenario("high");
        setCommandPaletteOpen(false);
      },
    },
    // Navigation / Utilities
    {
      id: "nav-comm",
      title: "Open Commuter Communications Hub",
      category: "Navigation",
      icon: <MessageSquare className="w-4 h-4 text-indigo-600" />,
      action: () => {
        router.push("/communications");
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "nav-plan-kalupur",
      title: "Export Station Readiness Plan (Printable Brief)",
      category: "Navigation",
      icon: <FileText className="w-4 h-4 text-purple-600" />,
      action: () => {
        router.push("/plan/kalupur");
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "nav-settings",
      title: "Open Settings & Thresholds Drawer",
      category: "Settings",
      icon: <Sliders className="w-4 h-4 text-slate-600" />,
      action: () => {
        setSettingsOpen(true);
        setCommandPaletteOpen(false);
      },
    },
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Palette Card */}
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-4 h-4 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a station name, scenario, or action..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No matching stations or actions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100/80 flex items-center justify-between text-sm transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-white border border-slate-200/70">
                    {item.icon}
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">{item.title}</span>
                    <span className="block text-[11px] font-mono text-slate-400">
                      {item.category}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-600 font-mono">
                  ↵ Enter
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Navigate</span>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span>Select</span>
            <Kbd>↵</Kbd>
          </div>
          <div>
            <Kbd>ESC</Kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
};
