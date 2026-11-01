import { getDB } from "@/lib/db";
import { SiteProvider } from "@/components/site/SiteContext";
import SmoothScroll from "@/components/site/SmoothScroll";
import Intro from "@/components/site/Intro";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import Cursor from "@/components/site/Cursor";
import ScrollProgress from "@/components/site/ScrollProgress";
import FloatingWhatsapp from "@/components/site/FloatingWhatsapp";
import type { SpotItem } from "@/components/site/Spotlight";
import { PRESETS, PRESET_FONTS, isDark, onColor } from "@/lib/presets";

export const dynamic = "force-dynamic";

const hex = (v: string, f: string) => (/^#[0-9a-fA-F]{3,8}$/.test(v) ? v : f);

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const db = await getDB();
  const s = db.settings;

  const index: SpotItem[] = [
    ...db.tours.filter((t) => t.published).map((t) => ({ type: "Journey" as const, title: t.title, sub: `${t.days} days · ${t.category}`, href: `/tours/${t.slug}`, image: t.image })),
    ...db.destinations.map((d) => ({ type: "Destination" as const, title: d.name, sub: d.country, href: `/destinations/${d.slug}`, image: d.image })),
    ...db.posts.filter((p) => p.published).map((p) => ({ type: "Story" as const, title: p.title, sub: p.category, href: `/journal/${p.slug}`, image: p.cover })),
    ...s.nav.map((n) => ({ type: "Page" as const, title: n.label, sub: "Page", href: n.href, image: n.image })),
  ];

  const preset = PRESETS[s.theme.preset] ? s.theme.preset : "postcard";
  const P = PRESETS[preset];
  const paper = hex(s.theme.paper, P.paper);
  const accent = hex(s.theme.accent, P.accent);
  const night = hex(s.theme.dark, P.dark);
  const dark = isDark(paper);
  const ink = dark ? "#E6F1EE" : "#0B0C14";
  const fonts = PRESET_FONTS[preset];
  // Inside dark sections, "paper" means light text and "ink" dark text.
  const css = `:root{--accent:${accent};--night:${night};--paper:${paper};--ink:${ink};--sun:${P.sun};--on-accent:${onColor(accent)};--font-display:${fonts.display};--font-body:${fonts.body};--radius:${Math.max(0, Math.min(60, Number(s.theme.radius) || 0))}px;color-scheme:${dark ? "dark" : "light"}}
.bg-night{--paper:#F1F1EC;--ink:#0B0C10;--color-paper:#F1F1EC;--color-ink:#0B0C10}`;
  const introScript = s.intro.enabled && s.intro.oncePerSession
    ? `try{if(sessionStorage.getItem("voyaj:intro")==="1"&&!/[?&]intro=1/.test(location.search))document.documentElement.dataset.introSeen="1"}catch(e){}`
    : "";

  return (
    <SiteProvider settings={s}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {introScript && <script dangerouslySetInnerHTML={{ __html: introScript }} />}
      <div data-preset={preset} data-scheme={dark ? "dark" : "light"} className="contents">
        <SmoothScroll />
        <ScrollProgress />
        <Intro />
        <Navbar index={index} />
        <main className="relative">{children}</main>
        <Footer settings={s} />
        <FloatingWhatsapp />
        <Cursor />
      </div>
    </SiteProvider>
  );
}
