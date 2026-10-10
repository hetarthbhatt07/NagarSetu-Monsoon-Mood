import {
  ClosureRecommendation,
  EntranceRiskResult,
  PlanAction,
  Station,
  StationRollupRisk,
} from "./schema";

export function generateReadinessPlan(
  station: Station,
  rollup: StationRollupRisk
): {
  actions: PlanAction[];
  closureRecommendations: ClosureRecommendation[];
  rankedPumps: {
    id: string;
    label: string;
    lat: number;
    lng: number;
    rank: number;
    targetEntranceLabel: string;
    distanceMetersApprox: number;
  }[];
} {
  const actions: PlanAction[] = [];
  const closureRecommendations: ClosureRecommendation[] = [];

  const highestEnt = rollup.entranceResults.find(
    (e) => e.entranceId === rollup.highestRiskEntranceId
  ) || rollup.entranceResults[0];

  // Helper for alternate entrance
  const findAlternateEntrance = (closedEntId: string): string => {
    const others = station.entrances.filter((e) => e.id !== closedEntId);
    if (others.length === 0) return "Nearest adjacent public concourse";
    // Find entrance with lowest risk
    const lowest = rollup.entranceResults
      .filter((e) => e.entranceId !== closedEntId)
      .sort((a, b) => a.score - b.score)[0];
    const match = station.entrances.find((e) => e.id === lowest?.entranceId);
    return match ? match.label : others[0].label;
  };

  // 1. Phase: PREPARE (T-24h -> T-12h)
  actions.push({
    id: `${station.id}-prep-drain`,
    phase: "PREPARE",
    phaseWindow: "T-24h → T-12h (Before Rain)",
    text: `Inspect and clear silt/grates at ${station.entrances.map((e) => e.label.split(" (")[0]).join(", ")}. Clear debris from catch-pits.`,
    owner_role: "Station Facility Manager",
    trigger: `IF 24h rainfall volume forecast ≥ 20 mm (Current: ${rollup.totalRain24h} mm)`,
    priority: "High",
    evidence: [
      `Drainage blockage risk: ${(station.drainage.blockage_risk * 100).toFixed(0)}% (simulated)`,
      `Total 24h rain: ${rollup.totalRain24h} mm`,
    ],
    status: "todo",
  });

  actions.push({
    id: `${station.id}-prep-power`,
    phase: "PREPARE",
    phaseWindow: "T-24h → T-12h (Before Rain)",
    text: `Verify auxiliary generator fuel and test sump pump auto-start circuit for ${station.assets.electrical_room}.`,
    owner_role: "Electrical Systems Engineer",
    trigger: `IF station risk band = ${rollup.band} OR peak rain ≥ 10 mm/h`,
    priority: rollup.band === "High" ? "High" : "Medium",
    evidence: [
      `Substation: ${station.assets.electrical_room}`,
      `Peak intensity: ${rollup.peakIntensityMmPerH} mm/h`,
    ],
    status: "todo",
  });

  actions.push({
    id: `${station.id}-prep-sandbags`,
    phase: "PREPARE",
    phaseWindow: "T-24h → T-12h (Before Rain)",
    text: `Pre-stage 40 sandbags and quick-deployment flood barrier planks at threshold of ${highestEnt?.entranceLabel}.`,
    owner_role: "Operations Shift Supervisor",
    trigger: `IF entrance low point depth > 20 cm OR entrance risk score ≥ 35`,
    priority: highestEnt?.score >= 65 ? "High" : "Medium",
    evidence: [
      `${highestEnt?.entranceLabel} low point depth: ${
        station.entrances.find((e) => e.id === highestEnt?.entranceId)?.low_point_depth_cm || 0
      } cm (simulated)`,
    ],
    status: "todo",
  });

  // 2. Phase: POSITION (T-12h -> T-3h)
  const primaryPumpPoint = station.assets.pump_candidate_points[0]?.label || "Designated Sump Basin";
  actions.push({
    id: `${station.id}-pos-pump`,
    phase: "POSITION",
    phaseWindow: "T-12h → T-3h (Approaching Peak)",
    text: `Deploy mobile dewatering pump (min 1500 LPM) to ${primaryPumpPoint} nearest ${highestEnt?.entranceLabel}. Run discharge hose to main storm culvert.`,
    owner_role: "Mechanical Response Team",
    trigger: `IF peak rain forecast ≥ 25 mm/h at ${rollup.peakHour}`,
    priority: "High",
    evidence: [
      `Forecast peak intensity: ${rollup.peakIntensityMmPerH} mm/h at ${rollup.peakHour}`,
      `Candidate pump: ${primaryPumpPoint}`,
    ],
    status: "todo",
  });

  if (highestEnt?.hasElectricalExposure) {
    actions.push({
      id: `${station.id}-pos-elec-seal`,
      phase: "POSITION",
      phaseWindow: "T-12h → T-3h (Approaching Peak)",
      text: `Erect water-stop barriers at doorway of ${station.assets.electrical_room}; elevate portable tools and spare relays above 50 cm.`,
      owner_role: "Electrical Maintenance Lead",
      trigger: `IF entrance adjacent to electrical room reaches Medium or High risk`,
      priority: "High",
      evidence: [
        `Electrical room proximity confirmed for ${highestEnt?.entranceLabel}`,
        `Current entrance risk: ${highestEnt.score}/100`,
      ],
      status: "todo",
    });
  }

  actions.push({
    id: `${station.id}-pos-staff`,
    phase: "POSITION",
    phaseWindow: "T-12h → T-3h (Approaching Peak)",
    text: `Position customer support marshals at ${highestEnt?.entranceLabel} and approach roads with public guidance megaphones.`,
    owner_role: "Station Controller",
    trigger: `IF rain intensity alert threshold exceeded or approach road risk ≥ 50`,
    priority: rollup.approachRoadRisk >= 50 ? "High" : "Routine",
    evidence: [`Approach road risk score: ${rollup.approachRoadRisk}/100`],
    status: "todo",
  });

  // 3. Phase: ACTIVE (T-3h -> Peak)
  actions.push({
    id: `${station.id}-act-monitor`,
    phase: "ACTIVE",
    phaseWindow: "T-3h → Peak Window (During Downpour)",
    text: `Conduct 30-minute visual inspections of street gutter velocity and stairwell sumps at all entrances.`,
    owner_role: "Duty Station Controller",
    trigger: `Active rainfall event in progress (Peak: ${rollup.peakHour})`,
    priority: "High",
    evidence: [`Peak window: ${rollup.peakHour} ± 2 hrs`],
    status: "todo",
  });

  actions.push({
    id: `${station.id}-act-msg`,
    phase: "ACTIVE",
    phaseWindow: "T-3h → Peak Window (During Downpour)",
    text: `Broadcast advisory on station PA and digital passenger displays: guide passengers toward protected alternate entrances.`,
    owner_role: "Passenger Information Controller",
    trigger: `IF any entrance risk band is Medium or High`,
    priority: "Medium",
    evidence: [`Station risk band: ${rollup.band}`],
    status: "todo",
  });

  // 4. Phase: RECOVER (Peak -> T+6h)
  actions.push({
    id: `${station.id}-rec-pump-out`,
    phase: "RECOVER",
    phaseWindow: "Peak → T+6h (Post-Rain Recovery)",
    text: `Pump out residual ponding in apron depressions and wash down silt/mud from pedestrian walkways.`,
    owner_role: "Sanitation & Civil Maintenance",
    trigger: `Rainfall subsides below 5 mm/h`,
    priority: "Medium",
    evidence: ["Residual low-point silt accumulation risk"],
    status: "todo",
  });

  actions.push({
    id: `${station.id}-rec-inspection`,
    phase: "RECOVER",
    phaseWindow: "Peak → T+6h (Post-Rain Recovery)",
    text: `Physical inspection of escalator pits, lift shafts and electrical conduits. Submit signed clearance log to Operations Control Center.`,
    owner_role: "Station Safety Inspector",
    trigger: `Post-event re-opening checklist requirement`,
    priority: "High",
    evidence: ["Mandatory metro safety compliance guideline §7.3"],
    status: "todo",
  });

  // CLOSURE RECOMMENDATIONS
  // Rule: only when an entrance risk band is High OR risk high-bound >= 80
  rollup.entranceResults.forEach((entRes: EntranceRiskResult) => {
    if (entRes.band === "High" || entRes.high >= 80) {
      const entObj = station.entrances.find((e) => e.id === entRes.entranceId);
      const alternate = findAlternateEntrance(entRes.entranceId);

      const driversStr = entRes.drivers
        .slice(0, 2)
        .map((d) => `${d.factor.toLowerCase()} (${d.quality})`)
        .join(", ");

      closureRecommendations.push({
        id: `closure-${station.id}-${entRes.entranceId}`,
        stationId: station.id,
        stationName: station.name,
        entranceId: entRes.entranceId,
        entranceLabel: entRes.entranceLabel,
        score: entRes.score,
        low: entRes.low,
        high: entRes.high,
        band: entRes.band,
        driversSummary: `${driversStr}, forecast ${entRes.peakHourlyMm} mm/h at ${entRes.peakHour}`,
        peakHour: entRes.peakHour,
        peakHourlyMm: entRes.peakHourlyMm,
        suggestedAlternateEntrance: alternate,
      });
    }
  });

  // PUMP PLACEMENT RANKING
  // Rank pump_candidate_points by proximity to highest-risk entrance
  const highEntObj = station.entrances.find(
    (e) => e.id === highestEnt?.entranceId
  ) || station.entrances[0];

  const rankedPumps = (station.assets.pump_candidate_points || []).map((pump, idx) => {
    // Approx distance in meters (1 deg lat ~ 111,000 m, 1 deg lng ~ 102,000 m in Ahmedabad)
    const dLat = (pump.lat - highEntObj.lat) * 111000;
    const dLng = (pump.lng - highEntObj.lng) * 102000;
    const dist = Math.round(Math.hypot(dLat, dLng));

    return {
      id: pump.id,
      label: pump.label,
      lat: pump.lat,
      lng: pump.lng,
      rank: idx + 1,
      targetEntranceLabel: highEntObj.label,
      distanceMetersApprox: Math.max(10, dist),
    };
  });

  // Sort by distance ascending
  rankedPumps.sort((a, b) => a.distanceMetersApprox - b.distanceMetersApprox);
  rankedPumps.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  return {
    actions,
    closureRecommendations,
    rankedPumps,
  };
}
