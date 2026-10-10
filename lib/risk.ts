import defaultThresholds from "../data/thresholds.json";
import {
  ConfidenceLevel,
  Entrance,
  EntranceRiskResult,
  HourlyForecast,
  RiskBand,
  RiskDriver,
  Station,
  StationRollupRisk,
  Thresholds,
} from "./schema";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

const fallbackThresholds = defaultThresholds as unknown as Thresholds;

export function determineRiskBand(score: number, thresholds: Thresholds = fallbackThresholds): RiskBand {
  if (score >= thresholds.risk_bands.high[0]) return "High";
  if (score >= thresholds.risk_bands.medium[0]) return "Medium";
  return "Low";
}

export function calculateEntranceRisk(
  entrance: Partial<Entrance>,
  station: Pick<Station, "drainage" | "history" | "parking">,
  forecast: HourlyForecast,
  thresholds: Thresholds = fallbackThresholds
): EntranceRiskResult {
  // Check for incomplete required data
  if (
    !entrance.id ||
    entrance.low_point_depth_cm === undefined ||
    entrance.surface === undefined ||
    !station.drainage ||
    station.drainage.capacity_index === undefined ||
    station.drainage.blockage_risk === undefined ||
    !station.history ||
    station.history.known_waterlogging_points === undefined ||
    !forecast.precipitation ||
    forecast.precipitation.length === 0
  ) {
    return {
      entranceId: entrance.id || "unknown",
      entranceLabel: entrance.label || "Incomplete Entrance Profile",
      score: 0,
      low: 0,
      high: 0,
      band: "Low",
      confidence: "low",
      rainHazardScore: 0,
      vulnerabilityScore: 0,
      hasElectricalExposure: false,
      peakHour: "--:--",
      peakHourlyMm: 0,
      drivers: [],
      evidence: ["Missing telemetry / profile attributes. Marked INCOMPLETE."],
      hourlyRiskSeries: [],
      isIncomplete: true,
    };
  }

  // Next 24 hours of forecast
  const next24Rain = forecast.precipitation.slice(0, 24);
  const next24Prob = (forecast.precipitation_probability || []).slice(0, 24);
  const next24Times = (forecast.time || []).slice(0, 24);

  // Peak hourly mm & 24h total
  let peakHourlyMm = 0;
  let peakIndex = 0;
  let sum24hMm = 0;
  for (let i = 0; i < next24Rain.length; i++) {
    const val = next24Rain[i];
    sum24hMm += val;
    if (val > peakHourlyMm) {
      peakHourlyMm = val;
      peakIndex = i;
    }
  }

  const peakHourRaw = next24Times[peakIndex] || "18:00";
  const peakHour = peakHourRaw.includes("T") ? peakHourRaw.split("T")[1].slice(0, 5) : peakHourRaw;

  // Step 1: Rain hazard (0-100)
  const severeIntensity = thresholds.rain_intensity_mm_per_h.severe || 50;
  const severe24h = thresholds.rain_24h_mm.severe || 150;

  const intensityScore = clamp((peakHourlyMm / severeIntensity) * 100);
  const volumeScore = clamp((sum24hMm / severe24h) * 100);
  const rainHazard = clamp(0.55 * intensityScore + 0.45 * volumeScore);

  // Step 2: Site vulnerability (0-100)
  const lowPointScore = clamp((entrance.low_point_depth_cm / 40) * 100);
  const drainageDeficit = clamp(
    (1 - station.drainage.capacity_index) * 60 + station.drainage.blockage_risk * 40
  );
  const historyScore = clamp(station.history.known_waterlogging_points * 20);

  let surfaceScore = 50;
  if (entrance.surface === "paved") surfaceScore = 70;
  else if (entrance.surface === "mixed") surfaceScore = 50;
  else if (entrance.surface === "unpaved") surfaceScore = 30;

  const vulnerability = clamp(
    0.35 * lowPointScore +
      0.30 * drainageDeficit +
      0.20 * historyScore +
      0.15 * surfaceScore
  );

  // Step 3: Combined entrance risk
  let combinedRisk = clamp(0.5 * rainHazard + 0.5 * vulnerability);
  const hasElectricalExposure = Boolean(entrance.has_electrical_room_nearby);
  if (hasElectricalExposure) {
    combinedRisk = Math.min(100, combinedRisk + 5);
  }

  const score = Math.round(combinedRisk);
  const band = determineRiskBand(score, thresholds);

  // Step 4: Uncertainty band
  // ± width = 8 + (100 − forecastProbabilityAvg)/5 + (any simulated input ? 7 : 0)
  const avgProb =
    next24Prob.length > 0
      ? next24Prob.reduce((a, b) => a + b, 0) / next24Prob.length
      : 50;

  const simulatedPenalty = 7; // inputs contain simulated DEM/drainage/history
  const halfWidth = Math.round(8 + (100 - avgProb) / 5 + simulatedPenalty);
  const low = Math.max(0, score - halfWidth);
  const high = Math.min(100, score + halfWidth);

  // Confidence is NEVER "high" while inputs are simulated!
  const confidence: ConfidenceLevel = avgProb > 70 ? "medium" : "low";

  // Drivers breakdown (top contributors)
  const drivers: RiskDriver[] = [
    {
      factor: "Rainfall Intensity",
      contribution: Math.round((peakHourlyMm / severeIntensity) * 100),
      quality: "measured",
      description: `Peak ${peakHourlyMm.toFixed(1)} mm/h vs ${severeIntensity} mm/h severe threshold`,
    },
    {
      factor: "Low-Point Depression",
      contribution: Math.round(lowPointScore),
      quality: "simulated",
      description: `${entrance.low_point_depth_cm} cm depression depth (simulated DEM model)`,
    },
    {
      factor: "Drainage Deficit",
      contribution: Math.round(drainageDeficit),
      quality: "simulated",
      description: `Capacity index ${station.drainage.capacity_index.toFixed(2)}, blockage risk ${(station.drainage.blockage_risk * 100).toFixed(0)}%`,
    },
    {
      factor: "Historical Waterlogging",
      contribution: Math.round(historyScore),
      quality: "simulated",
      description: `${station.history.known_waterlogging_points} prior recorded pooling incidents`,
    },
    {
      factor: "24h Accumulated Volume",
      contribution: Math.round(volumeScore),
      quality: "measured",
      description: `${sum24hMm.toFixed(1)} mm accumulated rain over next 24 hours`,
    },
  ];

  if (hasElectricalExposure) {
    drivers.push({
      factor: "Electrical Exposure Offset",
      contribution: 100,
      quality: "assumed",
      description: "+5 risk offset: Critical sub-station/electrical gear within flood ingress zone",
    });
  }

  // Sort drivers by contribution descending
  drivers.sort((a, b) => b.contribution - a.contribution);

  const evidence = [
    `Peak hourly rain: ${peakHourlyMm.toFixed(1)} mm/h at ${peakHour} (Open-Meteo)`,
    `24h rainfall volume: ${sum24hMm.toFixed(1)} mm total`,
    `Entrance threshold elevation: ${entrance.elevation_m || 50} m (${entrance.elevation_quality || "simulated"})`,
    `Local depression low point: ${entrance.low_point_depth_cm} cm (simulated)`,
    `Drainage capacity index: ${station.drainage.capacity_index} (simulated)`,
    `Drainage blockage risk: ${station.drainage.blockage_risk} (simulated)`,
    `Historical incidents: ${station.history.known_waterlogging_points} events (${station.history.last_event_note})`,
    hasElectricalExposure
      ? "Electrical asset: critical power/switchgear adjacent to entrance"
      : "No electrical room proximity detected",
  ];

  // Step 5: Per-hour risk curve across the next 24h
  // Use hourly rain intensity with a 3-hour rolling accumulation
  const hourlyRiskSeries: { hour: string; risk: number; rainMm: number }[] = [];
  for (let i = 0; i < next24Rain.length; i++) {
    const rawTime = next24Times[i] || `${i}:00`;
    const label = rawTime.includes("T") ? rawTime.split("T")[1].slice(0, 5) : rawTime;
    const rain = next24Rain[i];

    // 3-hour rolling sum
    const rollStart = Math.max(0, i - 2);
    const rollingSum = next24Rain.slice(rollStart, i + 1).reduce((a, b) => a + b, 0);

    const stepIntensityScore = clamp((rain / severeIntensity) * 100);
    const stepVolumeScore = clamp((rollingSum / 35) * 100);
    const stepRainHazard = clamp(0.6 * stepIntensityScore + 0.4 * stepVolumeScore);
    const stepRisk = Math.round(
      clamp(0.55 * stepRainHazard + 0.45 * vulnerability + (hasElectricalExposure ? 5 : 0))
    );

    hourlyRiskSeries.push({
      hour: label,
      risk: stepRisk,
      rainMm: Number(rain.toFixed(1)),
    });
  }

  return {
    entranceId: entrance.id,
    entranceLabel: entrance.label || "Entrance",
    score,
    low,
    high,
    band,
    confidence,
    rainHazardScore: Math.round(rainHazard),
    vulnerabilityScore: Math.round(vulnerability),
    hasElectricalExposure,
    peakHour,
    peakHourlyMm: Number(peakHourlyMm.toFixed(1)),
    drivers: drivers.slice(0, 4),
    evidence,
    hourlyRiskSeries,
    isIncomplete: false,
  };
}

