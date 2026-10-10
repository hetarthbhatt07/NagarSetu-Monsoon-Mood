# NAGARSETU — Monsoon Mode Prototype (Metro Hacks PS-12)

> Paste this whole file into Antigravity as the build prompt. Also place the attached `DESIGN.md` (Paperweight Tactile UI System) in the project root; it is the UI source of truth.

---

## 0. Role & Mission

You are a senior full-stack engineer and product designer. Build a **polished, demo-ready, 2-hour-scope prototype** called **NAGARSETU** ("city bridge") for **Metro Hacks, Problem Statement PS-12: Monsoon Mode**.

**Problem (from the brief):** Heavy rain and waterlogging disrupt Metro station entrances, approach roads and parking areas. Operators want a **station-specific 24-hour readiness plan**, including possible entrance closures, pump placement and commuter communication.

**What NAGARSETU does:** For each sample Ahmedabad Metro station, it takes a 24-hour rainfall forecast (live from Open-Meteo, with an offline cached fallback), combines it with site vulnerability inputs (low points, drainage, surface, history), computes a transparent **screening risk score** per entrance and approach road, and generates a **24-hour readiness plan**: trigger thresholds, checklist, pump/staff placement, possible entrance-closure *recommendations for operator review*, and multilingual commuter messages (English / Gujarati / Hindi).

---

## 1. Honesty & Safety Rules (NON-NEGOTIABLE)

These are product requirements, not footnotes. They must be visible in the UI.

1. **Forecast rainfall ≠ predicted water depth.** Never display a water-depth prediction. Show rainfall (mm/h, mm/24h) and a *screening risk score* only.
2. **This is a preparedness prototype, not a validated flood warning system.** Show a persistent banner/footer: *"Preparedness prototype. Not a validated flood-prediction system. Not an authority for entrance closures. Operator review required."*
3. **All drainage, elevation, history and threshold data is SIMULATED** unless explicitly sourced. Every simulated value must carry a `SIMULATED` badge and a "data quality" tag (`measured` / `simulated` / `assumed`).
4. **Closure outputs are phrased as "Recommend operator review for closure"**, never "Close entrance". Include an approval step (Approve / Modify / Reject) with an operator name field and timestamp in the audit log.
5. Show **uncertainty** (a low–high band on the risk score) and an **"Evidence used"** panel for each recommended action.
6. If an input is missing, mark the result `INCOMPLETE` instead of inventing a value.
7. Gujarati/Hindi messages are **template drafts**; show label *"Translation draft, verify with a fluent speaker before publishing."*

---

## 2. Tech Stack (use exactly this unless blocked)

- **Next.js 14+ (App Router) + TypeScript + Tailwind CSS** (per DESIGN.md)
- **Leaflet + react-leaflet** with OpenStreetMap tiles for the map (`dynamic` import, `ssr: false`). Add a plain-SVG fallback map if tiles fail to load (offline-safe).
- **Recharts** for the rainfall chart and risk-over-time chart
- **Open-Meteo Forecast API** (no key needed) for hourly `precipitation`, `precipitation_probability`, `rain`, `temperature_2m`. Cache last successful response in `localStorage` and ship a bundled `data/sample-forecast.json` fallback with a visible "Using cached/sample forecast" badge.
- **Zustand** (or React context) for state; **Zod** for data validation
- **lucide-react** icons; **jsPDF + html2canvas** (or `window.print()` print stylesheet) for exporting the plan
- No backend required. All logic runs client-side. Data lives in `/data/*.json`.

---

## 3. Design System: Paperweight Tactile UI (follow DESIGN.md strictly)

Read `DESIGN.md` first and implement it as shared components in `/components/ui`. Active accent: **Ink Emerald `#059669`**.

