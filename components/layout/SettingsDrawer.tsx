import { useAppStore } from "@/lib/store";
import { AlertCircle, RotateCcw, Save, Sliders } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "../ui/Badge";
import { Drawer } from "../ui/Drawer";
import { RecessedInput } from "../ui/RecessedInput";
import { TactileButton } from "../ui/TactileButton";

export const SettingsDrawer: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen, thresholds, updateThresholds, resetThresholds } =
    useAppStore();

  const [watchIntensity, setWatchIntensity] = useState(
    thresholds.rain_intensity_mm_per_h.watch.toString()
  );
  const [alertIntensity, setAlertIntensity] = useState(
    thresholds.rain_intensity_mm_per_h.alert.toString()
  );
  const [severeIntensity, setSevereIntensity] = useState(
    thresholds.rain_intensity_mm_per_h.severe.toString()
  );

  const [watch24h, setWatch24h] = useState(thresholds.rain_24h_mm.watch.toString());
  const [alert24h, setAlert24h] = useState(thresholds.rain_24h_mm.alert.toString());
  const [severe24h, setSevere24h] = useState(thresholds.rain_24h_mm.severe.toString());

  const handleSave = () => {
    updateThresholds({
      ...thresholds,
      rain_intensity_mm_per_h: {
        watch: Number(watchIntensity) || 10,
        alert: Number(alertIntensity) || 25,
        severe: Number(severeIntensity) || 50,
      },
      rain_24h_mm: {
        watch: Number(watch24h) || 50,
        alert: Number(alert24h) || 100,
        severe: Number(severe24h) || 150,
      },
    });
    setSettingsOpen(false);
  };

  const handleReset = () => {
    resetThresholds();
    setWatchIntensity("10");
    setAlertIntensity("25");
    setSevereIntensity("50");
    setWatch24h("50");
    setAlert24h("100");
    setSevere24h("150");
  };

  return (
    <Drawer
      isOpen={isSettingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="System Settings & Thresholds"
      subtitle="OPERATOR CONFIGURATION · SIMULATED"
      width="md"
    >
      <div className="space-y-6">
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200/90 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Assumed Operational Parameters</span>
          </div>
          <p className="text-[11px] text-amber-800/90">
            Threshold values below are illustrative presets. In production, these must be replaced
            with official IMD alerts and metro engineering manuals.
          </p>
        </div>

        {/* Rain Intensity (mm/h) */}
        <div>
          <div className="text-xs font-mono font-medium text-slate-700 uppercase tracking-wider mb-2">
            Rain Intensity Triggers (mm / hour)
          </div>
          <div className="space-y-3">
            <RecessedInput
              label="Watch Level (mm/h)"
              value={watchIntensity}
              onChange={(e) => setWatchIntensity(e.target.value)}
              type="number"
            />
            <RecessedInput
              label="Alert Level (mm/h)"
              value={alertIntensity}
              onChange={(e) => setAlertIntensity(e.target.value)}
              type="number"
            />
            <RecessedInput
              label="Severe Level (mm/h)"
              value={severeIntensity}
              onChange={(e) => setSevereIntensity(e.target.value)}
              type="number"
            />
          </div>
        </div>

        {/* 24-Hour Accumulated Rain (mm) */}
        <div>
          <div className="text-xs font-mono font-medium text-slate-700 uppercase tracking-wider mb-2">
            24h Total Rain Accumulation (mm)
          </div>
          <div className="space-y-3">
            <RecessedInput
              label="Watch Level (24h mm)"
              value={watch24h}
              onChange={(e) => setWatch24h(e.target.value)}
              type="number"
            />
            <RecessedInput
              label="Alert Level (24h mm)"
              value={alert24h}
              onChange={(e) => setAlert24h(e.target.value)}
              type="number"
            />
            <RecessedInput
              label="Severe Level (24h mm)"
              value={severe24h}
              onChange={(e) => setSevere24h(e.target.value)}
              type="number"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <TactileButton size="sm" variant="outline" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </TactileButton>

          <TactileButton size="sm" variant="primary" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </TactileButton>
        </div>
      </div>
    </Drawer>
  );
};
