import React from "react";

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  }[size];

  const variantStyles = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700/80 shadow-[0_2px_4px_rgba(5,150,105,0.3),inset_0_1px_0_0_rgba(255,255,255,0.3)] focus-visible:outline-emerald-500",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.9)] focus-visible:outline-emerald-500",
    outline:
      "bg-transparent hover:bg-slate-100/70 text-slate-700 border border-slate-300/80 hover:border-slate-400 focus-visible:outline-emerald-500",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white border border-rose-700/80 shadow-[0_2px_4px_rgba(225,29,72,0.3),inset_0_1px_0_0_rgba(255,255,255,0.3)] focus-visible:outline-rose-500",
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