**Global rules**
- Never render plain flat UI: every component needs layered depth, a top bevel highlight (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]`), recessed "etched" wells for inputs, and hairline borders (`border-slate-200/90`).
- Canvas is warm off-white `#FAFAFA` (`bg-slate-50/50`); pure white `#FFFFFF` only for elevated cards/panels.
- All interactive controls have press physics: `active:scale-[0.98]`.
- All interactive elements have `focus-visible:outline-2` focus states and ARIA labels.
- Consistent spacing: `gap-4`, `p-6`, `rounded-xl`.
- Text: primary `#0F172A`, secondary `#475569`. Use `font-mono` for data labels, spec tags, timestamps and kbd hints.

**Page shell (every page)**
```tsx
<div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col relative">
  <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />
  {/* header, main grid, footer disclaimer */}
</div>
```

**Layout:** Bento 12-col grid, `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-6`; main workbench `md:col-span-2`, sidebar for controls.

**Components to build (copy the exact class recipes from DESIGN.md):**
1. `TactileButton` (primary emerald, secondary/outline variants)
2. `RecessedInput`, `RecessedTextarea` (etched wells; focus ring emerald/20)
3. `BentoCard` (hover lift `-translate-y-1`)
4. `SegmentedControl` (carved track + elevated active tab), used for scenario switching
5. `ToggleSwitch` (carved track, paper knob)
6. `Checkbox` (emerald), used in the readiness checklist
7. `Badge` + `Kbd`: variants for `SIMULATED` (amber), `LIVE` (emerald), `CACHED` (slate), `INCOMPLETE` (rose)
8. `CommandPalette` (⌘K) to jump to a station / switch scenario / export plan

**Risk colour language** (also add text labels; never rely on colour alone): Low = emerald, Medium = amber, High = rose. Render these as tactile "status lamps" (small inset circles with a highlight).

**Tone:** editorial, calm, blueprint/stationery feel. Headings bold slate-900; section labels in small uppercase mono like `SPEC · STATION RISK`.

---

## 4. Data (all in `/data`, typed with Zod)

### 4.1 `stations.json` (5 sample stations; coordinates approximate and must be verified)
| id | name | lat | lng | note |
|---|---|---|---|---|
| kalupur | Kalupur Railway Station | 23.0258 | 72.6015 | dense old-city, underground |
| sabarmati | Sabarmati (Riverfront side) | 23.0850 | 72.5850 | near river |
| vastral | Vastral Gam | 23.0190 | 72.6670 | east end, depot side |
| thaltej | Thaltej Gam | 23.0590 | 72.5070 | west corridor |
| motera | Motera Stadium | 23.0916 | 72.5970 | event-day crowds |

Each station has:
```ts
{
  id, name, lat, lng,
  entrances: [{ id, label, lat, lng, elevation_m, elevation_quality: "simulated",
                surface: "paved"|"mixed"|"unpaved", low_point_depth_cm: number /* simulated */,
                approach_road: string, has_electrical_room_nearby: boolean }],
  drainage: { capacity_index: 0-1 /* simulated */, blockage_risk: 0-1 /* simulated */, quality: "simulated" },
  history: { known_waterlogging_points: number, last_event_note: string, quality: "simulated" },
  parking: { present: boolean, low_lying: boolean },
  assets: { electrical_room: string, pump_candidate_points: [{id,label,lat,lng}] }
}
```
Create 2–3 entrances per station with plausible but clearly SIMULATED values. Mark Sabarmati and Kalupur as higher vulnerability so the demo shows variety.

### 4.2 `thresholds.json` (all `assumed`, editable in a Settings drawer)
```json
{
  "rain_intensity_mm_per_h": { "watch": 10, "alert": 25, "severe": 50 },
  "rain_24h_mm": { "watch": 50, "alert": 100, "severe": 150 },
  "risk_bands": { "low": [0, 35], "medium": [35, 65], "high": [65, 100] },
  "disclaimer": "Illustrative thresholds. Replace with operator/IMD-approved values."
}
```

### 4.3 `sample-forecast.json`
Bundle a realistic 48-hour hourly forecast fixture (precipitation mm, probability %) for offline fallback.

