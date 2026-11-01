"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Destination } from "@/lib/types";
import { useSite } from "./SiteContext";
import Img from "./Img";
import DestinationGrid from "./DestinationGrid";
import { ArrowUpRight } from "./Icons";
import { cn } from "@/lib/utils";

const soft = [0.22, 1, 0.36, 1] as const;

/**
 * "Atlas" view: a dark stage where every destination is a huge line of type.
 * Hovering (or tapping) a name floods the whole stage with that place.
 */
export default function DestinationIndex({ items }: { items: Destination[] }) {
  const { money } = useSite();
  const regions = useMemo(() => ["All", ...Array.from(new Set(items.map((d) => d.region)))], [items]);
  const [r, setR] = useState("All");
  const [view, setView] = useState<"atlas" | "grid">("atlas");
  const shown = items.filter((d) => r === "All" || d.region === r);
  const [active, setActive] = useState(0);
  const cur = shown[Math.min(active, shown.length - 1)];

  return (
    <section className="pb-24">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 pb-6 md:px-10">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {regions.map((x) => (
            <button key={x} onClick={() => { setR(x); setActive(0); }} className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm", r === x ? "text-paper" : "text-ink/70 hover:text-ink")}>
              {r === x && <motion.span layoutId="reg2" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{x}</span>
            </button>
          ))}
        </div>
        <div className="flex rounded-full border border-line p-1">
          {(["atlas", "grid"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("relative rounded-full px-4 py-1.5 text-xs font-semibold capitalize", view === v ? "text-paper" : "text-ink/60")}>
              {view === v && <motion.span layoutId="dv" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{v}</span>
            </button>
          ))}
        </div>
      </div>

      {view === "grid" ? (
        <DestinationGrid items={shown} hideFilter />
      ) : (
        <div className="px-3 md:px-6">
          <div className="relative overflow-hidden r-xl bg-night text-white">
            {/* stage */}
            <AnimatePresence initial={false}>
              {cur && (
                <motion.div key={cur.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: soft }}>
                  <Img src={cur.image} w={2000} alt="" className="h-full w-full object-cover" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.75)_0%,rgba(0,0,0,.45)_55%,rgba(0,0,0,.2)_100%)]" />

            <div className="relative grid gap-10 p-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:p-10">
              <ul className="min-w-0" onMouseLeave={() => undefined}>
                {shown.map((d, k) => (
                  <li key={d.id} onMouseEnter={() => setActive(k)} className="border-b border-white/15">
                    <Link href={`/destinations/${d.slug}`} onFocus={() => setActive(k)} className="group flex items-baseline justify-between gap-4 py-2 md:py-3">
                      <span className="flex min-w-0 items-baseline gap-4">
                        <span className="w-6 shrink-0 font-mono text-[11px] text-white/50">{String(k + 1).padStart(2, "0")}</span>
                        <motion.span
                          animate={{ x: active === k ? 18 : 0, opacity: active === k ? 1 : 0.45 }}
                          transition={{ duration: 0.5, ease: soft }}
                          className="display truncate text-[11vw] text-white md:text-[min(5.4vw,5.8rem)]"
                        >
                          {d.name}
                        </motion.span>
                      </span>
                      <span className={cn("hidden shrink-0 text-sm transition-opacity md:block", active === k ? "opacity-100" : "opacity-0")}>{d.country}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* detail card */}
              <div className="relative md:sticky md:top-24 md:self-start">
                <AnimatePresence mode="wait">
                  {cur && (
                    <motion.div key={cur.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6, ease: soft }} className="rounded-2xl border border-white/15 bg-black/30 p-5 backdrop-blur-xl md:p-7">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-white/60">{cur.region} · {cur.country}</p>
                      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{cur.tagline}</p>
                      <p className="mt-3 text-white/75">{cur.description}</p>
                      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-5">
                        <div><p className="font-mono text-[10px] uppercase tracking-wider text-white/55">Best time</p><p className="mt-1 font-semibold">{cur.bestTime}</p></div>
                        <div><p className="font-mono text-[10px] uppercase tracking-wider text-white/55">From</p><p className="mt-1 font-semibold">{money(cur.startingPrice)}</p></div>
                      </div>
                      <div className="mt-5 flex gap-2">
                        {cur.gallery.slice(0, 3).map((g, k) => (
                          <span key={k} className="h-16 flex-1 overflow-hidden rounded-lg"><Img src={g} w={300} alt="" className="h-full w-full object-cover" /></span>
                        ))}
                      </div>
                      <Link href={`/destinations/${cur.slug}`} className="group mt-6 flex items-center justify-between rounded-xl bg-white px-5 py-3.5 font-semibold text-black transition hover:bg-accent hover:text-on-accent">
                        Explore {cur.name}
                        <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
