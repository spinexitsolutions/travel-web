"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { useSite } from "./SiteContext";
import Img from "./Img";
import { ArrowUpRight, Heart, Search } from "./Icons";
import Spotlight, { type SpotItem } from "./Spotlight";
import { cn } from "@/lib/utils";

const spring = { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } as const;
const ease = [0.22, 1, 0.36, 1] as const;

function useClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () =>
      setT(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }));
    f();
    const id = setInterval(f, 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/**
 * "Island" navigation — a single glass capsule that morphs.
 * Mobile: floats at the bottom (thumb zone) and blooms upward into a sheet.
 * Desktop: floats at the top, compacts on scroll and blooms down into a
 * panel with live image previews.
 */
export default function Navbar({ index }: { index: SpotItem[] }) {
  const { settings, wishlist, introDone } = useSite();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hover, setHover] = useState(0);
  const [spot, setSpot] = useState(false);
  const clock = useClock();
  const links = settings.nav;

  useMotionValueEvent(scrollY, "change", (v) => setCompact(v > 120));

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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const topOffset = settings.announcement.enabled && !compact ? "md:top-[52px]" : "md:top-4";

  return (
    <>
      {/* scrim */}
      <AnimatePresence>
        {open && (
          <motion.button
            aria-label="Close menu"
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.nav
        aria-label="Primary"
        initial={{ y: 80, opacity: 0 }}
        animate={introDone ? { y: 0, opacity: 1 } : { y: 80, opacity: 0 }}
        transition={{ duration: 1, ease, delay: 0.5 }}
        className={cn(
          "fixed inset-x-0 z-[70] flex justify-center px-3 transition-[top] duration-500",
          "bottom-[max(12px,env(safe-area-inset-bottom))] md:bottom-auto",
          topOffset,
        )}
      >
        <motion.div
          layout
          transition={spring}
          className="glass-dark relative flex w-full max-w-[min(100%,760px)] flex-col overflow-hidden text-paper md:w-auto md:flex-col-reverse"
          style={{ borderRadius: open ? 30 : 999 }}
        >
          {/* Expanded panel */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="panel"
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.55, ease }}
                className="w-full md:w-[720px]"
              >
                <div className="grid gap-5 p-4 pb-2 md:grid-cols-[1fr_280px] md:p-5 md:pt-2">
                  <ul className="flex flex-col">
                    {[{ label: "Home", href: "/", image: settings.hero.slides[0]?.image ?? "" }, ...links].map((l, k) => (
                      <motion.li
                        key={l.href}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + k * 0.045, duration: 0.6, ease }}
                        onMouseEnter={() => setHover(k)}
                      >
                        <Link
                          href={l.href}
                          className="group flex items-baseline justify-between border-b border-white/10 py-2.5 md:py-3"
                        >
                          <span className="flex items-baseline gap-3">
                            <span className="font-mono text-[10px] text-paper/40">0{k + 1}</span>
                            <span
                              className={cn(
                                "text-[2rem] font-medium leading-none tracking-[-0.04em] transition-colors md:text-[2.6rem]",
                                isActive(l.href) ? "text-accent" : "group-hover:text-accent",
                              )}
                            >
                              {l.label}
                            </span>
                          </span>
                          <ArrowUpRight className="text-xl text-paper/40 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-paper" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="hidden flex-col gap-3 md:flex">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={hover}
                          className="absolute inset-0"
                          initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.2 }}
                          animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease }}
                        >
                          <Img
                            src={[settings.hero.slides[0]?.image ?? "", ...links.map((l) => l.image)][hover] || links[0]?.image}
                            w={700}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-1 text-xs text-paper/55 md:pb-4">
                  <a href={`mailto:${settings.brand.email}`} className="link-u">{settings.brand.email}</a>
                  <div className="flex gap-4">
                    {settings.brand.socials.slice(0, 3).map((s) => (
                      <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-u">{s.label}</a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Capsule bar */}
          <motion.div layout="position" className="flex h-14 items-center gap-1 pl-2 pr-2 md:h-[58px]">
            <Link href="/" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3" aria-label={`${settings.brand.name} home`}>
              <motion.span
                layout
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-[15px] font-semibold text-white"
                whileHover={{ rotate: -12, scale: 1.06 }}
              >
                {settings.brand.logoMark}
              </motion.span>
              <span className="text-[17px] font-medium tracking-tight">{settings.brand.name}</span>
            </Link>

            {/* Desktop inline links (collapse when compact) */}
            <AnimatePresence initial={false}>
              {!compact && !open && (
                <motion.ul
                  key="inline"
                  className="hidden items-center md:flex"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <span className="mx-2 h-5 w-px bg-white/15" />
                  {links.slice(0, 4).map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={cn(
                          "relative whitespace-nowrap rounded-full px-3.5 py-2 text-[13.5px] transition-colors",
                          isActive(l.href) ? "text-paper" : "text-paper/65 hover:text-paper",
                        )}
                      >
                        {isActive(l.href) && (
                          <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-white/10" transition={spring} />
                        )}
                        <span className="relative">{l.label}</span>
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            <div className="ml-auto flex items-center gap-1 md:ml-2">
              <span className="mr-1 hidden items-center gap-1.5 whitespace-nowrap font-mono text-[11px] text-paper/50 lg:flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                MUM {clock}
              </span>
              <button
                onClick={() => setSpot(true)}
                className="grid h-10 w-10 place-items-center rounded-full text-[18px] text-paper/80 transition hover:bg-white/10 hover:text-paper"
                aria-label="Search (⌘K)"
              >
                <Search />
              </button>
              <Link
                href="/wishlist"
                className="relative grid h-10 w-10 place-items-center rounded-full text-[18px] text-paper/80 transition hover:bg-white/10 hover:text-paper"
                aria-label="Wishlist"
              >
                <Heart />
                <AnimatePresence>
                  {wishlist.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white"
                    >
                      {wishlist.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              <Link
                href="/contact"
                className="hidden h-10 items-center whitespace-nowrap rounded-full bg-paper px-4 text-[13px] font-medium text-ink transition hover:bg-accent hover:text-white sm:flex"
              >
                Plan a trip
              </Link>
              <button
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                className={cn(
                  "relative grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20",
                  !compact && "md:hidden",
                )}
              >
                <span className="relative block h-3 w-4">
                  <motion.span
                    className="absolute left-0 top-0 block h-[1.5px] w-4 rounded bg-paper"
                    animate={open ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
                    transition={spring}
                  />
                  <motion.span
                    className="absolute bottom-0 left-0 block h-[1.5px] w-4 rounded bg-paper"
                    animate={open ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
                    transition={spring}
                  />
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.nav>

      <Spotlight open={spot} onClose={() => setSpot(false)} index={index} />
    </>
  );
}