### 4.4 Scenario presets (override the forecast when selected)
- **Live forecast** (Open-Meteo, default)
- **Low**: ≤ 5 mm/h peak, ~20 mm / 24h
- **Medium**: ~20 mm/h peak, ~80 mm / 24h
- **High**: ~55 mm/h peak, ~180 mm / 24h (a burst between 17:00 and 20:00 to overlap evening peak)

---

## 5. Risk Engine (`/lib/risk.ts`), transparent and unit-tested

Implement a pure, deterministic function. Do NOT use an ML model.

**Inputs per entrance:** rainfall series (hourly), entrance data, station drainage, history, parking flag.

**Step 1: Rain hazard (0–100):**
```
intensityScore = clamp(peak_hourly_mm / severe_intensity * 100)
volumeScore    = clamp(sum_24h_mm / severe_24h * 100)
rainHazard     = 0.55 * intensityScore + 0.45 * volumeScore
```

**Step 2: Site vulnerability (0–100):**
```
lowPointScore  = clamp(low_point_depth_cm / 40 * 100)     // simulated
drainageDeficit= (1 - capacity_index) * 60 + blockage_risk * 40
historyScore   = clamp(known_waterlogging_points * 20)
surfaceScore   = paved:70 | mixed:50 | unpaved:30         // runoff proxy
vulnerability  = 0.35*lowPointScore + 0.30*drainageDeficit + 0.20*historyScore + 0.15*surfaceScore
```

**Step 3: Combined entrance risk:**
```
risk = clamp(0.5 * rainHazard + 0.5 * vulnerability)
if (hasElectricalRoomNearby) risk = min(100, risk + 5)   // flag separately as "electrical exposure"
```

**Step 4: Uncertainty band:** `±` width = 8 + (100 − forecastProbabilityAvg)/5 + (any simulated input ? 7 : 0). Return `{score, low, high, band, confidence: "low"|"medium"}`. Confidence is NEVER "high" while inputs are simulated.

**Step 5: Per-hour risk curve** across the next 24h (use hourly rain intensity with a 3-hour rolling accumulation), so the UI can show *when* risk peaks.

**Step 6: Station rollup** = max entrance risk, plus an approach-road risk (use `approach_road` + parking low-lying flag).

**Output per entrance:** `{ score, low, high, band, drivers: [{factor, contribution, quality}], peakHour, evidence: string[] }`. The `drivers` array powers an "Explain this score" breakdown (top 3 factors with contribution bars).

Add `risk.test.ts` with at least 5 tests (monotonic in rain, missing data → INCOMPLETE, band edges, uncertainty never "high" confidence when simulated).

---

## 6. Readiness Plan Generator (`/lib/plan.ts`)

Generate a **24-hour station readiness plan** split into phases, tied to trigger thresholds (not hard-coded times):

| Phase | Window | Example actions |
|---|---|---|
| **T-24h → T-12h  PREPARE** | before rain | Inspect and clear drains at listed entrances; test pumps; verify backup power; stage sandbags; brief staff roster |
| **T-12h → T-3h  POSITION** | approaching peak | Place pumps at *pump_candidate_points* with highest-risk entrance first; protect electrical room (raise/seal); stage staff at high-risk entrances; pre-publish alerts |
| **T-3h → peak  ACTIVE** | peak window | Monitor entrances; hourly reading checks; use alternate-entrance messaging if medium+ |
| **Peak → T+6h  RECOVER** | after rain | Pump out, inspect electrical room, re-open after operator verification, log incidents |

Each action = `{ id, phase, text, owner_role, trigger, priority, evidence[] , status: "todo"|"done" }`. Triggers read like `"IF hourly rain ≥ 25 mm/h OR risk band = High at Entrance B"`.

