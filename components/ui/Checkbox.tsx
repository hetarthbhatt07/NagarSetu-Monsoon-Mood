import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  className = "",
  id,
  ...props
}) => {
  return (
    <label className="inline-flex items-start gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className={`w-4 h-4 mt-0.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 focus:ring-2 cursor-pointer transition-all ${className}`}
        {...props}
      />
      {label && <div className="text-sm text-slate-800 leading-snug">{label}</div>}
    </label>
  );
};
