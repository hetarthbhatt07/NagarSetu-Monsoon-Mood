import sampleForecastData from "@/data/sample-forecast.json";
import { HourlyForecast, OpenMeteoResponse } from "./schema";

export type ScenarioPreset = "live" | "low" | "medium" | "high";

export interface ForecastState {
  data: HourlyForecast;
  status: "LIVE" | "CACHED" | "SAMPLE";
  lastUpdated: string;
  sourceNote: string;
}

const STORAGE_KEY = "nagarsetu_cached_forecast_v1";

export function generatePresetForecast(scenario: "low" | "medium" | "high"): HourlyForecast {
  const baseTimes = sampleForecastData.hourly.time.slice(0, 48);
  const rain: number[] = [];
  const prob: number[] = [];
  const temp: number[] = [];

  for (let i = 0; i < baseTimes.length; i++) {
    const hourOfDay = i % 24;
    let r = 0;
    let p = 15;
    let t = 28 - (hourOfDay > 14 ? 3 : 0);

    if (scenario === "low") {
      // Peak ≤ 5 mm/h, ~20 mm / 24h
      if (hourOfDay >= 11 && hourOfDay <= 16) {
        const peakCurve = Math.sin(((hourOfDay - 11) / 5) * Math.PI);
        r = Number((peakCurve * 4.8).toFixed(1));
        p = 50 + Math.round(peakCurve * 25);
      } else if (hourOfDay > 16 && hourOfDay <= 20) {
        r = 0.8;
        p = 30;
      }
    } else if (scenario === "medium") {
      // Peak ~20 mm/h, ~80 mm / 24h
      if (hourOfDay >= 10 && hourOfDay <= 18) {
        const peakCurve = Math.sin(((hourOfDay - 10) / 8) * Math.PI);
        r = Number((peakCurve * 19.5 + (hourOfDay === 14 ? 1.5 : 0)).toFixed(1));
        p = 65 + Math.round(peakCurve * 30);
      } else if (hourOfDay > 18 && hourOfDay <= 22) {
        r = 3.5;
        p = 45;
      }
    } else if (scenario === "high") {
      // Peak ~55 mm/h, ~180 mm / 24h (burst between 17:00 and 20:00 to overlap evening peak)
      if (hourOfDay >= 16 && hourOfDay <= 21) {
        // Severe evening peak downpour
        if (hourOfDay === 17) r = 42.0;
        else if (hourOfDay === 18) r = 55.4;
        else if (hourOfDay === 19) r = 48.0;
        else if (hourOfDay === 20) r = 26.5;
        else r = 8.5;
        p = 95;
      } else if (hourOfDay >= 11 && hourOfDay <= 15) {
        r = Number((8 + (hourOfDay - 11) * 3).toFixed(1));
        p = 75;
      } else if (hourOfDay >= 7 && hourOfDay <= 10) {
        r = 2.0;
        p = 40;
      }
    }

    rain.push(r);
    prob.push(p);
    temp.push(t);
  }

  return {
    time: baseTimes,
    precipitation: rain,
    precipitation_probability: prob,
    temperature_2m: temp,
  };
}

export async function fetchAhmedabadForecast(): Promise<ForecastState> {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=23.0225&longitude=72.5714&hourly=precipitation,precipitation_probability,temperature_2m&forecast_days=2&timezone=Asia%2FKolkata";

  if (typeof window !== "undefined") {
    try {
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const json: OpenMeteoResponse = await res.json();
        const state: ForecastState = {
          data: json.hourly,
          status: "LIVE",
          lastUpdated: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          sourceNote: "Open-Meteo Ahmedabad (23.02°N, 72.57°E)",
        };
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              ...state,
              savedAt: Date.now(),
            })
          );
        } catch {}
        return state;
      }
    } catch {
      // Network failed or timed out: fall back to cache or sample
    }

    // Try localStorage cache
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const ageMin = Math.round((Date.now() - (parsed.savedAt || Date.now())) / 60000);
        return {
          data: parsed.data,
          status: "CACHED",
          lastUpdated: `${parsed.lastUpdated || "Earlier"} (${ageMin}m ago)`,
          sourceNote: `Cached forecast from ${parsed.lastUpdated || "local storage"}`,
        };
      }
    } catch {}
  }

  // Fallback to sample fixture
  return {
    data: sampleForecastData.hourly,
    status: "SAMPLE",
    lastUpdated: "Bundled Fixture",
    sourceNote: "Offline fixture fallback (48h Ahmedabad monsoon profile)",
  };
}