**Closure recommendations:** only when an entrance risk band is High *or* risk high-bound ≥ 80. Output the card:
> **Recommend operator review: Entrance B**: risk 78 (70–86), drivers: low point (simulated), drainage deficit (simulated), forecast 52 mm/h at 18:00. Suggested alternate entrance: A. [Approve] [Modify] [Reject]

Approvals append to an **audit log** (who, when, decision, note), persisted in `localStorage`.

**Pump placement:** rank `pump_candidate_points` by proximity to the highest-risk entrance; show on the map with numbered pins.

---

## 7. Commuter Communication (`/lib/messages.ts`)

Templates (parameterised: station, entrance, alternate entrance, time window, risk band) in **English, Gujarati, Hindi**, for 4 channels:
1. **WhatsApp** (≤ 300 chars)
2. **Station PA announcement** (short, 2 sentences)
3. **Station notice board** (title + 3 bullets + validity)
4. **Social/short post** (≤ 160 chars)

Every message carries: validity window, station/entrance names, alternate route, *"Approved by: ____"* placeholder, and the `Translation draft` label. Provide Copy buttons and a language `SegmentedControl`. Use pre-written Gujarati/Hindi templates (no live translation API) and mark them for fluent-speaker review.

---

## 8. Screens / Information Architecture

Single Next.js app, routes:

### `/` — Command Overview (Dashboard)
- Header: NAGARSETU wordmark (etched stationery style), subtitle *"Monsoon readiness for Metro stations"*, `⌘K` kbd hint, data-status badges (`LIVE`/`CACHED`, `SIMULATED INPUTS`).
- **Scenario SegmentedControl:** Live · Low · Medium · High.
- **Map card (col-span-2):** Leaflet map with 5 station markers coloured by rollup risk band + label; click → station detail. Legend. Toggle layers (risk, entrances, pump points) with `ToggleSwitch`.
- **Sidebar:** 24h rainfall chart (Recharts bar + probability line), peak intensity/24h total stat tiles, and a ranked station list ("Highest risk first") with risk lamp + score + band.
- **Alerts strip:** Top 3 recommended actions across the network.

### `/station/[id]` — Station Readiness Workbench
- Station header with rollup risk, peak hour, confidence badge.
- **Entrance risk cards** (bento): score with uncertainty bar, band lamp, "Explain this score" drawer (driver bars + data-quality tags), `INCOMPLETE` state if inputs missing.
- **Risk-over-time chart** (24h) with threshold bands shaded.
- **Station mini-map** with entrances, approach roads, pump candidate pins, electrical room marker.
- **24-hour Readiness Plan:** phase timeline tabs (Segmented control) → checklist with `Checkbox`, owner role, trigger text, evidence chips; progress meter (X of N done).
- **Closure Review card(s)** with Approve/Modify/Reject and audit log.
- **Evidence panel:** list of every input used, its source, and quality tag.

### `/communications` — Commuter Messages
- Station + entrance picker, language SegmentedControl (EN/GU/HI), channel tabs, live-rendered message with character counter (WhatsApp 300 limit), Copy / Download .txt, translation-draft label.

### `/plan/[id]` or print view — One-page Export
- Clean printable station readiness brief: header, risk summary, top actions, closure reviews, pump map snapshot, disclaimer. "Export PDF" button.

### Settings drawer
- Edit thresholds, toggle "use simulated data" disclosure, reset demo data.

### Global
- `⌘K` Command Palette: "Go to station…", "Switch scenario…", "Export plan", "Open communications".
- Persistent disclaimer footer on all pages (see §1.2).
- Responsive: usable at 375px (stack bento grid, map first).

---

## 9. Offline / Resilience Requirements

- Fetch Open-Meteo on load for Ahmedabad (`latitude=23.0225&longitude=72.5714&hourly=precipitation,precipitation_probability,temperature_2m&forecast_days=2&timezone=Asia%2FKolkata`).
- On success → cache to `localStorage` with timestamp and show `LIVE` badge. On failure → use cache (`CACHED` + age) else bundled sample (`SAMPLE`).
- Map tiles: if tile load errors, show the SVG schematic fallback; app must remain fully functional.
- Audit log, checklist state, thresholds persist in `localStorage`.

