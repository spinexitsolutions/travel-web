"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSite } from "../SiteContext";
import Img from "../Img";
import { ArrowRight, ArrowUpRight, Calendar, Pin, Search, Users } from "../Icons";
import { cn } from "@/lib/utils";

export type CineSlide = {
  image: string;
  name: string;
  country: string;
  tagline: string;
  bestTime: string;
  price: number;
  href: string;
};

const ease = [0.76, 0, 0.24, 1] as const;
const soft = [0.22, 1, 0.36, 1] as const;
const STRIPS = 7;
const DURATION = 7000;
const MONTHS = ["Any month", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Cinematic hero — full-bleed photography that changes with a staggered
 * "shutter" of vertical slices, a huge letter-by-letter destination name,
 * a live destination rail, mouse parallax and a frosted search bar.
 * On scroll the whole frame settles into a rounded card.
 */
export default function HeroCinematic({ slides, destinations }: { slides: CineSlide[]; destinations: string[] }) {
  const { settings, introDone, money } = useSite();
  const h = settings.hero;
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const s = slides[i];

  const go = (n: number) => {
    if (n === i) return;
    setPrev(i);
    setI((n + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!introDone || paused || slides.length < 2) return;
    const id = setTimeout(() => go(i + 1), DURATION);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, introDone, paused, slides.length]);

  // mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const imgX = useTransform(smx, (v) => v * -18);
  const imgY = useTransform(smy, (v) => v * -12);
  const txtX = useTransform(smx, (v) => v * 10);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  // scroll: frame settles into a card
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const radius = useTransform(scrollYProgress, [0, 0.5], [0, 36]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const fade = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const deep = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  return (
    <section ref={ref} data-nav-overlay className="relative h-[100svh] min-h-[640px] bg-paper md:min-h-[720px]">
      <motion.div
        style={{ scale, borderRadius: radius }}
        onPointerMove={onMove}
        className="relative h-full w-full origin-top overflow-hidden bg-night text-white"
      >
        {/* ── Imagery ── */}
        <motion.div style={{ x: imgX, y: imgY }} className="absolute inset-[-3%]">
          <motion.div style={{ y: deep }} className="absolute inset-0">
            {prev !== null && (
              <div className="absolute inset-0">
                <Img src={slides[prev].image} w={2200} alt="" className="h-full w-full scale-[1.08] object-cover" />
              </div>
            )}
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={{ scale: 1.16 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: DURATION / 1000 + 2, ease: "linear" }}
            >
              {Array.from({ length: STRIPS }).map((_, k) => (
                <motion.div
                  key={k}
                  className="absolute top-0 h-full overflow-hidden"
                  style={{ left: `${(k * 100) / STRIPS}%`, width: `calc(${100 / STRIPS}% + 1px)` }}
                  initial={prev === null ? false : { clipPath: k % 2 ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)" }}
                  animate={{ clipPath: "inset(0% 0 0% 0)" }}
                  transition={{ duration: 1.25, ease, delay: Math.abs(k - (STRIPS - 1) / 2) * 0.06 }}
                >
                  <div className="absolute top-0 h-full" style={{ left: `-${k * 100}%`, width: `${STRIPS * 100}%` }}>
                    <Img src={s.image} w={2200} alt={k === 0 ? s.name : ""} priority={i === 0} className="h-full w-full object-cover" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* legibility */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.55)_0%,rgba(0,0,0,.15)_45%,rgba(0,0,0,0)_70%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.75)_0%,rgba(0,0,0,.15)_38%,rgba(0,0,0,0)_55%,rgba(0,0,0,.35)_100%)]" />

        {/* ── Content ── */}
        <motion.div style={{ y: contentY, opacity: fade }} className="relative z-10 flex h-full flex-col px-5 pb-5 pt-[112px] md:px-10 md:pb-8 md:pt-[124px]">
          <div className="flex items-start justify-between gap-8">
            {/* message */}
            <div className="max-w-[46rem]">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={introDone ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: soft, delay: 0.1 }}
                className="eyebrow text-white/75"
              >
                {h.eyebrow}
              </motion.p>
              <h1 className="display mt-4 text-[10.5vw] text-white md:text-[min(5.4vw,6rem)]">
                {[h.titleTop, h.titleAccent, h.titleBottom].map((part, k) => (
                  <span key={k} className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
                    <motion.span
                      className={cn("inline-block", k === 1 && "hl hero-hl")}
                      initial={{ y: "110%" }}
                      animate={introDone ? { y: "0%" } : {}}
                      transition={{ duration: 1.1, ease: soft, delay: 0.2 + k * 0.12 }}
                    >
                      {part}
                      {k < 2 ? " " : ""}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={introDone ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, ease: soft, delay: 0.55 }}
                className="mt-5 hidden max-w-md text-[15px] leading-relaxed text-white/80 md:block"
              >
                {h.subtitle}
              </motion.p>
            </div>

            {/* destination rail (desktop) */}
            <motion.ol
              initial={{ opacity: 0, x: 30 }}
              animate={introDone ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, ease: soft, delay: 0.6 }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="hidden w-[270px] shrink-0 flex-col gap-1.5 lg:flex"
            >
              {slides.slice(0, 6).map((d, k) => (
                <li key={d.name}>
                  <button
                    onClick={() => go(k)}
                    className={cn(
                      "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl p-1.5 pr-3 text-left transition-colors duration-500",
                      k === i ? "bg-white/18 backdrop-blur-md" : "hover:bg-white/10",
                    )}
                  >
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                      <Img src={d.image} w={120} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold leading-tight">{d.name}</span>
                      <span className="block truncate text-[12px] text-white/60">{d.country}</span>
                    </span>
                    <span className="font-mono text-[10px] text-white/50">{String(k + 1).padStart(2, "0")}</span>
                    {k === i && (
                      <span className="absolute inset-x-2 bottom-0 h-[2px] overflow-hidden rounded bg-white/15">
                        {!paused && introDone && (
                          <motion.span
                            key={`p${i}`}
                            className="absolute inset-y-0 left-0 bg-accent"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: DURATION / 1000, ease: "linear" }}
                          />
                        )}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </motion.ol>
          </div>

          {/* ── Bottom: destination name + CTA ── */}
          <div className="mt-auto">
            <div className="flex items-end justify-between gap-6">
              <motion.div style={{ x: txtX }} className="min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div key={i} initial="hide" animate={introDone ? "show" : "hide"} exit="out">
                    <motion.p
                      variants={{ hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: soft, delay: 0.35 } }, out: { opacity: 0, transition: { duration: 0.25 } } }}
                      className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/75"
                    >
                      <span className="text-white">{String(i + 1).padStart(2, "0")}</span>
                      <span className="h-px w-8 bg-white/40" />
                      <Pin /> {s.country}
                      <span className="hidden sm:inline">· Best {s.bestTime}</span>
                    </motion.p>
                    <p className="hero-name display mt-2 flex overflow-hidden whitespace-nowrap pb-[0.06em] text-[17vw] leading-[0.86] text-white md:text-[min(11vw,12.5rem)]" aria-label={s.name}>
                      {s.name.split("").map((c, k) => (
                        <motion.span
                          key={k}
                          aria-hidden
                          className="inline-block"
                          variants={{
                            hide: { y: "105%" },
                            show: { y: "0%", transition: { duration: 1, ease: soft, delay: 0.25 + k * 0.035 } },
                            out: { y: "-105%", transition: { duration: 0.45, ease, delay: k * 0.015 } },
                          }}
                        >
                          {c === " " ? " " : c}
                        </motion.span>
                      ))}
                    </p>
                    <motion.p
                      variants={{ hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: soft, delay: 0.55 } }, out: { opacity: 0, transition: { duration: 0.2 } } }}
                      className="mt-2 text-[15px] text-white/80 md:text-lg"
                    >
                      {s.tagline}
                    </motion.p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={introDone ? { opacity: 1, y: 0 } : {}}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.7, ease: soft, delay: 0.45 }}
                  className="hidden shrink-0 md:block"
                >
                  <Link href={s.href} className="group flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-2 pr-5 backdrop-blur-xl transition hover:bg-white hover:text-ink">
                    <span className="h-16 w-16 overflow-hidden rounded-xl">
                      <Img src={slides[(i + 1) % slides.length].image} w={200} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span>
                      <span className="block font-mono text-[10px] uppercase tracking-wider opacity-60">Journeys from</span>
                      <span className="block text-xl font-semibold tracking-tight">{money(s.price)}</span>
                    </span>
                    <span className="ml-2 grid h-10 w-10 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRight />
                    </span>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* mobile thumbnails */}
            <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 lg:hidden">
              {slides.slice(0, 6).map((d, k) => (
                <button
                  key={d.name}
                  onClick={() => go(k)}
                  className={cn("relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 transition", k === i ? "ring-accent" : "ring-transparent opacity-70")}
                  aria-label={d.name}
                >
                  <Img src={d.image} w={120} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            <SearchBar destinations={destinations} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function SearchBar({ destinations }: { destinations: string[] }) {
  const { introDone } = useSite();
  const router = useRouter();
  const [where, setWhere] = useState("");
  const [month, setMonth] = useState("Any month");
  const [guests, setGuests] = useState(2);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (where) p.set("q", where);
    if (month !== "Any month") p.set("month", month);
    p.set("guests", String(guests));
    router.push(`/tours?${p}`);
  };

  const label = "block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55";
  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 24 }}
      animate={introDone ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: soft, delay: 0.8 }}
      className="mt-5 flex items-stretch gap-1 rounded-2xl border border-white/15 bg-black/25 p-1.5 backdrop-blur-2xl md:mt-7"
    >
      <label className="flex min-w-0 flex-[1.5] items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/10 md:px-4">
        <Pin className="shrink-0 text-lg text-accent" />
        <span className="min-w-0 flex-1">
          <span className={label}>Where to</span>
          <input
            list="cine-dest"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Search destinations"
            className="w-full min-w-0 bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-white/50"
          />
          <datalist id="cine-dest">{destinations.map((d) => <option key={d} value={d} />)}</datalist>
        </span>
      </label>
      <span className="my-2 hidden w-px bg-white/15 md:block" />
      <label className="hidden flex-1 items-center gap-3 rounded-xl px-4 py-2 transition hover:bg-white/10 md:flex">
        <Calendar className="shrink-0 text-lg text-accent" />
        <span className="min-w-0 flex-1">
          <span className={label}>When</span>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full appearance-none bg-transparent text-[15px] font-medium text-white outline-none [&>option]:text-black">
            {MONTHS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </span>
      </label>
      <span className="my-2 hidden w-px bg-white/15 md:block" />
      <div className="hidden flex-1 items-center gap-3 rounded-xl px-4 py-2 md:flex">
        <Users className="shrink-0 text-lg text-accent" />
        <span className="flex-1">
          <span className={label}>Guests</span>
          <span className="flex items-center gap-3 text-[15px] font-medium">
            <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-sm hover:bg-white/25" aria-label="Fewer guests">−</button>
            <span className="w-4 text-center tabular-nums">{guests}</span>
            <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-sm hover:bg-white/25" aria-label="More guests">+</button>
          </span>
        </span>
      </div>
      <button className="group flex shrink-0 items-center gap-2 rounded-xl bg-accent px-4 text-[15px] font-semibold text-on-accent transition hover:brightness-110 md:px-7">
        <Search className="text-lg" />
        <span className="hidden sm:inline">Search</span>
        <ArrowRight className="hidden transition-transform group-hover:translate-x-1 md:block" />
      </button>
    </motion.form>
  );
}
