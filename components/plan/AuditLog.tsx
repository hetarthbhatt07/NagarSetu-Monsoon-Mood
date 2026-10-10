import { AuditLogEntry } from "@/lib/schema";
import { History, ShieldAlert } from "lucide-react";
import React from "react";
import { Badge } from "../ui/Badge";

interface AuditLogProps {
  entries: AuditLogEntry[];
  stationId?: string;
}

export const AuditLog: React.FC<AuditLogProps> = ({ entries, stationId }) => {
  const filtered = stationId
    ? entries.filter((e) => e.stationId === stationId)
    : entries;

  if (filtered.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-mono">
        No operational closure reviews recorded yet. Decisions will be immutably signed here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-600 uppercase">
          <History className="w-3.5 h-3.5" />
          <span>Operational Audit Trail ({filtered.length})</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">PERSISTED IN STORAGE</span>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-xl bg-white overflow-hidden shadow-xs">
        {filtered.map((entry) => (
          <div key={entry.id} className="p-3.5 hover:bg-slate-50/70 transition-colors space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    entry.action === "Approve"
                      ? "live"
                      : entry.action === "Modify"
                      ? "medium"
                      : "high"
                  }
                  className="text-[10px]"
                >
                  {entry.action}
                </Badge>
                <span className="text-xs font-bold text-slate-800">
                  {entry.operatorName}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({entry.entranceId})
                </span>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                {new Date(entry.timestamp).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>

            <p className="text-xs text-slate-600 pl-1">{entry.note}</p>

            <div className="text-[10px] font-mono text-slate-400 pl-1">
              Risk at decision: {entry.riskSnapshot.score}/100 ({entry.riskSnapshot.band})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
