import { AlertTriangle, ShieldCheck } from "lucide-react";
import React from "react";
import { Badge } from "../ui/Badge";

export const DisclaimerFooter: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 py-6 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs font-medium text-slate-200">
              Preparedness prototype. Not a validated flood-prediction system. Not an authority for
              entrance closures. Operator review required.
            </p>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Forecast rainfall ≠ predicted water depth. All drainage, DEM elevation, blockage and
            incident histories are SIMULATED for hackathon demonstration.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="simulated" className="text-[10px]">
            SIMULATED INPUTS
          </Badge>
          <span className="text-xs text-slate-500 font-mono">Metro Hacks PS-12</span>
        </div>
      </div>
    </footer>
  );
};
