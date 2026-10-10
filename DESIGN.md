# Paperweight Tactile UI System — Design System Specification

## Overview
**NAGARSETU** uses the **Paperweight Tactile UI System**. The interface evokes tactile physical stationery, precision engineering blueprints, embossed paper cards, and physical console status instruments with physical press and lighting feedback.

Active Accent: **Ink Emerald (`#059669`)**  
Canvas Background: **Warm Off-White (`#FAFAFA` / `bg-slate-50/50`)**  
Elevated Surfaces: **Pure White (`#FFFFFF`) with layered drop shadows and top bevel highlight**

---

## 1. Core Visual Tokens & CSS Variables

### Palette
- **Canvas / Background**: `#FAFAFA` (`bg-slate-50/50`)
- **Card Background**: `#FFFFFF` (`bg-white`)
- **Recessed Well Background**: `#F1F5F9` (`bg-slate-100/70`)
- **Hairline Borders**: `border-slate-200/90` or `border-slate-300/80`
- **Text Primary**: `#0F172A` (`text-slate-900`)
- **Text Secondary / Muted**: `#475569` (`text-slate-600`)
- **Accent Emerald (Active/Safe)**: `#059669` (`text-emerald-700`, `bg-emerald-600`)
- **Warning / Medium Risk**: `#D97706` (`text-amber-700`, `bg-amber-500`)
- **Severe / High Risk**: `#E11D48` (`text-rose-700`, `bg-rose-600`)
- **Info / Cached**: `#475569` (`text-slate-700`, `bg-slate-500`)

### Tactile Depth Architecture
1. **Layered Depth**:
   - Elevated cards use `shadow-[0_4px_12px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]` combined with an inner top bevel highlight: `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]`.
2. **Carved / Etched Recessed Wells** (for inputs, tracks, containers):
   - `shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(0,0,0,0.03)]`
3. **Press Physics**:
   - Interactive elements shift down and scale subtly on active press: `active:scale-[0.98] transition-all duration-150`.
4. **Blueprint Graph Grid**:
   - Subtle graph grid background texture:
     `bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:32px_32px]`

---

## 2. Component Class Recipes

### `TactileButton`
- **Primary**:
  `inline-flex items-center justify-center font-medium px-4 py-2 rounded-lg bg-emerald-600 text-white shadow-[0_2px_4px_rgba(5,150,105,0.3),inset_0_1px_0_0_rgba(255,255,255,0.3)] hover:bg-emerald-700 active:scale-[0.98] border border-emerald-700/80 transition-all focus-visible:outline-2 focus-visible:outline-emerald-500`
- **Secondary / White**:
  `inline-flex items-center justify-center font-medium px-4 py-2 rounded-lg bg-white text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.9)] hover:bg-slate-50 active:scale-[0.98] border border-slate-200/90 transition-all focus-visible:outline-2 focus-visible:outline-emerald-500`
- **Outline / Ghost**:
  `inline-flex items-center justify-center font-medium px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-slate-200/80 transition-all active:scale-[0.98]`

### `BentoCard`
- `bg-white rounded-xl border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_0_rgba(255,255,255,0.7)] p-6 transition-transform duration-200 hover:-translate-y-0.5`

### `RecessedInput` & `RecessedTextarea`
- `w-full rounded-lg bg-slate-100/70 border border-slate-300/80 px-3.5 py-2 text-slate-900 text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 focus:bg-white transition-all`

### `SegmentedControl`
- Track: `p-1 bg-slate-200/70 rounded-lg inline-flex gap-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border border-slate-300/50`
- Active Tab: `bg-white text-slate-900 shadow-[0_2px_4px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.9)] rounded-md font-medium text-xs px-3 py-1.5 transition-all`
- Inactive Tab: `text-slate-600 hover:text-slate-900 text-xs font-medium px-3 py-1.5 rounded-md transition-all hover:bg-white/40`

### `ToggleSwitch`
- Track (Carved): `w-11 h-6 rounded-full transition-colors relative cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]`
  - Unchecked: `bg-slate-300`
  - Checked: `bg-emerald-600`
- Knob (Paper Knob): `w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.9)] transition-transform duration-150`

### `Checkbox`
- `w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 focus:ring-2 cursor-pointer transition-all`

### `Badge` & `Kbd`
- `SIMULATED`: `bg-amber-50 text-amber-800 border border-amber-300/80 px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-semibold shadow-xs`
- `LIVE`: `bg-emerald-50 text-emerald-800 border border-emerald-300/80 px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-semibold shadow-xs`
- `CACHED`: `bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-medium shadow-xs`
- `INCOMPLETE`: `bg-rose-50 text-rose-800 border border-rose-300 px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-bold shadow-xs`
- `Kbd`: `px-1.5 py-0.5 text-xs font-mono font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.15)]`

### `RiskLamp` (Tactile Status Lamp)
- Inset tactile circle with center light and top highlight:
  - Low: `w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.2)] border border-emerald-600`
  - Medium: `w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.2)] border border-amber-600`
  - High: `w-3 h-3 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.2)] border border-rose-700 animate-pulse`
