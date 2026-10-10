import { PlanAction } from "@/lib/schema";
import { UserCheck } from "lucide-react";
import React from "react";
import { Badge } from "../ui/Badge";
import { Checkbox } from "../ui/Checkbox";

interface ChecklistItemProps {
  action: PlanAction;
  isDone: boolean;
  onToggle: () => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  action,
  isDone,
  onToggle,
}) => {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-150 ${
        isDone
          ? "bg-slate-50/70 border-slate-200/60 opacity-60"
          : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <Checkbox
          checked={isDone}
          onChange={onToggle}
          id={`chk-${action.id}`}
        />

        <div className="flex-1 space-y-2">
          {/* Action text */}
          <div className="flex items-start justify-between gap-2">
            <label
              htmlFor={`chk-${action.id}`}
              className={`text-sm font-medium cursor-pointer leading-snug ${
                isDone ? "line-through text-slate-500" : "text-slate-900"
              }`}
            >
              {action.text}
            </label>

            <Badge
              variant={
                action.priority === "High"
                  ? "high"
                  : action.priority === "Medium"
                  ? "medium"
                  : "neutral"
              }
              className="text-[10px] shrink-0"
            >
              {action.priority}
            </Badge>
          </div>

          {/* Trigger specification */}
          <div className="p-2 rounded-md bg-slate-100/70 border border-slate-200/60 text-xs font-mono text-slate-700">
            <span className="text-emerald-700 font-bold">TRIGGER: </span>
            {action.trigger}
          </div>

          {/* Owner Role & Evidence Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <UserCheck className="w-3 h-3 text-slate-500" />
              <span>Owner: {action.owner_role}</span>
            </div>

            {action.evidence.map((ev, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60"
              >
                {ev}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