---

## 10. File Structure

```
nagarsetu/
├─ DESIGN.md
├─ app/
│  ├─ layout.tsx, globals.css
│  ├─ page.tsx                      // overview
│  ├─ station/[id]/page.tsx
│  ├─ communications/page.tsx
│  └─ plan/[id]/page.tsx            // print view
├─ components/
│  ├─ ui/ (TactileButton, BentoCard, RecessedInput, SegmentedControl, ToggleSwitch, Checkbox, Badge, Kbd, CommandPalette, Drawer)
│  ├─ map/ (RiskMap, StationMiniMap, SvgFallbackMap)
│  ├─ charts/ (RainfallChart, RiskTimelineChart)
│  ├─ risk/ (RiskLamp, EntranceRiskCard, ExplainDrawer, UncertaintyBar)
│  ├─ plan/ (PhaseTabs, ChecklistItem, ClosureReviewCard, AuditLog)
│  └─ layout/ (PageShell, Header, DisclaimerFooter)
├─ lib/ (risk.ts, plan.ts, messages.ts, forecast.ts, store.ts, schema.ts, risk.test.ts)
├─ data/ (stations.json, thresholds.json, sample-forecast.json)
└─ README.md
```

---

## 11. Build Order (2-hour plan)

1. **0:00–0:15** Scaffold Next.js + Tailwind, port DESIGN.md tokens/components into `/components/ui`, page shell with blueprint grid.
2. **0:15–0:35** Data files + Zod schemas + forecast fetch/cache/fallback + scenario presets.
3. **0:35–1:00** Risk engine + tests; Explain drawer; uncertainty band.
4. **1:00–1:25** Overview map + station detail + charts.
5. **1:25–1:45** Readiness plan generator, closure review + audit log, pump placement.
6. **1:45–2:00** Communications templates, print/PDF export, ⌘K palette, disclaimers, README, polish.

If time runs short, cut in this order: PDF export → SVG map fallback → Settings drawer. Never cut disclaimers, SIMULATED badges, or the Explain drawer.

---

## 12. Acceptance Criteria (verify before finishing)

- [ ] App runs with `npm run dev`; no console errors; `npm run build` passes.
- [ ] Switching scenario Low → Medium → High visibly changes station risk lamps, scores, plan actions and closure recommendations.
- [ ] Disconnecting the network still renders everything (cached/sample forecast, schematic map fallback).
- [ ] Every simulated value shows a `SIMULATED` tag; confidence is never "high".
- [ ] No water-depth numbers anywhere; closures phrased as operator-review recommendations with Approve/Modify/Reject and audit log.
- [ ] Each risk score has an "Explain this score" breakdown and an Evidence panel.
- [ ] Messages render in EN/GU/HI across 4 channels with the translation-draft label and 300-char WhatsApp check.
- [ ] UI matches DESIGN.md: warm canvas, blueprint grid, bevel highlights, recessed inputs, press physics, emerald accent, visible focus states, ARIA labels.
- [ ] Works at 375px width and desktop.
- [ ] `risk.test.ts` passes (≥ 5 tests).
- [ ] README documents: what is real vs simulated, how the risk score is computed, how to plug in real drainage/DEM/history data, and known limitations.

---

## 13. Out of Scope

Live train control, real flood-depth modelling, user accounts/backend, real drainage GIS integration, and any claim of validated prediction. Mention a **future roadmap** in the README: Copernicus DEM-based entrance elevations, municipal drainage layers, verified flood-point history, IMD nowcast integration, SMS/WhatsApp publishing with approval workflow.

---

**Start now:** first read `DESIGN.md`, then scaffold the project and proceed in the build order above. After each milestone, run the app and fix errors before moving on. Finish by walking through the acceptance checklist and reporting any item not met.
