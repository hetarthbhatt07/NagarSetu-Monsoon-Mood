import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  id,
}) => {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label
      htmlFor={switchId}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)] border border-slate-300/40 focus-visible:outline-2 focus-visible:outline-emerald-500 cursor-pointer ${
          checked ? "bg-emerald-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-[0_2px_4px_rgba(0,0,0,0.22),inset_0_1px_0_0_rgba(255,255,255,0.95)] transition-transform duration-150 ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
      {label && <span className="text-xs font-mono font-medium text-slate-700">{label}</span>}
    </label>
  );
};
