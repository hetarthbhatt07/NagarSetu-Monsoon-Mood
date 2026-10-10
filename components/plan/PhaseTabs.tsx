import { SegmentedControl } from "@/components/ui/SegmentedControl";
import React from "react";

export type PhaseType = "ALL" | "PREPARE" | "POSITION" | "ACTIVE" | "RECOVER";

interface PhaseTabsProps {
  currentPhase: PhaseType;
  onChange: (phase: PhaseType) => void;
  counts: Record<PhaseType, number>;
}

export const PhaseTabs: React.FC<PhaseTabsProps> = ({
  currentPhase,
  onChange,
  counts,
}) => {
  return (
    <div className="overflow-x-auto pb-1">
      <SegmentedControl<PhaseType>
        value={currentPhase}
        onChange={onChange}
        options={[
          { value: "ALL", label: "All Phases", badge: `${counts.ALL}` },
          { value: "PREPARE", label: "T-24h Prepare", badge: `${counts.PREPARE}` },
          { value: "POSITION", label: "T-12h Position", badge: `${counts.POSITION}` },
          { value: "ACTIVE", label: "T-3h Active", badge: `${counts.ACTIVE}` },
          { value: "RECOVER", label: "Recover", badge: `${counts.RECOVER}` },
        ]}
      />
    </div>
  );
};
