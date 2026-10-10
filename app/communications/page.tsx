"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { BentoCard } from "@/components/ui/BentoCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TactileButton } from "@/components/ui/TactileButton";
import { generateCommuterMessage, MessageChannel, MessageLanguage } from "@/lib/messages";
import { calculateStationRollupRisk } from "@/lib/risk";
import { useAppStore } from "@/lib/store";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Languages,
  Megaphone,
  MessageCircle,
  Radio,
  Share2,
} from "lucide-react";
import React, { useMemo, useState } from "react";

export default function CommunicationsPage() {
  const { stations, forecast, thresholds } = useAppStore();

  const [selectedStationId, setSelectedStationId] = useState<string>("kalupur");
  const [selectedEntranceId, setSelectedEntranceId] = useState<string>("");
  const [channel, setChannel] = useState<MessageChannel>("whatsapp");
  const [language, setLanguage] = useState<MessageLanguage>("gu"); // default Gujarati for local passenger clarity
  const [copied, setCopied] = useState(false);

  const currentStation = useMemo(() => {
    return stations.find((s) => s.id === selectedStationId) || stations[0];
  }, [stations, selectedStationId]);

  const rollup = useMemo(() => {
    if (!currentStation) return null;
    return calculateStationRollupRisk(currentStation, forecast.data, thresholds);
  }, [currentStation, forecast.data, thresholds]);

  // Set default entrance when station changes
  const activeEntrance = useMemo(() => {
    if (!currentStation) return null;
    if (selectedEntranceId) {
      const match = currentStation.entrances.find((e) => e.id === selectedEntranceId);
      if (match) return match;
    }
    // Default to highest risk entrance
    const highEntId = rollup?.highestRiskEntranceId || currentStation.entrances[0]?.id;
    return currentStation.entrances.find((e) => e.id === highEntId) || currentStation.entrances[0];
  }, [currentStation, selectedEntranceId, rollup]);

  const alternateEntrance = useMemo(() => {
    if (!currentStation || !activeEntrance) return "Elevated Concourse";
    const others = currentStation.entrances.filter((e) => e.id !== activeEntrance.id);
    return others[0]?.label || "Adjacent Plaza Concourse";
  }, [currentStation, activeEntrance]);

  const entRiskResult = useMemo(() => {
    if (!rollup || !activeEntrance) return null;
    return rollup.entranceResults.find((r) => r.entranceId === activeEntrance.id);
  }, [rollup, activeEntrance]);

  const message = useMemo(() => {
    if (!currentStation || !activeEntrance) return null;

    const validityWindow = `Next 6 hours (Peak ${rollup?.peakHour || "18:00"})`;

    return generateCommuterMessage(
      {
        stationName: currentStation.name,
        entranceLabel: activeEntrance.label,
        alternateEntranceLabel: alternateEntrance,
        validityWindow,
        riskBand: entRiskResult?.band || "Medium",
        peakRainMm: entRiskResult?.peakHourlyMm || 25,
      },
      channel,
      language
    );
  }, [currentStation, activeEntrance, alternateEntrance, rollup, entRiskResult, channel, language]);

  const handleCopy = () => {
    if (!message) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!message) return;
    const blob = new Blob([message.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nagarsetu-${currentStation.id}-${channel}-${language}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const channelOptions: { value: MessageChannel; label: string; icon: React.ReactNode }[] = [
    { value: "whatsapp", label: "WhatsApp Broadcast", icon: <MessageCircle className="w-4 h-4" /> },
    { value: "pa", label: "Station PA Audio", icon: <Megaphone className="w-4 h-4" /> },
    { value: "notice", label: "Notice Board Bulletin", icon: <Radio className="w-4 h-4" /> },
    { value: "social", label: "Social / SMS Post", icon: <Share2 className="w-4 h-4" /> },
  ];

  const languageOptions = [
    { value: "gu", label: "ગુજરાતી (Gujarati)" },
    { value: "hi", label: "हिन्दी (Hindi)" },
    { value: "en", label: "English" },
  ];

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400">
              SPEC · COMMUTER COMMUNICATIONS
            </span>
            <Badge variant="simulated">TEMPLATE DRAFTS</Badge>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Multilingual Commuter Advisory Generator
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Dispatch urgent passenger transit advisories across 4 broadcast channels in English, Gujarati, and Hindi.
          </p>
        </div>

        {/* Translation Draft Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <b>Translation draft:</b> Pre-approved local phrasing templates. Please verify with a fluent speaker before public dispatch.
            </span>
          </div>
          <Badge variant="cached" className="shrink-0 text-[10px]">
            HUMAN SIGN-OFF REQUIRED
          </Badge>
        </div>

        {/* Main 12-Col Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Station & Entrance Pickers */}
            <BentoCard className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 uppercase tracking-wider mb-2">
                  1. Target Metro Station
                </label>
                <select
                  value={selectedStationId}
                  onChange={(e) => {
                    setSelectedStationId(e.target.value);
                    setSelectedEntranceId("");
                  }}
                  className="w-full rounded-lg bg-slate-100 border border-slate-300 px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 uppercase tracking-wider mb-2">
                  2. Ingress Entrance Under Advisory
                </label>
                <select
                  value={activeEntrance?.id || ""}
                  onChange={(e) => setSelectedEntranceId(e.target.value)}
                  className="w-full rounded-lg bg-slate-100 border border-slate-300 px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  {currentStation.entrances.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                  Alternate recommendation: {alternateEntrance}
                </span>
              </div>

              {/* Station Risk Lamp summary */}
              {entRiskResult && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-600 font-mono">Assigned Entrance Risk:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">
                      {entRiskResult.score}/100
                    </span>
                    <Badge
                      variant={
                        entRiskResult.band === "High"
                          ? "high"
                          : entRiskResult.band === "Medium"
                          ? "medium"
                          : "low"
                      }
                      className="text-[10px]"
                    >
                      {entRiskResult.band}
                    </Badge>
                  </div>
                </div>
              )}
            </BentoCard>

            {/* Language Selector */}
            <BentoCard className="p-5 space-y-3">
              <label className="block text-xs font-mono font-medium text-slate-700 uppercase tracking-wider">
                3. Advisory Language
              </label>
              <div className="w-full">
                <SegmentedControl<MessageLanguage>
                  value={language}
                  onChange={setLanguage}
                  options={languageOptions as any}
                  className="w-full justify-between"
                />
              </div>
            </BentoCard>

            {/* Broadcast Channel Selector */}
            <BentoCard className="p-5 space-y-3">
              <label className="block text-xs font-mono font-medium text-slate-700 uppercase tracking-wider">
                4. Distribution Channel
              </label>
              <div className="space-y-2">
                {channelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setChannel(opt.value)}
                    className={`w-full p-3 rounded-lg border text-left flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                      channel === opt.value
                        ? "bg-emerald-50/70 border-emerald-600 text-emerald-950 font-bold shadow-xs"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={channel === opt.value ? "text-emerald-700" : "text-slate-500"}>
                        {opt.icon}
                      </span>
                      <span>{opt.label}</span>
                    </div>
                    {channel === opt.value && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Right Preview Card (7 cols) */}
          <div className="lg:col-span-7">
            <BentoCard className="p-6 h-full flex flex-col justify-between space-y-6">
              <div>
                {/* Header with Character Counter */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-slate-400">
                      LIVE BROADCAST PREVIEW
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {channelOptions.find((c) => c.value === channel)?.label}
                    </h3>
                  </div>

                  {message && message.charLimit && (
                    <div className="text-right">
                      <span
                        className={`text-xs font-mono font-bold ${
                          message.isWithinLimit ? "text-slate-700" : "text-rose-600"
                        }`}
                      >
                        {message.charCount} / {message.charLimit} chars
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400">
                        {message.isWithinLimit ? "Within SMS/WhatsApp limits" : "Exceeds limit!"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Simulated Device Screen Well */}
                <div className="mt-4 p-5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed shadow-inner border border-slate-800 whitespace-pre-wrap select-all">
                  {message?.text}
                </div>

                {/* Regulatory Footnote in Preview */}
                <div className="mt-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Translation draft · Verify before publication</span>
                  <span>Ahmedabad Metro OCC Dispatch</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-mono">
                  {copied ? (
                    <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Copied to clipboard!
                    </span>
                  ) : (
                    "Ready to distribute"
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <TactileButton size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="w-3.5 h-3.5" />
                    Download .TXT
                  </TactileButton>

                  <TactileButton size="sm" variant="primary" onClick={handleCopy}>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Advisory Text
                  </TactileButton>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
