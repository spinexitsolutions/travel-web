"use client";
import { AnimatePresence, animate, motion, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSite } from "../SiteContext";
import Img from "../Img";
import Flap from "../Flap";
import { ArrowRight, Search } from "../Icons";

const ease = [0.76, 0, 0.24, 1] as const;
const soft = [0.22, 1, 0.36, 1] as const;
const MONTHS = ["Any", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Window rectangles as % insets of the viewport: [top, right, bottom, left] */
const WIN_DESKTOP = [17, 7, 14, 63];
const WIN_MOBILE = [39, 19, 22, 19];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * "Window seat" hero.
 * A poster of condensed/expanded type with an aircraft-window slideshow.
 * On scroll the window opens to full-bleed — you've landed.
 */
export default function Hero({ destinations }: { destinations: string[] }) {
  const { settings, introDone } = useSite();
  const h = settings.hero;
  const slides = h.slides.length ? h.slides : [{ image: settings.intro.images[0], caption: "Somewhere" }];
  const [i, setI] = useState(0);
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  const ref = useRef<HTMLElement>(null);
  const mobile = vp.w < 768;

  useEffect(() => {
    const f = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  useEffect(() => {
    if (!introDone) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 5200);
    return () => clearInterval(id);
  }, [introDone, slides.length]);

  // boot: window opens from a slit when the intro finishes
  const boot = useMotionValue(0);
  useEffect(() => {
    if (introDone) animate(boot, 1, { duration: 1.5, ease, delay: 0.25 });
  }, [introDone, boot]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const open = useTransform(scrollYProgress, [0.04, 0.72], [0, 1], { clamp: true });

  const win = mobile ? WIN_MOBILE : WIN_DESKTOP;
  const winW = ((100 - win[1] - win[3]) / 100) * vp.w;

  const clip = useTransform([boot, open] as MotionValue<number>[], ([b, o]: number[]) => {
    const midY = (win[0] + (100 - win[2])) / 2;
    const t = lerp(midY, win[0], b) * (1 - o);
    const bt = lerp(100 - midY, win[2], b) * (1 - o);
    const r = win[1] * (1 - o);
    const l = win[3] * (1 - o);
    const rad = (winW / 2) * Math.pow(1 - o, 1.4);
    return `inset(${t.toFixed(3)}% ${r.toFixed(3)}% ${bt.toFixed(3)}% ${l.toFixed(3)}% round ${rad.toFixed(1)}px)`;
  });
  const imgScale = useTransform(open, [0, 1], [1.28, 1]);
  const lineL = useTransform(open, [0, 0.6], ["0vw", "-24vw"]);
  const lineR = useTransform(open, [0, 0.6], ["0vw", "18vw"]);
  const textFade = useTransform(open, [0, 0.45], [1, 0]);
  const uiFade = useTransform(open, [0, 0.18], [1, 0]);
  const uiY = useTransform(open, [0, 0.18], [0, 30]);
  const arrive = useTransform(open, [0.82, 1], [0, 1]);
  const arriveY = useTransform(open, [0.82, 1], [40, 0]);
  const ringFade = useTransform(open, [0, 0.3], [1, 0]);

  const lineSize = mobile ? "17.5vw" : "min(14.5vw, 25svh)";
  const accentSize = mobile ? "11.5vw" : "min(7.6vw, 13svh)";

  const lineAnim = (d: number) => ({
    initial: { y: "105%" },
    animate: introDone ? { y: "0%" } : { y: "105%" },
    transition: { duration: 1.2, ease: soft, delay: 0.15 + d },
  });

  return (
    <section ref={ref} className="relative h-[260svh] bg-paper">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-paper">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" />

        {/* ── Window / full-bleed image ── */}
        <motion.div className="absolute inset-0 z-10 overflow-hidden bg-night will-change-[clip-path]" style={{ clipPath: clip }}>
          <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={i}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 1.1 }, scale: { duration: 6, ease: "linear" } }}
              >
                <Img src={slides[i].image} w={2200} alt={slides[i].caption} priority className="h-full w-full object-cover" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <motion.div style={{ opacity: ringFade }} className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,.55)]" />
          {/* Arrival layer */}
          <motion.div
            style={{ opacity: arrive, y: arriveY }}
            className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-black/20 p-5 pb-12 text-white md:p-10 md:pb-12"
          >
            <p className="eyebrow text-white/70">Now arriving</p>
            <AnimatePresence mode="wait">
              <motion.h2
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: soft }}
                className="wide mt-3 text-[13vw] font-light uppercase leading-[0.9] tracking-[-0.05em] md:text-[8vw]"
              >
                {slides[i].caption.split(",")[0]}
              </motion.h2>
            </AnimatePresence>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/tours" className="group flex items-center gap-3 rounded-md bg-accent px-5 py-3.5 text-sm font-medium text-on-accent transition hover:bg-white hover:text-ink">
                Explore journeys <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/contact" className="rounded-md border border-white/40 px-5 py-3.5 text-sm transition hover:bg-white hover:text-ink">
                {h.ctaLabel}
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Poster type ──
            Two identical stacked layers: the outer lines blend (difference) so they
            read over both paper and photo; the accent line stays true to colour. */}
        {[true, false].map((blend) => (
          <div
            key={String(blend)}
            aria-hidden={!blend}
            className={`pointer-events-none absolute inset-x-0 top-[11svh] z-20 px-5 md:top-[12svh] md:px-[4vw] ${blend ? "mix-blend-difference" : ""}`}
          >
            <motion.p style={{ opacity: uiFade }} className={`eyebrow mb-4 md:mb-5 ${blend ? "text-white/60" : "invisible"}`}>
              {h.eyebrow}
            </motion.p>
            <motion.div style={{ x: lineL, opacity: textFade }} className={`overflow-hidden ${blend ? "" : "invisible"}`}>
              <motion.span {...lineAnim(0)} className="display block whitespace-nowrap text-white" style={{ fontSize: lineSize }}>
                {h.titleTop}
              </motion.span>
            </motion.div>
            <motion.div style={{ x: lineR, opacity: textFade }} className={`overflow-hidden py-[0.06em] ${blend ? "invisible" : ""}`}>
              <motion.span {...lineAnim(0.12)} className="display hl block whitespace-nowrap" style={{ fontSize: accentSize }}>
                {h.titleAccent}
              </motion.span>
            </motion.div>
            <motion.div style={{ x: lineL, opacity: textFade }} className={`overflow-hidden ${blend ? "" : "invisible"}`}>
              <motion.span {...lineAnim(0.22)} className="display block whitespace-nowrap text-white" style={{ fontSize: lineSize }}>
                {h.titleBottom}
              </motion.span>
            </motion.div>
            <motion.div style={{ opacity: uiFade }} className={blend ? "invisible" : ""}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={introDone ? { opacity: 1 } : {}}
                transition={{ delay: 0.9, duration: 1 }}
                className="mt-5 hidden max-w-[24rem] text-[15px] leading-relaxed text-ink/70 md:block"
              >
                {h.subtitle}
              </motion.p>
            </motion.div>
          </div>
        ))}

        {/* ── Slide meta above the window ── */}
        <motion.div
          style={{ opacity: uiFade, top: `calc(${win[0]}% - 30px)`, left: `${win[3]}%`, right: `${win[1]}%` }}
          className="absolute z-20 hidden items-center justify-between font-mono text-[11px] uppercase text-ink/70 md:flex"
        >
          <span>Seat 12A · Window</span>
          <span>{String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
        </motion.div>

        {/* ── Bottom: boarding pass + departure board ── */}
        <motion.div style={{ opacity: uiFade, y: uiY }} className="absolute inset-x-0 bottom-[max(14px,2.5svh)] z-20 px-3 md:px-[4vw]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <BoardingPass destinations={destinations} />
            <div className="hidden md:block" style={{ width: `${100 - win[1] - win[3]}vw` }}>
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-mute">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Now boarding
              </p>
              <div className="text-[15px]">
                <Flap text={slides[i].caption.split(",")[0]} len={14} />
              </div>
              <div className="mt-3 flex gap-1">
                {slides.map((_, k) => (
                  <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className="relative h-[3px] flex-1 overflow-hidden bg-ink/15">
                    {k === i && <motion.span key={`b${i}`} className="absolute inset-y-0 left-0 bg-accent" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 5.2, ease: "linear" }} />}
                    {k < i && <span className="absolute inset-0 bg-ink/50" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* mobile: departure board under the window */}
        <motion.div style={{ opacity: uiFade, top: `calc(${100 - win[2]}% + 10px)` }} className="absolute inset-x-0 z-20 flex justify-center text-[12px] md:hidden">
          <Flap text={slides[i].caption.split(",")[0]} len={14} />
        </motion.div>
      </div>
    </section>
  );
}

