"use client";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Destination, Experience, Faq, Post, SiteSettings, Testimonial, Tour } from "@/lib/types";
import { useSite } from "../SiteContext";
import Img from "../Img";
import { Reveal, SplitReveal } from "../Reveal";
import TourCard from "../TourCard";
import Newsletter from "../Newsletter";
import { ArrowRight, ArrowUpRight, Plus, Star } from "../Icons";
import { cn, fmtDate } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function SectionHead({ eyebrow, title, accent, children, className }: { eyebrow: string; title: string; accent?: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col justify-between gap-6 md:flex-row md:items-end", className)}>
      <div>
        <Reveal><p className="eyebrow text-mute">{eyebrow}</p></Reveal>
        <h2 className="display mt-4 text-[13vw] md:text-[6.2vw] xl:text-[5.6rem]">
          <SplitReveal text={title} />
          {accent && (
            <>
              {" "}
              <span className="hl text-accent"><SplitReveal text={accent} delay={0.15} /></span>
            </>
          )}
        </h2>
      </div>
      {children}
    </div>
  );
}

/* ───────────── Marquee of places ───────────── */
export function PlacesMarquee({ items }: { items: { name: string; image: string }[] }) {
  const row = [...items, ...items];
  return (
    <section id="discover" className="overflow-hidden border-y border-line py-6 md:py-8">
      <div className="flex w-max animate-marquee items-center gap-8 [--marquee-dur:55s] hover:[animation-play-state:paused] md:gap-12">
        {row.map((d, k) => (
          <div key={k} className="flex items-center gap-8 md:gap-12">
            <span className="hl whitespace-nowrap text-5xl md:text-7xl">{d.name}</span>
            <span className="h-12 w-20 shrink-0 overflow-hidden rounded-full md:h-16 md:w-28">
              <Img src={d.image} w={240} alt="" className="h-full w-full object-cover" />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Manifesto: word-by-word scroll fill ───────────── */
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return <motion.span style={{ opacity }} className="inline-block">{children}&nbsp;</motion.span>;
}

export function Manifesto({ text, images }: { text: string; images: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  const insertAt = [Math.floor(words.length * 0.18), Math.floor(words.length * 0.55)];
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-44">
      <Reveal><p className="eyebrow mb-8 text-mute">The studio</p></Reveal>
      <div ref={ref} className="text-[8.4vw] font-medium leading-[1.08] tracking-[-0.04em] md:text-[4.4vw] xl:text-[4rem]">
        {words.map((w, k) => {
          const start = k / words.length;
          const img = insertAt.indexOf(k);
          return (
            <span key={k}>
              {img > -1 && images[img] && (
                <span className="mx-1 inline-block h-[0.8em] w-[1.7em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline">
                  <Img src={images[img]} w={300} alt="" className="h-full w-full object-cover" />
                </span>
              )}
              <Word progress={scrollYProgress} range={[start, start + 1 / words.length]}>{w}</Word>
            </span>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────── Destinations: pinned horizontal scroll ───────────── */
export function DestinationsRail({ items }: { items: Destination[] }) {
  const { money } = useSite();
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const sx = useSpring(x, { stiffness: 120, damping: 30, mass: 0.4 });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  return (
    <section ref={wrap} className="relative bg-night text-paper" style={{ height: `calc(100vh + ${dist}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-8 flex w-full max-w-[1400px] items-end justify-between gap-6 px-5 md:mb-12 md:px-10">
          <div>
            <p className="eyebrow text-paper/50">Destinations — {String(items.length).padStart(2, "0")}</p>
            <h2 className="display mt-3 text-[12vw] md:text-[5.6vw] xl:text-[5rem]">
              Places we <span className="hl text-accent">know</span> by heart.
            </h2>
          </div>
          <Link href="/destinations" className="hidden shrink-0 items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm transition hover:bg-paper hover:text-ink md:flex">
            All destinations <ArrowUpRight />
          </Link>
        </div>
        <motion.div ref={track} style={{ x: sx }} className="flex w-max gap-4 px-5 md:gap-6 md:px-10">
          {items.map((d, k) => (
            <Link
              key={d.id}
              href={`/destinations/${d.slug}`}
              data-cursor="Explore"
              className="group relative h-[58svh] w-[72vw] shrink-0 overflow-hidden r-xl sm:w-[46vw] md:h-[60vh] md:w-[30vw] lg:w-[24vw]"
            >
              <Img src={d.image} w={900} alt={d.name} className="h-full w-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute left-5 top-5 font-mono text-xs text-white/70">{String(k + 1).padStart(2, "0")}</span>
              <span className="glass absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] text-ink">{d.bestTime}</span>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs text-white/70">{d.country}</p>
                <h3 className="mt-1 text-4xl font-medium tracking-[-0.04em] md:text-5xl">{d.name}</h3>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="hl text-lg text-white/85">{d.tagline}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-xs text-white/70">
                  <span>from <b className="text-sm font-medium text-white">{money(d.startingPrice)}</b></span>
                  <ArrowUpRight className="text-lg transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
          <Link href="/destinations" className="grid h-[58svh] w-[60vw] shrink-0 place-items-center rounded-[var(--radius)] border border-white/15 text-center transition hover:bg-white/5 sm:w-[36vw] md:h-[60vh] md:w-[22vw]">
            <span>
              <span className="hl block text-5xl">See all</span>
              <span className="mt-2 block text-sm text-paper/60">48 countries, one studio</span>
            </span>
          </Link>
        </motion.div>
        <div className="mx-auto mt-8 w-full max-w-[1400px] px-5 md:px-10">
          <div className="h-px w-full bg-white/10">
            <motion.div style={{ width: bar }} className="h-px bg-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Featured tours w/ category filter ───────────── */
export function FeaturedTours({ tours }: { tours: Tour[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(tours.map((t) => t.category)))], [tours]);
  const [cat, setCat] = useState("All");
  const shown = tours.filter((t) => cat === "All" || t.category === cat).slice(0, 6);
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-36">
      <SectionHead eyebrow="Signature journeys" title="Composed," accent="not packaged.">
        <Link href="/tours" className="group flex w-fit items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm text-paper transition hover:bg-accent">
          View all journeys <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </SectionHead>
      <div className="no-scrollbar -mx-5 mt-10 flex gap-1 overflow-x-auto px-5 md:mx-0 md:px-0">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors", cat === c ? "text-paper" : "text-ink/70 hover:text-ink")}>
            {cat === c && <motion.span layoutId="tour-cat" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((t) => <TourCard key={t.id} tour={t} />)}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

/* ───────────── Experiences: flex accordion ───────────── */
export function Experiences({ items }: { items: Experience[] }) {
  const [active, setActive] = useState(0);
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-36">
      <SectionHead eyebrow="Ways to travel" title="Find your" accent="kind of trip." />
      <div className="mt-10 flex flex-col gap-3 md:h-[560px] md:flex-row">
        {items.map((e, k) => (
          <motion.div
            key={e.id}
            onMouseEnter={() => setActive(k)}
            onClick={() => setActive(k)}
            animate={{ flexGrow: active === k ? 5 : 1 }}
            transition={{ duration: 0.8, ease }}
            className="r-xl group relative h-[220px] cursor-pointer overflow-hidden md:h-auto md:basis-0"
          >
            <Img src={e.image} w={1100} alt={e.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className={cn("absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white transition-opacity duration-500", active !== k && "md:opacity-0")}>
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-white/60">0{k + 1}</p>
                <h3 className="mt-1 whitespace-nowrap text-3xl font-medium tracking-[-0.04em] md:text-4xl">{e.title}</h3>
                <p className="mt-1 whitespace-nowrap text-sm text-white/75">{e.subtitle} · {e.count}</p>
              </div>
              <Link href={`/tours?category=${encodeURIComponent(e.title === "Honeymoons" ? "Honeymoon" : e.title)}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-ink transition hover:bg-accent hover:text-white" aria-label={`Explore ${e.title}`}>
                <ArrowUpRight />
              </Link>
            </div>
            <div className={cn("absolute inset-0 hidden flex-col items-center justify-between py-5 text-white transition-opacity duration-500 md:flex", active === k && "pointer-events-none opacity-0")}>
              <span className="font-mono text-[11px] text-white/70">0{k + 1}</span>
              <span className="whitespace-nowrap text-2xl font-medium tracking-[-0.03em] [writing-mode:vertical-rl] rotate-180">{e.title}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Stats with count-up ───────────── */
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
      const p = Math.min(1, (t - start) / 1800);
      const e = 1 - Math.pow(1 - p, 4);
      setV(Number((to * e).toFixed(dec)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref} className="tabular-nums">{v}{suffix}</span>;
}

export function Stats({ stats, image }: { stats: SiteSettings["stats"]; image: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  return (
    <section ref={ref} className="relative mx-3 overflow-hidden r-xl bg-night text-paper md:mx-6">
      <motion.div style={{ y }} className="absolute inset-[-15%_0]">
        <Img src={image} w={2000} alt="" className="h-full w-full object-cover opacity-45" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-night/80 via-night/40 to-night/90" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-36">
        <SectionHead eyebrow="Ten years, in numbers" title="Quietly" accent="trusted." className="[&_p]:text-paper/60" />
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {stats.map((s, k) => (
            <Reveal key={k} delay={k * 0.08}>
              <div className="border-t border-white/20 pt-5">
                <p className="display text-6xl md:text-7xl"><Counter to={s.value} suffix={s.suffix} /></p>
                <p className="mt-3 text-sm text-paper/60">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Process: sticky steps ───────────── */
const STEPS = [
  { t: "Conversation", d: "A 30-minute call with a planner who has been there. We talk about how you travel, not just where.", img: "flatlay" },
  { t: "Composition", d: "Within 72 hours: a hand-written itinerary, hotel shortlist and an honest price — no templates.", img: "alley" },
  { t: "Refinement", d: "We tune pace, rooms and reservations until it feels exactly right. Unlimited revisions.", img: "airport" },
  { t: "The journey", d: "Private transfers, local hosts and a 24/7 human concierge on WhatsApp the whole way.", img: "santorini" },
];

export function Process({ images }: { images: Record<string, string> }) {
  const [active, setActive] = useState(0);
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-36">
      <div className="grid gap-12 md:grid-cols-2 md:gap-20">
        <div className="md:sticky md:top-24 md:h-[80vh]">
          <SectionHead eyebrow="How it works" title="Four steps," accent="zero stress." />
          <div className="r-xl relative mt-10 hidden aspect-[4/3] overflow-hidden md:block">
            <AnimatePresence mode="popLayout">
              <motion.div key={active} className="absolute inset-0" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease }}>
                <Img src={images[STEPS[active].img]} w={1200} alt="" className="h-full w-full object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:py-[20vh]">
          {STEPS.map((s, k) => (
            <Step key={k} k={k} s={s} active={active === k} onActive={() => setActive(k)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({ k, s, active, onActive }: { k: number; s: (typeof STEPS)[number]; active: boolean; onActive: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => { if (inView) onActive(); }, [inView, onActive]);
  return (
    <motion.div
      ref={ref}
      animate={{ opacity: active ? 1 : 0.35, scale: active ? 1 : 0.98 }}
      transition={{ duration: 0.6, ease }}
      className={cn("r-xl border p-6 md:p-10", active ? "border-transparent bg-card shadow-[0_30px_60px_-30px_rgba(0,0,0,.25)]" : "border-line")}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-mute">Step 0{k + 1}</span>
        <motion.span animate={{ rotate: active ? 45 : 0, backgroundColor: active ? "var(--accent)" : "transparent", color: active ? "#fff" : "var(--ink)" }} className="grid h-9 w-9 place-items-center rounded-full border border-line">
          <Plus />
        </motion.span>
      </div>
      <h3 className="mt-10 text-4xl font-medium tracking-[-0.04em] md:text-5xl">{s.t}</h3>
      <p className="mt-4 max-w-md text-mute">{s.d}</p>
    </motion.div>
  );
}

/* ───────────── Testimonials ───────────── */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % items.length), 7000);
    return () => clearInterval(id);
  }, [paused, items.length]);
  if (!items.length) return null;
  const t = items[i];
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-36" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <p className="eyebrow text-mute">Kind words — {items.length} of thousands</p>
      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_320px] md:gap-20">
        <div className="min-h-[300px] md:min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={t.id}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.7, ease }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) setI((x) => (x + 1) % items.length);
                if (info.offset.x > 60) setI((x) => (x - 1 + items.length) % items.length);
              }}
              className="cursor-grab active:cursor-grabbing"
            >
              <div className="flex gap-1 text-accent">{Array.from({ length: t.rating }).map((_, k) => <Star key={k} />)}</div>
              <p className="mt-6 text-[7.2vw] font-medium leading-[1.12] tracking-[-0.035em] md:text-[3.2vw] xl:text-[2.9rem]">
                <span className="hl text-accent">“</span>{t.quote}<span className="hl text-accent">”</span>
              </p>
              <footer className="mt-8 flex items-center gap-4">
                <Img src={t.avatar} w={120} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="font-medium">{t.name} <span className="text-mute">· {t.location}</span></p>
                  <p className="text-sm text-mute">{t.trip}</p>
                </div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="flex flex-row flex-wrap content-start gap-2 md:flex-col">
          {items.map((x, k) => (
            <button key={x.id} onClick={() => setI(k)} className={cn("flex items-center gap-3 rounded-full p-1.5 pr-4 text-left transition md:w-full", k === i ? "bg-ink text-paper" : "hover:bg-black/5")}>
              <Img src={x.avatar} w={80} alt="" className="h-9 w-9 rounded-full object-cover" />
              <span className="hidden text-sm md:block">{x.name}</span>
              {k === i && (
                <span className="relative ml-auto hidden h-[2px] w-10 overflow-hidden rounded bg-white/20 md:block">
                  {!paused && <motion.span key={i} className="absolute inset-y-0 left-0 bg-accent" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 7, ease: "linear" }} />}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Journal ───────────── */
export function Journal({ posts }: { posts: Post[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-36">
      <SectionHead eyebrow="The journal" title="Notes from" accent="the road.">
        <Link href="/journal" className="group flex w-fit items-center gap-2 text-sm">
          <span className="link-u">All stories</span> <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </SectionHead>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {posts.slice(0, 3).map((p, k) => (
          <Reveal key={p.id} delay={k * 0.1}>
            <Link href={`/journal/${p.slug}`} className="group block" data-cursor="Read">
              <div className={cn("r-xl overflow-hidden", k === 0 ? "aspect-[4/5]" : "aspect-[4/5] md:aspect-[4/4.2]")}>
                <Img src={p.cover} w={900} alt={p.title} className="h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-mute">
                <span className="rounded-md border border-line px-2.5 py-1">{p.category}</span>
                <span>{fmtDate(p.date)}</span>
                <span>· {p.readTime} min</span>
              </div>
              <h3 className="mt-3 text-2xl font-medium leading-tight tracking-[-0.03em] transition-colors group-hover:text-accent">{p.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-mute">{p.excerpt}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── FAQ ───────────── */
export function FaqList({ items, compact }: { items: Faq[]; compact?: boolean }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <ul className={cn("border-t border-line", compact && "")}>
      {items.map((f) => {
        const isOpen = open === f.id;
        return (
          <li key={f.id} className="border-b border-line">
            <button onClick={() => setOpen(isOpen ? null : f.id)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 py-6 text-left">
              <span className="text-lg font-medium tracking-[-0.02em] md:text-2xl">{f.question}</span>
              <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors", isOpen ? "border-accent bg-accent text-white" : "border-line")}>
                <Plus />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease }} className="overflow-hidden">
                  <p className="max-w-2xl pb-6 text-mute">{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export function FaqSection({ items }: { items: Faq[] }) {
  return (
    <section className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-24 md:grid-cols-[1fr_1.4fr] md:px-10 md:pb-36">
      <div>
        <SectionHead eyebrow="Good questions" title="Before you" accent="ask." />
        <p className="mt-6 max-w-sm text-mute">Still curious? <Link href="/contact" className="link-u text-ink">Talk to a planner</Link> — we reply within a few hours.</p>
      </div>
      <FaqList items={items} />
    </section>
  );
}

/* ───────────── Closing CTA ───────────── */
export function ClosingCta({ image }: { image: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const clip = useTransform(scrollYProgress, (p) => `inset(${(18 * (1 - p)).toFixed(2)}% round ${Math.round(200 - 172 * p)}px)`);
  return (
    <section ref={ref} className="px-3 pb-6 md:px-6">
      <motion.div style={{ clipPath: clip }} className="relative min-h-[88svh] overflow-hidden bg-night text-white">
        <Img src={image} w={2200} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="relative mx-auto flex min-h-[88svh] max-w-[1400px] flex-col justify-end px-5 py-16 md:px-10">
          <p className="eyebrow text-white/70">Your next chapter</p>
          <h2 className="display mt-4 max-w-[12ch] text-[14vw] md:text-[8vw] xl:text-[7.5rem]">
            <SplitReveal text="It starts with a" /> <span className="hl text-accent"><SplitReveal text="conversation." delay={0.2} /></span>
          </h2>
          <div className="mt-10 grid items-end gap-8 md:grid-cols-[auto_1fr_360px]">
            <Link href="/contact" className="group flex w-fit items-center gap-3 rounded-md bg-white py-2 pl-6 pr-2 text-ink transition hover:bg-accent hover:text-white">
              Plan my journey
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper transition group-hover:rotate-[-45deg]"><ArrowRight /></span>
            </Link>
            <span />
            <div>
              <p className="mb-3 text-sm text-white/70">Or get one beautiful letter a month.</p>
              <Newsletter dark />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
