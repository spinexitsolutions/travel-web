"use client";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Tour } from "@/lib/types";
import TourCard from "./TourCard";
import { useSite } from "./SiteContext";
import { Search, X } from "./Icons";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DURATIONS = [
  { label: "Any length", min: 0, max: 99 },
  { label: "Up to 6 days", min: 0, max: 6 },
  { label: "7–9 days", min: 7, max: 9 },
  { label: "10+ days", min: 10, max: 99 },
];
const SORTS = ["Recommended", "Price: low to high", "Price: high to low", "Top rated", "Shortest"];

export default function ToursExplorer({
  tours,
  destinations,
  initial,
}: {
  tours: Tour[];
  destinations: { slug: string; name: string; country: string }[];
  initial: { q?: string; category?: string; month?: string };
}) {
  const { money } = useSite();
  const cats = useMemo(() => ["All", ...Array.from(new Set(tours.map((t) => t.category)))], [tours]);
  const maxPrice = useMemo(() => Math.max(...tours.map((t) => t.price), 0), [tours]);
  const [q, setQ] = useState(initial.q ?? "");
  const [cat, setCat] = useState(initial.category && cats.includes(initial.category) ? initial.category : "All");
  const [month, setMonth] = useState(initial.month && MONTHS.includes(initial.month) ? initial.month : "");
  const [dur, setDur] = useState(0);
  const [price, setPrice] = useState(maxPrice);
  const [sort, setSort] = useState(SORTS[0]);
  const [panel, setPanel] = useState(false);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const d = DURATIONS[dur];
    let r = tours.filter((t) => {
      const dest = destinations.find((x) => x.slug === t.destinationSlug);
      const hay = `${t.title} ${t.summary} ${t.category} ${dest?.name ?? ""} ${dest?.country ?? ""}`.toLowerCase();
      if (s && !hay.includes(s)) return false;
      if (cat !== "All" && t.category !== cat) return false;
      if (t.days < d.min || t.days > d.max) return false;
      if (t.price > price) return false;
      if (month) {
        const m = MONTHS.indexOf(month);
        if (!t.departures.some((x) => new Date(x).getMonth() === m)) return false;
      }
      return true;
    });
    if (sort === SORTS[1]) r = [...r].sort((a, b) => a.price - b.price);
    if (sort === SORTS[2]) r = [...r].sort((a, b) => b.price - a.price);
    if (sort === SORTS[3]) r = [...r].sort((a, b) => b.rating - a.rating);
    if (sort === SORTS[4]) r = [...r].sort((a, b) => a.days - b.days);
    if (sort === SORTS[0]) r = [...r].sort((a, b) => Number(b.featured) - Number(a.featured));
    return r;
  }, [tours, destinations, q, cat, dur, price, month, sort]);

  const active = [q && `“${q}”`, cat !== "All" && cat, month, dur > 0 && DURATIONS[dur].label, price < maxPrice && `≤ ${money(price)}`].filter(Boolean) as string[];
  const reset = () => { setQ(""); setCat("All"); setMonth(""); setDur(0); setPrice(maxPrice); };

  const Filters = (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-mute">Length</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DURATIONS.map((d, k) => (
            <button key={d.label} onClick={() => setDur(k)} className={cn("rounded-full border px-3.5 py-2 text-sm transition", dur === k ? "border-ink bg-ink text-paper" : "border-line hover:border-ink")}>{d.label}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow text-mute">Departure month</p>
        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {MONTHS.map((m) => (
            <button key={m} onClick={() => setMonth(month === m ? "" : m)} className={cn("rounded-xl border py-2 text-xs transition", month === m ? "border-accent bg-accent text-on-accent" : "border-line hover:border-ink")}>{m}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <p className="eyebrow text-mute">Max price / person</p>
          <span className="text-sm font-medium tabular-nums">{money(price)}</span>
        </div>
        <input type="range" min={50000} max={maxPrice} step={1000} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-4 w-full accent-[var(--accent)]" />
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
      {/* toolbar */}
      <div className="sticky top-3 z-30 md:top-[88px]">
        <div className="glass flex flex-wrap items-center gap-2 rounded-[22px] p-2 md:rounded-full">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white/70 px-4 py-2.5">
            <Search className="shrink-0 text-mute" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search journeys or places" className="w-full min-w-0 bg-transparent text-sm outline-none" />
            {q && <button onClick={() => setQ("")} aria-label="Clear"><X /></button>}
          </label>
          <div className="no-scrollbar order-3 flex w-full gap-1 overflow-x-auto md:order-none md:w-auto">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={cn("relative shrink-0 rounded-full px-3.5 py-2 text-sm transition-colors", cat === c ? "text-paper" : "text-ink/70 hover:text-ink")}>
                {cat === c && <motion.span layoutId="ex-cat" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <span className="relative">{c}</span>
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="hidden rounded-full bg-white/70 px-4 py-2.5 text-sm outline-none lg:block">
            {SORTS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => setPanel((p) => !p)} className={cn("rounded-full px-4 py-2.5 text-sm transition", panel ? "bg-accent text-on-accent" : "bg-white/70 hover:bg-white")}>
            Filters{active.length > 0 && ` · ${active.length}`}
          </button>
        </div>
        <AnimatePresence>
          {panel && (
            <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
              <div className="glass mt-2 rounded-[22px] p-5 md:p-7">
                {Filters}
                <div className="mt-6 flex items-center justify-between gap-3 lg:hidden">
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full bg-white/70 px-4 py-2.5 text-sm outline-none">
                    {SORTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => setPanel(false)} className="rounded-md bg-ink px-5 py-2.5 text-sm text-paper">Show {results.length}</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">{results.length} journeys</span>
        {active.map((a) => <span key={a} className="rounded-full bg-black/5 px-3 py-1">{a}</span>)}
        {active.length > 0 && <button onClick={reset} className="link-u ml-1 text-accent">Clear all</button>}
      </div>

      <motion.div layout className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((t, k) => <TourCard key={t.id} tour={t} priority={k < 3} />)}
        </AnimatePresence>
      </motion.div>
      {results.length === 0 && (
        <div className="r-xl mt-6 border border-dashed border-line px-6 py-20 text-center">
          <p className="hl text-4xl">Nothing quite fits — yet.</p>
          <p className="mt-3 text-mute">Every journey can be tailor-made. Tell us what you’re dreaming of.</p>
          <a href="/contact" className="mt-6 inline-flex rounded-md bg-ink px-5 py-3 text-sm text-paper hover:bg-accent">Plan a custom trip</a>
        </div>
      )}
    </section>
  );
}
