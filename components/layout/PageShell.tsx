"use client";

import { useAppStore } from "@/lib/store";
import React, { useEffect } from "react";
import { CommandPalette } from "../ui/CommandPalette";
import { DisclaimerFooter } from "./DisclaimerFooter";
import { Header } from "./Header";
import { SettingsDrawer } from "./SettingsDrawer";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({
  children,
  className = "",
}) => {
  const { loadInitialData } = useAppStore();

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col relative antialiased selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Blueprint Grid Texture */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

      {/* Global Header */}
      <Header />

      {/* Main Page Area */}
      <main className={`flex-1 ${className}`}>{children}</main>

      {/* Persistent Disclaimer Footer */}
      <DisclaimerFooter />

      {/* Global Modals & Drawers */}
      <CommandPalette />
      <SettingsDrawer />
    </div>
  );
};
