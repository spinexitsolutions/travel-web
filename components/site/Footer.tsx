import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import Newsletter from "./Newsletter";
import { ArrowUpRight } from "./Icons";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const cols = [
    { title: "Explore", links: settings.nav },
    {
      title: "Journeys",
      links: [
        { label: "Honeymoons", href: "/tours?category=Honeymoon" },
        { label: "Adventure", href: "/tours?category=Adventure" },
        { label: "Culture", href: "/tours?category=Culture" },
        { label: "Wellness", href: "/tours?category=Wellness" },
      ],
    },
  ];
  return (
    <footer className="relative overflow-hidden bg-night pb-28 pt-20 text-paper md:pb-10">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <p className="eyebrow text-paper/50">Start a conversation</p>
            <a href={`mailto:${settings.brand.email}`} className="mt-4 block text-3xl font-medium tracking-[-0.03em] md:text-4xl">
              <span className="link-u">{settings.brand.email}</span>
            </a>
            <a href={`tel:${settings.brand.phone.replace(/\s/g, "")}`} className="mt-2 block text-paper/60 hover:text-paper">
              {settings.brand.phone}
            </a>
            <p className="mt-6 max-w-xs text-sm text-paper/45">{settings.brand.address}</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="eyebrow text-paper/50">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="link-u text-paper/80 hover:text-paper">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="eyebrow text-paper/50">Letters from the road</p>
            <p className="mt-4 text-sm text-paper/60">One beautiful email a month. Unsubscribe whenever.</p>
            <div className="mt-4"><Newsletter dark /></div>
            <div className="mt-8 flex flex-wrap gap-2">
              {settings.brand.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 rounded-md border border-white/15 px-3 py-1.5 text-xs text-paper/70 transition hover:border-accent hover:bg-accent hover:text-white">
                  {s.label}
                  <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none mt-16 select-none overflow-hidden px-3">
        <p className="display whitespace-nowrap text-center text-[25vw] leading-[0.8] text-paper/[0.06]">{settings.brand.name}</p>
      </div>

      <div className="mx-auto mt-6 flex max-w-[1400px] flex-col gap-3 px-5 text-xs text-paper/40 md:flex-row md:items-center md:justify-between md:px-10">
        <p>© {year} {settings.brand.name}. {settings.brand.tagline}</p>
        <div className="flex gap-5">
          <Link href="/about" className="hover:text-paper">About</Link>
          <Link href="/contact" className="hover:text-paper">Contact</Link>
          <Link href="/admin" className="hover:text-paper">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
