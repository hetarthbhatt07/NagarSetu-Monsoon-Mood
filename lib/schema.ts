import { z } from "zod";

export const EntranceSchema = z.object({
  id: z.string(),
  label: z.string(),
  lat: z.number(),
  lng: z.number(),
  elevation_m: z.number(),
  elevation_quality: z.literal("simulated").default("simulated"),
  surface: z.enum(["paved", "mixed", "unpaved"]),
  low_point_depth_cm: z.number(),
  approach_road: z.string(),
  has_electrical_room_nearby: z.boolean(),
});

export const DrainageSchema = z.object({
  capacity_index: z.number().min(0).max(1),
  blockage_risk: z.number().min(0).max(1),
  quality: z.literal("simulated").default("simulated"),
});

export const HistorySchema = z.object({
  known_waterlogging_points: z.number().min(0),
  last_event_note: z.string(),
  quality: z.literal("simulated").default("simulated"),
});

export const PumpCandidatePointSchema = z.object({
  id: z.string(),
  label: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const AssetsSchema = z.object({
  electrical_room: z.string(),
  pump_candidate_points: z.array(PumpCandidatePointSchema),
});

export const StationSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  note: z.string(),
  entrances: z.array(EntranceSchema),
  drainage: DrainageSchema,
  history: HistorySchema,
  parking: z.object({
    present: z.boolean(),
    low_lying: z.boolean(),
  }),
  assets: AssetsSchema,
});

export const ThresholdsSchema = z.object({
  rain_intensity_mm_per_h: z.object({
    watch: z.number(),
    alert: z.number(),
    severe: z.number(),
  }),
  rain_24h_mm: z.object({
    watch: z.number(),
    alert: z.number(),
    severe: z.number(),
  }),
  risk_bands: z.object({
    low: z.array(z.number()),
    medium: z.array(z.number()),
    high: z.array(z.number()),
  }),
  disclaimer: z.string(),
});

export const HourlyForecastSchema = z.object({
  time: z.array(z.string()),
  precipitation: z.array(z.number()),
  precipitation_probability: z.array(z.number()),
  temperature_2m: z.array(z.number()).optional(),
});

export const OpenMeteoResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  hourly: HourlyForecastSchema,
});

export type Entrance = z.infer<typeof EntranceSchema>;
export type Drainage = z.infer<typeof DrainageSchema>;
export type History = z.infer<typeof HistorySchema>;
export type Station = z.infer<typeof StationSchema>;
export type Thresholds = z.infer<typeof ThresholdsSchema>;
export type HourlyForecast = z.infer<typeof HourlyForecastSchema>;
export type OpenMeteoResponse = z.infer<typeof OpenMeteoResponseSchema>;

export type RiskBand = "Low" | "Medium" | "High";
export type ConfidenceLevel = "low" | "medium"; // Confidence is NEVER "high" while inputs are simulated

export interface RiskDriver {
  factor: string;
  contribution: number; // percentage or relative point impact
  quality: "measured" | "simulated" | "assumed";
  description: string;
}

export interface EntranceRiskResult {
  entranceId: string;
  entranceLabel: string;
  score: number;
  low: number;
  high: number;
  band: RiskBand;
  confidence: ConfidenceLevel;
  rainHazardScore: number;
  vulnerabilityScore: number;
  hasElectricalExposure: boolean;
  peakHour: string;
  peakHourlyMm: number;
  drivers: RiskDriver[];
  evidence: string[];
  hourlyRiskSeries: { hour: string; risk: number; rainMm: number }[];
  isIncomplete?: boolean;
}

export interface StationRollupRisk {
  stationId: string;
  maxEntranceRisk: number;
  band: RiskBand;
  confidence: ConfidenceLevel;
  highestRiskEntranceId: string;
  highestRiskEntranceLabel: string;
  peakHour: string;
  approachRoadRisk: number;
  totalRain24h: number;
  peakIntensityMmPerH: number;
  entranceResults: EntranceRiskResult[];
}

export interface PlanAction {
  id: string;
  phase: "PREPARE" | "POSITION" | "ACTIVE" | "RECOVER";
  phaseWindow: string;
  text: string;
  owner_role: string;
  trigger: string;
  priority: "High" | "Medium" | "Routine";
  evidence: string[];
  status: "todo" | "done";
  entranceId?: string;
}

export interface ClosureRecommendation {
  id: string;
  stationId: string;
  stationName: string;
  entranceId: string;
  entranceLabel: string;
  score: number;
  low: number;
  high: number;
  band: RiskBand;
  driversSummary: string;
  peakHour: string;
  peakHourlyMm: number;
  suggestedAlternateEntrance: string;
  decision?: "approved" | "modified" | "rejected";
  operatorName?: string;
  decisionNote?: string;
  timestamp?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  stationId: string;
  entranceId: string;
  operatorName: string;
  action: "Approve" | "Modify" | "Reject";
  note: string;
  riskSnapshot: {
    score: number;
    band: RiskBand;
  };
}
