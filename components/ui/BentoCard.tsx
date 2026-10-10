import React from "react";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = "",
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_0_rgba(255,255,255,0.8)] p-6 transition-all duration-200 ${
        interactive ? "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