function BoardingPass({ destinations }: { destinations: string[] }) {
  const router = useRouter();
  const { introDone } = useSite();
  const [to, setTo] = useState("");
  const [month, setMonth] = useState("Any");
  const [pax, setPax] = useState(2);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (to) p.set("q", to);
    if (month !== "Any") p.set("month", month);
    p.set("guests", String(pax));
    router.push(`/tours?${p}`);
  }

  const label = "block font-mono text-[9.5px] uppercase tracking-[0.12em] text-mute";
  return (
    <motion.form
      onSubmit={go}
      initial={{ opacity: 0, y: 30 }}
      animate={introDone ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: soft, delay: 0.7 }}
      className="relative flex w-full items-stretch overflow-hidden rounded-[10px] bg-white text-ink shadow-[0_30px_60px_-30px_rgba(11,12,20,.35)] md:w-[54vw] md:max-w-[780px]"
    >
      <div className="hidden w-[92px] shrink-0 flex-col justify-between gap-2 bg-ink p-3 text-paper sm:flex">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-paper/50">From</span>
        <span className="wide text-xl font-semibold leading-none">BOM</span>
        <span className="font-mono text-[9.5px] text-paper/50">Mumbai</span>
      </div>
      <label className="flex min-w-0 flex-[1.6] flex-col justify-center gap-1 px-4 py-3">
        <span className={label}>To</span>
        <input
          list="hero-dest"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Anywhere"
          className="w-full min-w-0 bg-transparent text-[17px] font-semibold uppercase tracking-tight outline-none placeholder:text-ink/35"
        />
        <datalist id="hero-dest">{destinations.map((d) => <option key={d} value={d} />)}</datalist>
      </label>
      <span className="dash-v my-3 bg-ink" />
      <label className="hidden flex-1 flex-col justify-center gap-1 px-4 py-3 sm:flex">
        <span className={label}>Month</span>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="appearance-none bg-transparent text-[17px] font-semibold uppercase outline-none">
          {MONTHS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      <span className="dash-v my-3 hidden bg-ink sm:block" />
      <div className="hidden flex-col justify-center gap-1 px-4 py-3 sm:flex">
        <span className={label}>Pax</span>
        <span className="flex items-center gap-2 text-[17px] font-semibold">
          <button type="button" onClick={() => setPax((p) => Math.max(1, p - 1))} className="grid h-5 w-5 place-items-center rounded bg-ink/10 text-xs" aria-label="Fewer">−</button>
          <span className="w-5 text-center tabular-nums">{String(pax).padStart(2, "0")}</span>
          <button type="button" onClick={() => setPax((p) => Math.min(20, p + 1))} className="grid h-5 w-5 place-items-center rounded bg-ink/10 text-xs" aria-label="More">+</button>
        </span>
      </div>
      <button className="group relative flex shrink-0 items-center gap-2 bg-accent px-5 text-sm font-medium text-on-accent transition-colors hover:bg-ink md:px-6">
        <span className="absolute -top-2 left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-paper" />
        <span className="absolute -bottom-2 left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-paper" />
        <Search className="text-base" />
        <span className="hidden sm:inline">Find</span>
        <ArrowRight className="hidden transition-transform group-hover:translate-x-1 sm:block" />
      </button>
    </motion.form>
  );
}
