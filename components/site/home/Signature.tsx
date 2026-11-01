"use client";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Destination, Experience, Post, SiteSettings, Testimonial, Tour } from "@/lib/types";
import { useSite } from "../SiteContext";
import Img from "../Img";
import { Reveal, SplitReveal } from "../Reveal";
import { ArrowRight, ArrowUpRight, Star } from "../Icons";
import { cn, fmtDate } from "@/lib/utils";
import { SectionHead } from "./Sections";

const soft = [0.22, 1, 0.36, 1] as const;
const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/* ════════════════════════════════════════════════════════════════════
   1. Velocity marquee — speed, direction and skew follow your scroll
   ════════════════════════════════════════════════════════════════════ */
function VelocityRow({ children, base, outline }: { children: React.ReactNode; base: number; outline?: boolean }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  const sv = useSpring(v, { damping: 50, stiffness: 400 });
  const factor = useTransform(sv, [0, 1000], [0, 5], { clamp: false });
  const skew = useTransform(sv, [-2500, 2500], [8, -8]);
  const x = useTransform(baseX, (val) => `${wrap(-25, 0, val)}%`);
  const dir = useRef(1);
  useAnimationFrame((_, delta) => {
    let move = dir.current * base * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    baseX.set(baseX.get() + move);
  });
  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div style={{ x, skewX: skew }} className={cn("flex shrink-0 items-center", outline && "marquee-outline")}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} className="flex shrink-0 items-center">{children}</div>
        ))}
      </motion.div>
    </div>
  );
}

