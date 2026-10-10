import { describe, expect, it } from "vitest";
import defaultThresholds from "../data/thresholds.json";
import { calculateEntranceRisk, determineRiskBand } from "./risk";
import { HourlyForecast } from "./schema";

const mockStation = {
  drainage: {
    capacity_index: 0.5,
    blockage_risk: 0.5,
    quality: "simulated" as const,
  },
  history: {
    known_waterlogging_points: 2,
    last_event_note: "Past rain pooling",
    quality: "simulated" as const,
  },
  parking: {
    present: true,
    low_lying: false,
  },
};

const baseEntrance = {
  id: "ent-1",
  label: "Main Gate",
  lat: 23.02,
  lng: 72.58,
  elevation_m: 50,
  elevation_quality: "simulated" as const,
  surface: "paved" as const,
  low_point_depth_cm: 20,
  approach_road: "Main Avenue",
  has_electrical_room_nearby: false,
};

function makeMockForecast(peakRain: number, totalRain: number): HourlyForecast {
  const times = Array.from({ length: 24 }, (_, i) => `2026-10-10T${String(i).padStart(2, "0")}:00`);
  const rain = Array(24).fill(0);
  rain[12] = peakRain;
  rain[13] = Math.max(0, totalRain - peakRain);
  const prob = Array(24).fill(80);
  return {
    time: times,
    precipitation: rain,
    precipitation_probability: prob,
  };
}

describe("Risk Engine Tests", () => {
  it("1. Monotonic in rain: higher rainfall strictly increases or maintains risk score", () => {
    const lowRainForecast = makeMockForecast(5, 15);
    const medRainForecast = makeMockForecast(25, 60);
    const highRainForecast = makeMockForecast(55, 140);

    const lowRisk = calculateEntranceRisk(baseEntrance, mockStation, lowRainForecast);
    const medRisk = calculateEntranceRisk(baseEntrance, mockStation, medRainForecast);
    const highRisk = calculateEntranceRisk(baseEntrance, mockStation, highRainForecast);

    expect(medRisk.score).toBeGreaterThan(lowRisk.score);
    expect(highRisk.score).toBeGreaterThan(medRisk.score);
  });

  it("2. Missing data yields INCOMPLETE state without fabricating values", () => {
    const incompleteEntrance = { id: "ent-x" };
    const emptyForecast = { time: [], precipitation: [], precipitation_probability: [] };

    const result = calculateEntranceRisk(incompleteEntrance, mockStation, emptyForecast);
    expect(result.isIncomplete).toBe(true);
    expect(result.score).toBe(0);
    expect(result.evidence[0]).toContain("INCOMPLETE");
  });

  it("3. Threshold band edges map accurately to Low, Medium, and High", () => {
    expect(determineRiskBand(0, defaultThresholds)).toBe("Low");
    expect(determineRiskBand(34, defaultThresholds)).toBe("Low");
    expect(determineRiskBand(35, defaultThresholds)).toBe("Medium");
    expect(determineRiskBand(64, defaultThresholds)).toBe("Medium");
    expect(determineRiskBand(65, defaultThresholds)).toBe("High");
    expect(determineRiskBand(100, defaultThresholds)).toBe("High");
  });

  it("4. Confidence is NEVER 'high' while inputs are simulated", () => {
    const heavyRainForecast = makeMockForecast(60, 160);
    const result = calculateEntranceRisk(baseEntrance, mockStation, heavyRainForecast);

    expect(result.confidence).not.toBe("high");
    expect(["low", "medium"]).toContain(result.confidence);
  });

  it("5. Electrical proximity properly increments hazard sensitivity by 5 points", () => {
    const rain = makeMockForecast(20, 50);
    const normalResult = calculateEntranceRisk(
      { ...baseEntrance, has_electrical_room_nearby: false },
      mockStation,
      rain
    );
    const electricalResult = calculateEntranceRisk(
      { ...baseEntrance, has_electrical_room_nearby: true },
      mockStation,
      rain
    );

    expect(electricalResult.hasElectricalExposure).toBe(true);
    expect(electricalResult.score).toBe(Math.min(100, normalResult.score + 5));
  });
});
