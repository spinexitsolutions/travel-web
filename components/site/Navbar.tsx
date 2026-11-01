"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { useSite } from "./SiteContext";
import Img from "./Img";
import { ArrowRight, ArrowUpRight, Heart, Search } from "./Icons";
import Spotlight, { type SpotItem } from "./Spotlight";
import { cn } from "@/lib/utils";

const ease = [0.76, 0, 0.24, 1] as const;
const soft = [0.22, 1, 0.36, 1] as const;

function useClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }));
    f();
    const id = setInterval(f, 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/**
 * Editorial top bar that hides on scroll-down and returns on scroll-up,
 * plus a full-screen accent menu that irises open from the Menu button.
 * Menu links stretch along the font's width axis on hover.
 */
export default function Navbar({ index }: { index: SpotItem[] }) {
  const { settings, wishlist, introDone } = useSite();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [top, setTop] = useState(true);
  const [hover, setHover] = useState(0);
  const [spot, setSpot] = useState(false);
  const clock = useClock();
  const links = [{ label: "Home", href: "/", image: settings.hero.slides[0]?.image ?? "" }, ...settings.nav];
  const a = settings.announcement;

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setTop(v < 40);
    setHidden(v > 240 && v > prev + 2);
    if (v < prev - 2) setHidden(false);
  });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSpot((s) => !s);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [open]);

  // light-on-photo nav while sitting over the full-bleed cinematic hero
  const [heroDark, setHeroDark] = useState(false);
  useEffect(() => {
    const check = () => setHeroDark(!!document.querySelector("[data-nav-overlay]"));
    check();
    const id = setTimeout(check, 120);
    return () => clearTimeout(id);
  }, [pathname]);
  const overlay = top && heroDark;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: !introDone || (hidden && !open) ? -120 : 0 }}
        transition={{ duration: 0.7, ease: soft }}
        className="fixed inset-x-0 top-0 z-[70]"
      >
        {/* announcement folds away after the first scroll */}
        <AnimatePresence initial={false}>
          {a.enabled && top && (
            <motion.div initial={{ height: 0 }} animate={{ height: 32 }} exit={{ height: 0 }} transition={{ duration: 0.5, ease: soft }} className="overflow-hidden bg-ink text-paper">
              <Link href={a.href || "#"} className="group flex h-8 items-center justify-center gap-3 px-4 text-[12px]">
                <span className="rounded-sm bg-accent px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider">New</span>
                <span className="truncate text-paper/80">{a.text}</span>
                <ArrowRight className="shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={cn("text-ink transition-[background-color,border-color,color] duration-500", top ? "border-b border-transparent bg-paper/0" : "border-b border-line bg-paper/85 backdrop-blur-xl")}
          style={overlay ? ({ "--color-ink": "#ffffff", "--color-paper": "#0b0c10", "--color-mute": "rgba(255,255,255,.65)", "--color-line": "rgba(255,255,255,.25)" } as React.CSSProperties) : undefined}
        >
          <nav aria-label="Primary" className="flex h-14 items-center gap-4 px-4 md:h-16 md:px-[4vw]">
            <Link href="/" className="group flex items-center gap-2.5" aria-label={`${settings.brand.name} home`}>
              <span className="grid h-7 w-7 place-items-center rounded-[6px] bg-accent text-[13px] font-bold text-on-accent transition-transform duration-500 group-hover:rotate-90">
                {settings.brand.logoMark}
              </span>
              <span className="wide text-[17px] font-semibold uppercase tracking-[-0.02em]">{settings.brand.name}</span>
            </Link>

            <ul className="ml-6 hidden items-center gap-1 lg:flex">
              {settings.nav.slice(0, 4).map((l, k) => (
                <li key={l.href}>
                  <Link href={l.href} className="group relative flex items-start gap-1 px-3 py-2 text-[14px] font-medium">
                    <span className={cn("stretch-link", isActive(l.href) ? "text-accent" : "text-ink/80 group-hover:text-ink")}>{l.label}</span>
                    <sup className="font-mono text-[9px] text-mute">0{k + 1}</sup>
                    {isActive(l.href) && <motion.span layoutId="nav-dot" className="absolute bottom-0.5 left-3 h-[2px] w-4 bg-accent" />}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="ml-auto flex items-center gap-1">
              <span className="mr-3 hidden items-center gap-1.5 font-mono text-[11px] text-mute xl:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                BOM {clock}
              </span>
              <button onClick={() => setSpot(true)} aria-label="Search (⌘K)" className="flex h-10 items-center gap-2 rounded-md px-2.5 text-ink/80 transition hover:bg-ink/5 hover:text-ink">
                <Search className="text-[18px]" />
                <kbd className="hidden rounded border border-line px-1 font-mono text-[10px] text-mute md:block">⌘K</kbd>
              </button>
              <Link href="/wishlist" aria-label="Wishlist" className="relative grid h-10 w-10 place-items-center rounded-md text-[18px] text-ink/80 transition hover:bg-ink/5 hover:text-ink">
                <Heart />
                <AnimatePresence>
                  {wishlist.length > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-md bg-accent px-1 text-[9px] font-semibold text-on-accent">
                      {wishlist.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              <Link href="/contact" className="ml-1 hidden h-10 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-on-accent transition hover:bg-ink sm:flex">
                Plan a trip <ArrowUpRight />
              </Link>
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className="group ml-1 flex h-10 items-center gap-2.5 rounded-md bg-ink pl-3 pr-3.5 text-[13px] font-medium text-paper"
              >
                <span className="flex flex-col gap-[4px]">
                  <span className="block h-[1.5px] w-4 bg-paper transition-all duration-300 group-hover:w-2.5" />
                  <span className="block h-[1.5px] w-4 bg-paper" />
                </span>
                <span className="hidden sm:inline">Menu</span>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Full-screen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className={cn("fixed inset-0 z-[85] flex flex-col overflow-hidden text-white", settings.theme.preset === "horizon" ? "bg-night" : "bg-accent")}
            initial={{ clipPath: "circle(0% at calc(100% - 48px) 28px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 48px) 28px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 48px) 28px)" }}
            transition={{ duration: 0.9, ease }}
            data-lenis-prevent
          >
            <div className="flex h-14 shrink-0 items-center justify-between px-4 md:h-16 md:px-[4vw]">
              <span className="wide text-[17px] font-semibold uppercase">{settings.brand.name}</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-10 items-center gap-2 rounded-md bg-white px-4 text-[13px] font-medium text-ink">
                Close
                <span className="relative block h-3 w-3">
                  <span className="absolute left-0 top-1/2 block h-[1.5px] w-3 rotate-45 bg-ink" />
                  <span className="absolute left-0 top-1/2 block h-[1.5px] w-3 -rotate-45 bg-ink" />
                </span>
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-8 overflow-y-auto px-4 pb-6 md:grid-cols-[1fr_32vw] md:px-[4vw]">
              <ul className="flex flex-col justify-center">
                {links.map((l, k) => (
                  <li key={l.href} className="overflow-hidden border-b border-white/20" onMouseEnter={() => setHover(k)}>
                    <motion.div initial={{ y: "100%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, ease: soft, delay: 0.25 + k * 0.06 }}>
                      <Link href={l.href} className="group flex items-center justify-between gap-4 py-1.5 md:py-1">
                        <span className="flex items-baseline gap-3 md:gap-5">
                          <span className="font-mono text-[11px] text-white/50">0{k + 1}</span>
                          <span className={cn("menu-link display text-[13.5vw] md:text-[min(7.4vw,11.5svh)]", isActive(l.href) && "text-sun")}>{l.label}</span>
                        </span>
                        <ArrowUpRight className="shrink-0 text-3xl text-white/40 transition duration-500 group-hover:rotate-45 group-hover:text-white md:text-5xl" />
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
              <motion.div className="relative hidden self-center md:block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9, ease: soft }}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[999px_999px_12px_12px]">
                  <AnimatePresence mode="popLayout">
                    <motion.div key={hover} className="absolute inset-0" initial={{ clipPath: "inset(100% 0 0 0)" }} animate={{ clipPath: "inset(0% 0 0 0)" }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease }}>
                      <Img src={links[hover]?.image || links[1]?.image} w={800} alt="" className="h-full w-full object-cover" />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <p className="mt-3 flex justify-between font-mono text-[11px] uppercase text-white/60">
                  <span>{links[hover]?.label}</span>
                  <span>0{hover + 1}/0{links.length}</span>
                </p>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/20 px-4 py-4 text-[13px] md:px-[4vw]">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <a href={`mailto:${settings.brand.email}`} className="link-u">{settings.brand.email}</a>
                <a href={`tel:${settings.brand.phone.replace(/\s/g, "")}`} className="link-u">{settings.brand.phone}</a>
              </div>
              <div className="flex gap-4 text-white/70">
                {settings.brand.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-u hover:text-white">{s.label}</a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Spotlight open={spot} onClose={() => setSpot(false)} index={index} />
    </>
  );
}
