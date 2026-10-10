import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NAGARSETU — Monsoon Mode Prototype | Metro Hacks PS-12",
  description:
    "Station-specific 24-hour monsoon readiness plan for Ahmedabad Metro. Heuristic risk screening, entrance closures review, pump deployment, and multilingual commuter advisories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-slate-50/50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
