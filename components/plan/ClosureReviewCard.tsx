import { ClosureRecommendation } from "@/lib/schema";
import { AlertOctagon, CheckCircle2, Clock, Edit3, XCircle } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "../ui/Badge";
import { BentoCard } from "../ui/BentoCard";
import { RecessedInput } from "../ui/RecessedInput";
import { TactileButton } from "../ui/TactileButton";

interface ClosureReviewCardProps {
  rec: ClosureRecommendation;
  savedDecision?: {
    decision: "approved" | "modified" | "rejected";
    operatorName: string;
    note: string;
    timestamp: string;
  };
  onRecordDecision: (
    rec: ClosureRecommendation,
    decision: "approved" | "modified" | "rejected",
    operatorName: string,
    note: string
  ) => void;
}

export const ClosureReviewCard: React.FC<ClosureReviewCardProps> = ({
  rec,
  savedDecision,
  onRecordDecision,
}) => {
  const [operatorName, setOperatorName] = useState(savedDecision?.operatorName || "Duty Controller Patel");
  const [note, setNote] = useState(savedDecision?.note || "");
  const [isEditingNote, setIsEditingNote] = useState(false);

  const isDecided = Boolean(savedDecision);

  const handleAction = (decision: "approved" | "modified" | "rejected") => {
    onRecordDecision(rec, decision, operatorName, note);
    setIsEditingNote(false);
  };

  return (
    <BentoCard className="border-rose-300 bg-rose-50/20 shadow-sm relative overflow-hidden">
      {/* Top Warning Ribbon */}
      <div className="flex items-center justify-between pb-3 border-b border-rose-200/80 mb-3">
        <div className="flex items-center gap-2 text-rose-800">
          <AlertOctagon className="w-5 h-5 text-rose-600 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-wider font-bold">
            Operational Safety Advisory · Closure Protocol
          </span>
        </div>
        <Badge variant="simulated">SIMULATED SCREENING</Badge>
      </div>

      {/* Main Advisory Content */}
      <div className="space-y-3 mb-4">
        <div>
          <h4 className="text-base font-bold text-slate-900">
            Recommend operator review for closure: {rec.entranceLabel}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Station: <b>{rec.stationName}</b> · Risk: <b>{rec.score}/100</b> ({rec.low}–{rec.high})
          </p>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5 font-mono">
          <div>
            <span className="text-slate-400">Drivers: </span>
            <span>{rec.driversSummary}</span>
          </div>
          <div>
            <span className="text-slate-400">Suggested Alternate: </span>
            <span className="font-semibold text-emerald-700">{rec.suggestedAlternateEntrance}</span>
          </div>
          <div>
            <span className="text-slate-400">Peak Window: </span>
            <span>{rec.peakHourlyMm} mm/h expected around {rec.peakHour}</span>
          </div>
        </div>
      </div>

      {/* Decision Status Banner if already acted */}
      {isDecided && (
        <div
          className={`p-3 rounded-lg border mb-4 text-xs flex items-start gap-2.5 ${
            savedDecision?.decision === "approved"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : savedDecision?.decision === "modified"
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          {savedDecision?.decision === "approved" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : savedDecision?.decision === "modified" ? (
            <Edit3 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-bold uppercase tracking-wider block">
              Decision: {savedDecision?.decision}
            </span>
            <div className="text-[11px] font-mono">
              Signed: <b>{savedDecision?.operatorName}</b> ·{" "}
              {new Date(savedDecision?.timestamp || "").toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            {savedDecision?.note && (
              <div className="text-[11px] italic mt-1">&ldquo;{savedDecision.note}&rdquo;</div>
            )}
          </div>
        </div>
      )}

      {/* Operator Input and Decision Controls */}
      <div className="space-y-3 pt-2 border-t border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RecessedInput
            label="Operator Name (Mandatory Audit Sign)"
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
            placeholder="e.g. Shift Lead A. Shah"
          />
          <RecessedInput
            label="Operational Review Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Redirecting to Gate A with 2 staff stationed"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <TactileButton
            size="sm"
            variant="outline"
            onClick={() => handleAction("rejected")}
            className="text-xs"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Reject Closure
          </TactileButton>

          <TactileButton
            size="sm"
            variant="secondary"
            onClick={() => handleAction("modified")}
            className="text-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            Modify Conditions
          </TactileButton>

          <TactileButton
            size="sm"
            variant="primary"
            onClick={() => handleAction("approved")}
            className="text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approve Review Recommendation
          </TactileButton>
        </div>
      </div>
    </BentoCard>
  );
};