export function calculateStationRollupRisk(
  station: Station,
  forecast: HourlyForecast,
  thresholds: Thresholds = fallbackThresholds
): StationRollupRisk {
  const entranceResults = station.entrances.map((ent) =>
    calculateEntranceRisk(ent, station, forecast, thresholds)
  );

  let maxEntranceRisk = 0;
  let highestRiskEntranceId = station.entrances[0]?.id || "";
  let highestRiskEntranceLabel = station.entrances[0]?.label || "";
  let peakHour = "18:00";
  let peakIntensityMmPerH = 0;

  for (const res of entranceResults) {
    if (res.score > maxEntranceRisk) {
      maxEntranceRisk = res.score;
      highestRiskEntranceId = res.entranceId;
      highestRiskEntranceLabel = res.entranceLabel;
      peakHour = res.peakHour;
      peakIntensityMmPerH = res.peakHourlyMm;
    }
  }

  // Approach road risk
  const next24Rain = (forecast.precipitation || []).slice(0, 24);
  const totalRain24h = Number(next24Rain.reduce((a, b) => a + b, 0).toFixed(1));
  const parkingFactor = station.parking.present && station.parking.low_lying ? 15 : 0;
  const approachRoadRisk = Math.round(
    clamp(maxEntranceRisk * 0.85 + parkingFactor)
  );

  const rollupScore = Math.max(maxEntranceRisk, Math.round(approachRoadRisk * 0.9));
  const band = determineRiskBand(rollupScore, thresholds);

  return {
    stationId: station.id,
    maxEntranceRisk: rollupScore,
    band,
    confidence: "low", // NEVER high while inputs are simulated
    highestRiskEntranceId,
    highestRiskEntranceLabel,
    peakHour,
    approachRoadRisk,
    totalRain24h,
    peakIntensityMmPerH,
    entranceResults,
  };
}
