import React from "react";

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd: React.FC<KbdProps> = ({ children, className = "" }) => {
  return (
    <kbd
      className={`px-1.5 py-0.5 text-xs font-mono font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.15)] ${className}`}
    >
      {children}
    </kbd>
  );
};
