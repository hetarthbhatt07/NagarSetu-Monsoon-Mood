# NAGARSETU — Monsoon Mode Prototype
### Metro Hacks PS-12: City Public Transport Track

> **Station-specific 24-hour monsoon readiness plan for Ahmedabad Metro**, combining live weather forecasting, transparent site vulnerability screening, entrance closure reviews, pump geo-placement, and multilingual commuter advisories.

---

## 1. Safety & Honesty Disclosures (Non-Negotiable)

1. **Preparedness Prototype, Not Flood Prediction:**  
   This system is a **screening risk tool**, not a calibrated hydrodynamic or hydraulic flood model. **Forecast rainfall ≠ predicted water depth.** No water depths are predicted or displayed.
2. **Operator Authority & Review:**  
   The prototype **never** autonomously closes a station entrance. Highly vulnerable entrances generate recommendations phrased strictly as:  
   `"Recommend operator review for closure"`. All operator decisions (`Approve`, `Modify`, `Reject`) require an operator name and are permanently preserved in an audit trail.
3. **Simulated vs. Real Data:**
   - **Real:** Live hourly precipitation and probability data fetched via the **Open-Meteo Weather API** for Ahmedabad (`23.0225°N, 72.5714°E`).
   - **Simulated:** Micro-elevation DEM levels, low-point depression depths, drainage capacity/blockage indices, and historical waterlogging incident records are simulated for the 5 sample stations. Every simulated metric carries a visible `SIMULATED` badge.
   - **Confidence Cap:** Confidence bands are intentionally restricted to `low` or `medium`; confidence is **never** flagged as `high` while inputs are simulated.
   - **Incomplete Data Safety:** Missing telemetry marks results as `INCOMPLETE` rather than fabricating values.
   - **Language Drafts:** Gujarati and Hindi commuter broadcasts are labeled as `Translation draft, verify with a fluent speaker before publishing`.

---

## 2. Risk Calculation Engine

Risk calculation runs purely on deterministic mathematics without black-box ML models (`/lib/risk.ts`):

### Step 1: Rain Hazard Score (0–100)
$$\text{intensityScore} = \text{clamp}\left(\frac{\text{peak\_hourly\_mm}}{\text{severe\_intensity}} \times 100\right)$$
$$\text{volumeScore} = \text{clamp}\left(\frac{\text{sum\_24h\_mm}}{\text{severe\_24h}} \times 100\right)$$
$$\text{rainHazard} = 0.55 \times \text{intensityScore} + 0.45 \times \text{volumeScore}$$

### Step 2: Site Vulnerability Score (0–100)
$$\text{lowPointScore} = \text{clamp}\left(\frac{\text{low\_point\_depth\_cm}}{40} \times 100\right)$$
$$\text{drainageDeficit} = (1 - \text{capacity\_index}) \times 60 + \text{blockage\_risk} \times 40$$
$$\text{historyScore} = \text{clamp}(\text{known\_waterlogging\_points} \times 20)$$
$$\text{surfaceScore} = \begin{cases} 70 & \text{paved (high runoff)} \\ 50 & \text{mixed} \\ 30 & \text{unpaved} \end{cases}$$
$$\text{vulnerability} = 0.35 \times \text{lowPointScore} + 0.30 \times \text{drainageDeficit} + 0.20 \times \text{historyScore} + 0.15 \times \text{surfaceScore}$$

### Step 3: Combined Entrance Risk & Electrical Offset
$$\text{risk} = \text{clamp}(0.50 \times \text{rainHazard} + 0.50 \times \text{vulnerability})$$
If an electrical substation or transformer room is adjacent, a $+5$ point exposure offset is applied.

### Step 4: Uncertainty Band
$$\text{halfWidth} = 8 + \frac{100 - \text{forecastProbAvg}}{5} + 7 \,(\text{simulated penalty})$$
$$\text{band} = [\max(0, \text{score} - \text{halfWidth}), \min(100, \text{score} + \text{halfWidth})]$$

---

## 3. Key Features

- **Paperweight Tactile UI:** Warm off-white canvas (`#FAFAFA`), subtle blueprint grid, carved well tracks, physical status lamps, and press physics (`DESIGN.md`).
- **Interactive Network Map:** Leaflet map with OpenStreetMap tiles, layer toggles for risk lamps, entrances, and pumps. Includes an **offline schematic SVG fallback map** if tiles are unavailable.
- **Scenario Presets:** Instant switching between **Live Forecast**, **Low** ($\le 5$ mm/h), **Medium** ($\sim 20$ mm/h), and **High** ($\sim 55$ mm/h evening burst).
- **Phased 24-Hour Readiness Plan:** `PREPARE` ($T-24\text{h} \to T-12\text{h}$), `POSITION` ($T-12\text{h} \to T-3\text{h}$), `ACTIVE` ($T-3\text{h} \to \text{Peak}$), and `RECOVER` ($\text{Peak} \to T+6\text{h}$) with dynamic triggers and progress tracking.
- **Closure Review & Audit Trail:** Interactive modal and persistent audit log with operator timestamp.
- **Dewatering Pump Geo-Staging:** Ranks pump candidate points by proximity to highest-risk ingress portals.
- **Multilingual Communications:** Instant WhatsApp, Station PA, Notice Board, and Social/SMS advisories in English, Gujarati, and Hindi with exact character counters (WhatsApp 300-char limit).
- **Printable 1-Page Brief:** Formatted operations brief with print stylesheet (`/plan/[id]`).
- **Command Palette:** Keyboard-navigable `⌘K` palette for rapid station jumping and scenario switching.

---

## 4. Running Locally & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (vitest)
npm run test

# 3. Start development server
npm run dev

# 4. Production build validation
npm run build
```

---

## 5. How to Plug In Real City Data

1. **High-Resolution Elevation (DEM):**  
   Replace `elevation_m` and `low_point_depth_cm` with zonal extractions from Copernicus DEM GLO-30 or municipal LiDAR survey rasters.
2. **Drainage Infrastructure GIS:**  
   Connect Ahmedabad Municipal Corporation (AMC) storm water network GeoJSON to derive `capacity_index` from pipe diameter and slope.
3. **Observed Rain Gauge Telemetry:**  
   Swap or augment Open-Meteo with IMD automated weather station (AWS) feeds.
4. **Historical Flooding Registry:**  
   Ingest monsoon distress call logs (AMC 155303 call center data).

---
## 6. Known Limitations & Future Roadmap

- **Current Limitations:** Heuristic screening without hydraulic backwater modeling; manual approval required for SMS/WhatsApp distribution.
- **Roadmap:**
  - Automated Copernicus DEM ingestion pipeline.
  - Integration with GMRC Operations Control Center (OCC) SCADA alarms.
  - Automated SMS/WhatsApp API gateway with 2FA supervisor approvals.
  - Real-time IoT ultrasonic sump depth gauge telemetry.
