import React from "react";

export interface RecessedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const RecessedInput: React.FC<RecessedInputProps> = ({
  label,
  hint,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-mono font-medium text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg bg-slate-100/70 border border-slate-300/80 px-3.5 py-2 text-slate-900 text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 focus:bg-white transition-all ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
};

export interface RecessedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const RecessedTextarea: React.FC<RecessedTextareaProps> = ({
  label,
  hint,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-mono font-medium text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full rounded-lg bg-slate-100/70 border border-slate-300/80 px-3.5 py-2 text-slate-900 text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 focus:bg-white transition-all resize-y ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
};