export function VelocityMarquee({ items }: { items: { name: string; image: string }[] }) {
  const row = (list: typeof items) =>
    list.map((d, k) => (
      <span key={k} className="flex items-center">
        <span className="display px-5 text-[15vw] md:px-8 md:text-[8.5vw]">{d.name}</span>
        <span className="inline-block h-[9vw] w-[15vw] shrink-0 overflow-hidden rounded-full md:h-[5vw] md:w-[9vw]">
          <Img src={d.image} w={320} alt="" className="h-full w-full object-cover" />
        </span>
      </span>
    ));
  return (
    <section id="discover" className="overflow-hidden py-10 md:py-16">
      <VelocityRow base={-2.2}>{row(items)}</VelocityRow>
      <VelocityRow base={2.2} outline>{row([...items].reverse())}</VelocityRow>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2. Manifesto with floating, parallaxing photographs
   ════════════════════════════════════════════════════════════════════ */
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return <motion.span style={{ opacity, y }} className="inline-block">{children}&nbsp;</motion.span>;
}

export function ManifestoFloat({ text, images }: { text: string; images: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const { scrollYProgress: fill } = useScroll({ target: textRef, offset: ["start 0.85", "end 0.5"] });
  const ys = [
    useTransform(scrollYProgress, [0, 1], [180, -260]),
    useTransform(scrollYProgress, [0, 1], [80, -120]),
    useTransform(scrollYProgress, [0, 1], [260, -380]),
    useTransform(scrollYProgress, [0, 1], [120, -200]),
  ];
  const rot = useTransform(scrollYProgress, [0, 1], [-6, 6]);
  const words = text.split(" ");
  const spots = [
    "left-[2%] top-[6%] w-[30vw] md:w-[14vw] aspect-[3/4]",
    "right-[4%] top-[2%] w-[22vw] md:w-[11vw] aspect-square",
    "left-[8%] bottom-[2%] hidden md:block w-[12vw] aspect-[4/5]",
    "right-[6%] bottom-[6%] w-[34vw] md:w-[16vw] aspect-[4/3]",
  ];
  return (
    <section ref={ref} className="relative overflow-hidden py-40 md:py-56">
      {images.slice(0, 4).map((src, k) => (
        <motion.div key={k} style={{ y: ys[k], rotate: k % 2 ? rot : undefined }} className={cn("absolute z-0 overflow-hidden r-lg shadow-[0_40px_80px_-40px_rgba(0,0,0,.45)]", spots[k])}>
          <Img src={src} w={600} alt="" className="h-full w-full object-cover" />
        </motion.div>
      ))}
      <div className="relative z-10 mx-auto max-w-[1100px] px-5 text-center md:px-10">
        <Reveal><p className="eyebrow text-mute">The studio</p></Reveal>
        <div ref={textRef} className="mt-8 text-[8vw] font-medium leading-[1.1] tracking-[-0.04em] md:text-[3.6vw] xl:text-[3.4rem]">
          {words.map((w, k) => (
            <Word key={k} progress={fill} range={[k / words.length, (k + 1) / words.length]}>{w}</Word>
          ))}
        </div>
        <Reveal delay={0.2}>
          <Link href="/about" className="group mt-12 inline-flex items-center gap-3 rounded-full border border-ink/15 bg-paper/70 py-2 pl-5 pr-2 text-sm font-medium backdrop-blur transition hover:border-accent">
            Meet the planners
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-500 group-hover:rotate-45"><ArrowUpRight /></span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   3. Journey index — editorial list, cursor-following preview
   ════════════════════════════════════════════════════════════════════ */
export function JourneyIndex({ tours, destinations }: { tours: Tour[]; destinations: Destination[] }) {
  const { money } = useSite();
  const cats = useMemo(() => ["All", ...Array.from(new Set(tours.map((t) => t.category)))], [tours]);
  const [cat, setCat] = useState("All");
  const [hover, setHover] = useState<number | null>(null);
  const shown = tours.filter((t) => cat === "All" || t.category === cat).slice(0, 7);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 26 });
  const sy = useSpring(y, { stiffness: 220, damping: 26 });
  const rotate = useTransform(useVelocity(sx), [-1500, 1500], [-10, 10]);

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-36">
      <SectionHead eyebrow={`Signature journeys — ${tours.length}`} title="Composed," accent="not packaged.">
        <div className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 md:mx-0 md:px-0">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors", cat === c ? "text-paper" : "text-ink/70 hover:text-ink")}>
              {cat === c && <motion.span layoutId="ji-cat" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
      </SectionHead>

      <div
        className="relative mt-12"
        onPointerMove={(e) => { x.set(e.clientX); y.set(e.clientY); }}
        onPointerLeave={() => setHover(null)}
      >
        <div className="hidden grid-cols-[56px_minmax(0,2fr)_minmax(0,1fr)_100px_150px_48px] gap-4 border-b border-line pb-3 font-mono text-[10.5px] uppercase tracking-wider text-mute md:grid">
          <span>No.</span><span>Journey</span><span>Destination</span><span>Length</span><span className="text-right">From</span><span />
        </div>
        <ul>
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((t, k) => {
              const d = destinations.find((x) => x.slug === t.destinationSlug);
              const active = hover === k;
              return (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: soft, delay: k * 0.03 }}
                  onPointerEnter={() => setHover(k)}
                  className="relative border-b border-line"
                >
                  <Link href={`/tours/${t.slug}`} className="relative grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 py-4 md:grid-cols-[56px_minmax(0,2fr)_minmax(0,1fr)_100px_150px_48px] md:py-6">
                    <motion.span
                      className="absolute inset-0 origin-bottom bg-accent"
                      initial={false}
                      animate={{ scaleY: active ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: soft }}
                    />
                    <span className="relative hidden font-mono text-xs md:block" style={{ color: active ? "var(--on-accent)" : undefined }}>{String(k + 1).padStart(2, "0")}</span>
                    <span className="relative h-16 w-16 overflow-hidden rounded-lg md:hidden"><Img src={t.image} w={140} alt="" className="h-full w-full object-cover" /></span>
                    <span className="relative min-w-0">
                      <motion.span
                        animate={{ x: active ? 14 : 0 }}
                        transition={{ duration: 0.5, ease: soft }}
                        className="block truncate text-xl font-semibold tracking-[-0.03em] md:text-[2.1rem] md:leading-none"
                        style={{ color: active ? "var(--on-accent)" : undefined }}
                      >
                        {t.title}
                      </motion.span>
                      <span className="mt-1 block text-xs text-mute md:hidden">{d?.name} · {t.days} days · {money(t.price)}</span>
                    </span>
                    <span className="relative hidden truncate text-sm md:block" style={{ color: active ? "var(--on-accent)" : undefined }}>{d ? `${d.name}, ${d.country}` : "—"}</span>
                    <span className="relative hidden text-sm md:block" style={{ color: active ? "var(--on-accent)" : undefined }}>{t.days} days</span>
                    <span className="relative hidden text-right text-lg font-semibold tabular-nums md:block" style={{ color: active ? "var(--on-accent)" : undefined }}>{money(t.price)}</span>
                    <span className="relative grid h-10 w-10 place-items-center justify-self-end rounded-full border border-line md:h-11 md:w-11" style={active ? { borderColor: "transparent", background: "var(--on-accent)", color: "var(--accent)" } : undefined}>
                      <motion.span animate={{ rotate: active ? 45 : 0 }}><ArrowUpRight /></motion.span>
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {/* cursor preview */}
        <motion.div
          style={{ left: sx, top: sy, rotate }}
          className="pointer-events-none fixed z-40 hidden -translate-x-1/2 -translate-y-1/2 md:block"
        >
          <AnimatePresence>
            {hover !== null && shown[hover] && (
              <motion.div
                key="pv"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.4, ease: soft }}
                className="relative h-[230px] w-[320px] overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)]"
              >
                {shown.map((t, k) => (
                  <motion.div key={t.id} className="absolute inset-0" animate={{ opacity: hover === k ? 1 : 0, scale: hover === k ? 1 : 1.15 }} transition={{ duration: 0.5, ease: soft }}>
                    <Img src={t.image} w={700} alt="" className="h-full w-full object-cover" />
                  </motion.div>
                ))}
                <span className="absolute bottom-3 left-3 rounded-md bg-black/45 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur">
                  ★ {shown[hover].rating.toFixed(1)} · {shown[hover].category}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Link href="/tours" className="group mt-10 inline-flex items-center gap-3 text-lg font-semibold">
        <span className="link-u">Browse all {tours.length} journeys</span>
        <ArrowRight className="transition-transform group-hover:translate-x-1" />
      </Link>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   4. Stacked experience cards
   ════════════════════════════════════════════════════════════════════ */
function StackCard({ e, k, n, progress }: { e: Experience; k: number; n: number; progress: MotionValue<number> }) {
  const target = 1 - (n - k) * 0.045;
  const scale = useTransform(progress, [k / n, 1], [1, target]);
  const dim = useTransform(progress, [k / n, Math.min(1, (k + 1) / n)], [0, k === n - 1 ? 0 : 0.45]);
  const imgScale = useTransform(progress, [k / n, 1], [1.25, 1]);
  return (
    <div className="sticky top-0 flex h-[100svh] items-center justify-center px-3 md:px-6">
      <motion.div style={{ scale, top: `calc(${k * 22}px - 2vh)` }} className="relative h-[78svh] w-full max-w-[1400px] origin-top overflow-hidden r-xl bg-night text-white">
        <motion.div style={{ scale: imgScale }} className="absolute inset-0">
          <Img src={e.image} w={2000} alt={e.title} className="h-full w-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
        <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-black" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 font-mono text-[11px] uppercase tracking-wider text-white/75 md:p-8">
          <span>Ways to travel</span>
          <span>{String(k + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 grid items-end gap-6 p-5 md:grid-cols-[1fr_auto] md:p-10">
          <div>
            <p className="text-sm text-white/75 md:text-base">{e.subtitle}</p>
            <h3 className="display mt-2 text-[16vw] text-white md:text-[9vw]">{e.title}</h3>
          </div>
          <Link
            href={`/tours?category=${encodeURIComponent(e.title === "Honeymoons" ? "Honeymoon" : e.title)}`}
            className="group flex w-fit items-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 text-sm font-semibold text-black transition hover:bg-accent hover:text-on-accent"
          >
            {e.count}
            <span className="grid h-10 w-10 place-items-center rounded-full bg-black text-white transition-transform duration-500 group-hover:rotate-45"><ArrowUpRight /></span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export function StackedExperiences({ items }: { items: Experience[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section>
      <div className="mx-auto max-w-[1440px] px-5 pt-24 md:px-10 md:pt-32">
        <SectionHead eyebrow="Ways to travel" title="Find your" accent="kind of trip." />
      </div>
      <div ref={ref} className="relative">
        {items.map((e, k) => <StackCard key={e.id} e={e} k={k} n={items.length} progress={scrollYProgress} />)}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   5. Globe — dotted sphere with live routes from home base
   ════════════════════════════════════════════════════════════════════ */
const COORDS: Record<string, [number, number]> = {
  dolomites: [46.4, 11.8], santorini: [36.4, 25.4], bali: [-8.4, 115.2], kyoto: [35, 135.8], maldives: [3.2, 73.2],
  iceland: [64.9, -18.6], rajasthan: [26.9, 75.8], cappadocia: [38.6, 34.8], "halong-bay": [20.9, 107.1], paris: [48.9, 2.35],
  himalaya: [27.9, 86.9], thailand: [8.1, 98.9],
};
const HOME: [number, number] = [19.07, 72.88];

function toV(lat: number, lng: number) {
  const la = (lat * Math.PI) / 180;
  const lo = (lng * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)] as const;
}

function Globe({ destinations }: { destinations: Destination[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef({ on: false, x: 0, v: 0 });
  const rot = useRef(-1.3);
  const inView = useInView(canvas, { margin: "200px" });

  useEffect(() => {
    const c = canvas.current;
    if (!c || !inView) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const accent = getComputedStyle(c).getPropertyValue("--accent").trim() || "#3fe0c5";
    const N = 1600;
    const pts: (readonly [number, number, number])[] = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    const marks = destinations.filter((d) => COORDS[d.slug]).map((d) => ({ name: d.name, v: toV(...COORDS[d.slug]) }));
    const home = toV(...HOME);
    const arcs = marks.map((m) => {
      const out: [number, number, number][] = [];
      const dot = home[0] * m.v[0] + home[1] * m.v[1] + home[2] * m.v[2];
      const om = Math.acos(Math.min(1, Math.max(-1, dot)));
      for (let s = 0; s <= 40; s++) {
        const t = s / 40;
        const a = Math.sin((1 - t) * om) / Math.sin(om || 1);
        const b = Math.sin(t * om) / Math.sin(om || 1);
        const lift = 1 + Math.sin(Math.PI * t) * 0.18 * om;
        out.push([(a * home[0] + b * m.v[0]) * lift, (a * home[1] + b * m.v[1]) * lift, (a * home[2] + b * m.v[2]) * lift]);
      }
      return out;
    });

    let raf = 0;
    let t0 = performance.now();
    const tilt = 0.32;
    const draw = (now: number) => {
      const dt = (now - t0) / 1000;
      t0 = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== w * dpr) { c.width = w * dpr; c.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!drag.current.on) {
        drag.current.v *= 0.95;
        rot.current += dt * 0.18 + drag.current.v;
      }
      const R = Math.min(w, h) * 0.44;
      const cx = w / 2;
      const cy = h / 2;
      const ca = Math.cos(rot.current), sa = Math.sin(rot.current), ct = Math.cos(tilt), st = Math.sin(tilt);
      const P = (p: readonly [number, number, number]) => {
        const x1 = p[0] * ca + p[2] * sa;
        const z1 = -p[0] * sa + p[2] * ca;
        const y2 = p[1] * ct - z1 * st;
        const z2 = p[1] * st + z1 * ct;
        return [cx + x1 * R, cy - y2 * R, z2] as const;
      };
      // halo
      const g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.25);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      // dots
      for (const p of pts) {
        const [x, y, z] = P(p);
        if (z < -0.05) continue;
        ctx.globalAlpha = 0.12 + z * 0.55;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, 1.6, 1.6);
      }
      // arcs (animated dash)
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = accent;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 8;
      const phase = (now / 2400) % 1;
      arcs.forEach((arc, ai) => {
        ctx.beginPath();
        let started = false;
        const lim = Math.floor(((phase + ai * 0.13) % 1) * 1.6 * arc.length);
        arc.forEach((p, k) => {
          if (k > lim) return;
          const [x, y, z] = P(p);
          if (z < 0) { started = false; return; }
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
      // markers
      ctx.font = "600 11px ui-sans-serif, system-ui";
      for (const m of marks) {
        const [x, y, z] = P(m.v);
        if (z < 0.05) continue;
        ctx.globalAlpha = Math.min(1, z * 1.6);
        ctx.fillStyle = accent;
        ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = accent; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 3.2 + ((now / 60) % 12), 0, Math.PI * 2); ctx.globalAlpha *= 1 - ((now / 60) % 12) / 12; ctx.stroke();
        ctx.globalAlpha = Math.min(1, z * 1.6);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(m.name, x + 8, y + 4);
      }
      const [hx, hy, hz] = P(home);
      if (hz > 0) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(hx, hy, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillText("Mumbai — home base", hx + 9, hy + 4);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [destinations, inView]);

  return (
    <canvas
      ref={canvas}
      className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
      onPointerDown={(e) => { drag.current = { on: true, x: e.clientX, v: 0 }; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => {
        if (!drag.current.on) return;
        const dx = e.clientX - drag.current.x;
        drag.current.x = e.clientX;
        rot.current += dx * 0.006;
        drag.current.v = dx * 0.0006;
      }}
      onPointerUp={() => { drag.current.on = false; }}
    />
  );
}

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dec = to % 1 !== 0 ? 1 : 0;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 2000);
      setV(Number((to * (1 - Math.pow(1 - p, 4))).toFixed(dec)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref} className="tabular-nums">{v}{suffix}</span>;
}

export function GlobeStats({ stats, destinations }: { stats: SiteSettings["stats"]; destinations: Destination[] }) {
  return (
    <section className="relative mx-3 overflow-hidden r-xl bg-night text-paper md:mx-6">
      <div className="pointer-events-none absolute right-[-10%] top-1/2 h-[70vh] w-[70vh] -translate-y-1/2 rounded-full bg-accent opacity-[0.12] blur-[120px]" />
      <div className="relative mx-auto grid max-w-[1440px] items-center gap-6 px-5 py-20 md:grid-cols-[1fr_1.1fr] md:px-10 md:py-28">
        <div>
          <Reveal><p className="eyebrow text-paper/55">Ten years, one planet</p></Reveal>
          <h2 className="display mt-4 text-[13vw] md:text-[5.6vw]">
            <SplitReveal text="Quietly" /> <span className="hl"><SplitReveal text="everywhere." delay={0.15} /></span>
          </h2>
          <p className="mt-6 max-w-md text-paper/65">Every line is a route we fly our travellers on — planned from our studio in Mumbai, looked after on the ground by people we know by name.</p>
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10">
            {stats.map((s, k) => (
              <Reveal key={k} delay={k * 0.08}>
                <div className="border-t border-white/15 pt-4">
                  <p className="display text-6xl md:text-7xl"><Counter to={s.value} suffix={s.suffix} /></p>
                  <p className="mt-2 text-sm text-paper/55">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="relative aspect-square w-full">
          <Globe destinations={destinations} />
          <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-wider text-paper/40">Drag to spin</p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   6. Flight-path process — the route draws itself as you scroll
   ════════════════════════════════════════════════════════════════════ */
const STEPS = [
  { t: "Conversation", d: "A 30-minute call with a planner who has been there. We talk about how you travel, not just where." },
  { t: "Composition", d: "Within 72 hours: a hand-written itinerary, a hotel shortlist and an honest price — no templates." },
  { t: "Refinement", d: "We tune pace, rooms and reservations until it feels exactly right. Unlimited revisions." },
  { t: "Wheels up", d: "Private transfers, local hosts and a 24/7 human concierge on WhatsApp the whole way." },
];
const PATH = "M 30 330 C 200 330, 230 120, 400 120 S 620 330, 800 290 S 1010 70, 1170 90";

export function FlightPath() {
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useTransform(scrollYProgress, [0.05, 0.9], [0, 1], { clamp: true });
  const [plane, setPlane] = useState({ x: 30, y: 330, a: 0 });
  const [stops, setStops] = useState<{ x: number; y: number }[]>([]);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const L = el.getTotalLength();
    setStops([0.02, 0.36, 0.66, 0.98].map((t) => { const q = el.getPointAtLength(L * t); return { x: q.x, y: q.y }; }));
  }, []);

  useMotionValueEvent(p, "change", (v) => {
    const el = pathRef.current;
    if (!el) return;
    const L = el.getTotalLength();
    const a = el.getPointAtLength(L * v);
    const b = el.getPointAtLength(Math.min(L, L * v + 1));
    setPlane({ x: a.x, y: a.y, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI });
    setReached([0.02, 0.36, 0.66, 0.98].filter((t) => v >= t - 0.02).length);
  });

  return (
    <section ref={ref} className="relative h-[260svh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
          <SectionHead eyebrow="How it works" title="Four steps," accent="zero stress." />
        </div>

        {/* desktop route */}
        <div className="mx-auto mt-6 hidden w-full max-w-[1300px] px-10 md:block">
          <div className="relative">
            <svg viewBox="0 0 1200 420" className="block w-full overflow-visible">
              <path d={PATH} fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" />
              <motion.path ref={pathRef} d={PATH} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" style={{ pathLength: p }} />
              {stops.map((s, k) => (
                <circle key={k} cx={s.x} cy={s.y} r={reached > k ? 9 : 6} fill={reached > k ? "var(--accent)" : "var(--paper)"} stroke="var(--accent)" strokeWidth="2" style={{ transition: "all .4s" }} />
              ))}
              <g transform={`translate(${plane.x} ${plane.y}) rotate(${plane.a})`}>
                <circle r="22" fill="var(--accent)" opacity=".15" />
                <path d="M-12 -3 L4 -3 L12 -12 L16 -12 L11 -3 L16 -3 L19 -7 L22 -7 L20 0 L22 7 L19 7 L16 3 L11 3 L16 12 L12 12 L4 3 L-12 3 Z" fill="var(--ink)" transform="translate(-4 0)" />
              </g>
            </svg>
            {stops.map((s, k) => (
              <div
                key={k}
                className="absolute w-[250px]"
                style={{
                  left: `${(s.x / 1200) * 100}%`,
                  top: `${(s.y / 420) * 100}%`,
                  transform: `translate(${k === 0 ? "-10%" : k === 3 ? "-90%" : "-50%"}, ${s.y > 200 ? "calc(-100% - 28px)" : "28px"})`,
                }}
              >
                <motion.div
                  initial={false}
                  animate={{ opacity: reached > k ? 1 : 0.15, y: reached > k ? 0 : 16, scale: reached > k ? 1 : 0.96 }}
                  transition={{ duration: 0.6, ease: soft }}
                  className="r-lg bg-card p-5 shadow-[0_30px_60px_-35px_rgba(0,0,0,.35)]"
                >
                  <p className="font-mono text-[11px] text-accent">Step 0{k + 1}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{STEPS[k].t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{STEPS[k].d}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* mobile route */}
        <div className="relative mx-5 mt-8 md:hidden">
          <div className="absolute bottom-2 left-[11px] top-2 w-[2px] bg-line" />
          <motion.div style={{ scaleY: p }} className="absolute bottom-2 left-[11px] top-2 w-[2px] origin-top bg-accent" />
          <ol className="space-y-5">
            {STEPS.map((s, k) => (
              <motion.li key={k} animate={{ opacity: reached > k ? 1 : 0.3 }} className="relative pl-10">
                <span className={cn("absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-accent text-[10px] font-bold transition-colors", reached > k ? "bg-accent text-on-accent" : "bg-paper")}>{k + 1}</span>
                <p className="text-xl font-semibold tracking-tight">{s.t}</p>
                <p className="mt-1 text-sm text-mute">{s.d}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   7. Review wall — two counter-scrolling rows
   ════════════════════════════════════════════════════════════════════ */
function ReviewCard({ t }: { t: Testimonial }) {
  return (
    <figure className="mx-2 flex w-[310px] shrink-0 flex-col justify-between r-xl border border-line bg-card p-6 md:w-[400px]">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5 text-accent">{Array.from({ length: t.rating }).map((_, k) => <Star key={k} />)}</div>
          <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-mute">{t.trip}</span>
        </div>
        <blockquote className="mt-5 text-[17px] leading-snug tracking-[-0.01em] md:text-lg">“{t.quote}”</blockquote>
      </div>
      <figcaption className="mt-6 flex items-center gap-3">
        <Img src={t.avatar} w={100} alt="" className="h-10 w-10 rounded-full object-cover" />
        <span className="text-sm"><b className="font-semibold">{t.name}</b><span className="block text-mute">{t.location}</span></span>
      </figcaption>
    </figure>
  );
}

export function ReviewWall({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  const rowA = [...items, ...items];
  const rowB = [...items].reverse();
  return (
    <section className="overflow-hidden py-24 md:py-36">
      <div className="mx-auto grid max-w-[1440px] items-end gap-8 px-5 md:grid-cols-[1fr_auto] md:px-10">
        <SectionHead eyebrow="Kind words" title="Postcards from" accent="our travellers." />
        <Reveal className="flex items-center gap-5 r-xl bg-card p-5">
          <p className="display text-6xl">4.9</p>
          <div>
            <div className="flex gap-0.5 text-accent">{Array.from({ length: 5 }).map((_, k) => <Star key={k} />)}</div>
            <p className="mt-1 text-sm text-mute">from 2,400+ verified reviews</p>
          </div>
        </Reveal>
      </div>
      <div className="mt-14 space-y-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="group flex">
          <div className="flex w-max animate-marquee [--marquee-dur:70s] group-hover:[animation-play-state:paused]">
            {[...rowA, ...rowA].map((t, k) => <ReviewCard key={k} t={t} />)}
          </div>
        </div>
        <div className="group flex">
          <div className="flex w-max animate-marquee [--marquee-dur:80s] [animation-direction:reverse] group-hover:[animation-play-state:paused]">
            {[...rowB, ...rowB, ...rowB, ...rowB].map((t, k) => <ReviewCard key={k} t={t} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   8. Journal bento
   ════════════════════════════════════════════════════════════════════ */
export function JournalBento({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10 md:pb-36">
      <SectionHead eyebrow="The journal" title="Notes from" accent="the road.">
        <Link href="/journal" className="group flex w-fit items-center gap-2 text-sm font-semibold">
          <span className="link-u">All stories</span> <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </SectionHead>
      <div className="mt-10 grid gap-4 md:grid-cols-12 md:grid-rows-2">
        <Reveal className="md:col-span-7 md:row-span-2">
          <Link href={`/journal/${lead.slug}`} data-cursor="Read" className="group relative block h-full min-h-[460px] overflow-hidden r-xl md:min-h-[640px]">
            <Img src={lead.cover} w={1400} alt={lead.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">{lead.category}</span>
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
              <p className="font-mono text-[11px] uppercase tracking-wider text-white/70">{fmtDate(lead.date)} · {lead.readTime} min read · {lead.author}</p>
              <h3 className="mt-3 max-w-xl text-3xl font-semibold leading-[1.05] tracking-[-0.035em] md:text-5xl">{lead.title}</h3>
              <p className="mt-3 max-w-md text-white/75">{lead.excerpt}</p>
            </div>
          </Link>
        </Reveal>
        {rest.slice(0, 2).map((p, k) => (
          <Reveal key={p.id} delay={0.1 + k * 0.1} className="md:col-span-5">
            <Link href={`/journal/${p.slug}`} data-cursor="Read" className="group grid h-full grid-cols-[40%_1fr] overflow-hidden r-xl bg-card">
              <div className="relative overflow-hidden">
                <Img src={p.cover} w={700} alt={p.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-110" />
              </div>
              <div className="flex flex-col justify-between gap-6 p-5 md:p-7">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-mute">{p.category} · {p.readTime} min</p>
                  <h3 className="mt-3 text-xl font-semibold leading-tight tracking-[-0.03em] transition-colors group-hover:text-accent md:text-2xl">{p.title}</h3>
                </div>
                <span className="flex items-center gap-2 text-sm font-semibold">Read story <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
