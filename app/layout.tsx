import type { Metadata, Viewport } from "next";
import { Archivo, Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import { getSettings } from "@/lib/db";
import "./globals.css";

// One variable sans family with a width axis (62–125) — lets headlines
// mix condensed and expanded cuts, and animate between them.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", display: "swap" });
// Type pairings for the other design presets (see lib/presets.ts)
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["wdth", "opsz"], variable: "--font-bricolage", display: "swap" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-unbounded", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.seo.title, template: `%s — ${s.brand.name}` },
    description: s.seo.description,
    openGraph: { title: s.seo.title, description: s.seo.description, images: [s.hero.slides[0]?.image ?? ""] },
  };
}

export const viewport: Viewport = {
  themeColor: "#f1efea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable} ${bricolage.variable} ${instrumentSans.variable} ${unbounded.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
