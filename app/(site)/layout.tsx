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

  const css = `:root{--accent:${hex(s.theme.accent, "#ff5a1f")};--night:${hex(s.theme.dark, "#0e1512")};--paper:${hex(s.theme.paper, "#f4f1ea")};--radius:${Math.max(0, Math.min(60, Number(s.theme.radius) || 28))}px}`;
  const introScript = s.intro.enabled && s.intro.oncePerSession
    ? `try{if(sessionStorage.getItem("voyaj:intro")==="1"&&!/[?&]intro=1/.test(location.search))document.documentElement.dataset.introSeen="1"}catch(e){}`
    : "";

  return (
    <SiteProvider settings={s}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {introScript && <script dangerouslySetInnerHTML={{ __html: introScript }} />}
      <SmoothScroll />
      <ScrollProgress />
      <Intro />
      <Navbar index={index} />
      <main className="relative">{children}</main>
      <Footer settings={s} />
      <FloatingWhatsapp />
      <Cursor />
    </SiteProvider>
  );
}
