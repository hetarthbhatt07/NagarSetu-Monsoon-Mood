import initialStations from "@/data/stations.json";
import defaultThresholds from "@/data/thresholds.json";
import { create } from "zustand";
import { fetchAhmedabadForecast, ForecastState, generatePresetForecast, ScenarioPreset } from "./forecast";
import { calculateStationRollupRisk } from "./risk";
import {
  AuditLogEntry,
  ClosureRecommendation,
  Station,
  StationRollupRisk,
  Thresholds,
} from "./schema";

const STORAGE_KEYS = {
  CHECKLIST: "nagarsetu_checklist_v1",
  AUDIT_LOG: "nagarsetu_audit_log_v1",
  THRESHOLDS: "nagarsetu_thresholds_v1",
  CLOSURE_DECISIONS: "nagarsetu_closure_decisions_v1",
};

interface AppState {
  scenario: ScenarioPreset;
  forecast: ForecastState;
  stations: Station[];
  selectedStationId: string;
  thresholds: Thresholds;
  checklistState: Record<string, boolean>; // actionId -> boolean (done)
  auditLog: AuditLogEntry[];
  closureDecisions: Record<
    string,
    { decision: "approved" | "modified" | "rejected"; operatorName: string; note: string; timestamp: string }
  >;
  mapLayers: {
    riskLamps: boolean;
    entrances: boolean;
    pumpPoints: boolean;
  };
  isCommandPaletteOpen: boolean;
  isSettingsOpen: boolean;

  // Actions
  setScenario: (scenario: ScenarioPreset) => void;
  setSelectedStationId: (id: string) => void;
  loadInitialData: () => Promise<void>;
  refreshForecast: () => Promise<void>;
  updateThresholds: (thresholds: Thresholds) => void;
  resetThresholds: () => void;
  toggleChecklistAction: (actionId: string) => void;
  recordClosureDecision: (
    rec: ClosureRecommendation,
    decision: "approved" | "modified" | "rejected",
    operatorName: string,
    note: string
  ) => void;
  toggleMapLayer: (layer: "riskLamps" | "entrances" | "pumpPoints") => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;

  // Computed helper
  getRollupForStation: (stationId: string) => StationRollupRisk | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  scenario: "live",
  forecast: {
    data: { time: [], precipitation: [], precipitation_probability: [] },
    status: "SAMPLE",
    lastUpdated: "Initializing...",
    sourceNote: "Open-Meteo Ahmedabad",
  },
  stations: initialStations as Station[],
  selectedStationId: "kalupur",
  thresholds: defaultThresholds as Thresholds,
  checklistState: {},
  auditLog: [],
  closureDecisions: {},
  mapLayers: {
    riskLamps: true,
    entrances: true,
    pumpPoints: true,
  },
  isCommandPaletteOpen: false,
  isSettingsOpen: false,

  setScenario: (scenario) => {
    if (scenario === "live") {
      get().refreshForecast();
    } else {
      const data = generatePresetForecast(scenario);
      set({
        scenario,
        forecast: {
          data,
          status: "SAMPLE",
          lastUpdated: `Preset: ${scenario.toUpperCase()}`,
          sourceNote: `Scenario Preset: ${scenario.toUpperCase()} Intensity Simulation`,
        },
      });
    }
  },

  setSelectedStationId: (id) => set({ selectedStationId: id }),

  loadInitialData: async () => {
    if (typeof window !== "undefined") {
      try {
        const storedChecklist = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
        const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
        const storedThresholds = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
        const storedDecisions = localStorage.getItem(STORAGE_KEYS.CLOSURE_DECISIONS);

        set({
          checklistState: storedChecklist ? JSON.parse(storedChecklist) : {},
          auditLog: storedAudit ? JSON.parse(storedAudit) : [],
          thresholds: storedThresholds ? JSON.parse(storedThresholds) : (defaultThresholds as Thresholds),
          closureDecisions: storedDecisions ? JSON.parse(storedDecisions) : {},
        });
      } catch {}
    }
    await get().refreshForecast();
  },

  refreshForecast: async () => {
    const forecastState = await fetchAhmedabadForecast();
    set({ scenario: "live", forecast: forecastState });
  },

  updateThresholds: (thresholds) => {
    set({ thresholds });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholds));
      } catch {}
    }
  },

  resetThresholds: () => {
    set({ thresholds: defaultThresholds as Thresholds });
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEYS.THRESHOLDS);
      } catch {}
    }
  },

  toggleChecklistAction: (actionId) => {
    const current = get().checklistState;
    const updated = { ...current, [actionId]: !current[actionId] };
    set({ checklistState: updated });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(updated));
      } catch {}
    }
  },

  recordClosureDecision: (rec, decision, operatorName, note) => {
    const timestamp = new Date().toISOString();
    const cleanOpName = operatorName.trim() || "Duty Controller";
    const decisionKey = rec.id;

    const actionText =
      decision === "approved" ? "Approve" : decision === "modified" ? "Modify" : "Reject";

    const newAuditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp,
      stationId: rec.stationId,
      entranceId: rec.entranceId,
      operatorName: cleanOpName,
      action: actionText,
      note: note || `Recommendation ${actionText.toLowerCase()}ed by operator.`,
      riskSnapshot: {
        score: rec.score,
        band: rec.band,
      },
    };

    const updatedDecisions = {
      ...get().closureDecisions,
      [decisionKey]: {
        decision,
        operatorName: cleanOpName,
        note,
        timestamp,
      },
    };

    const updatedAuditLog = [newAuditEntry, ...get().auditLog];

    set({
      closureDecisions: updatedDecisions,
      auditLog: updatedAuditLog,
    });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.CLOSURE_DECISIONS, JSON.stringify(updatedDecisions));
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(updatedAuditLog));
      } catch {}
    }
  },

  toggleMapLayer: (layer) => {
    const current = get().mapLayers;
    set({
      mapLayers: {
        ...current,
        [layer]: !current[layer],
      },
    });
  },

  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),

  getRollupForStation: (stationId) => {
    const { stations, forecast, thresholds } = get();
    const station = stations.find((s) => s.id === stationId);
    if (!station || !forecast.data.precipitation) return null;
    return calculateStationRollupRisk(station, forecast.data, thresholds);
  },
}));
