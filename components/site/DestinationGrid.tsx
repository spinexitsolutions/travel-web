"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Destination } from "@/lib/types";
import Img from "./Img";
import { useSite } from "./SiteContext";
import { ArrowUpRight } from "./Icons";
import { cn } from "@/lib/utils";

export default function DestinationGrid({ items }: { items: Destination[] }) {
  const { money } = useSite();
  const regions = useMemo(() => ["All", ...Array.from(new Set(items.map((d) => d.region)))], [items]);
  const [r, setR] = useState("All");
  const shown = items.filter((d) => r === "All" || d.region === r);
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
      <div className="no-scrollbar flex gap-1 overflow-x-auto">
        {regions.map((x) => (
          <button key={x} onClick={() => setR(x)} className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm", r === x ? "text-paper" : "text-ink/70 hover:text-ink")}>
            {r === x && <motion.span layoutId="reg" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <span className="relative">{x}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((d, k) => (
            <motion.div key={d.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className={cn(k % 5 === 0 && "lg:row-span-2")}>
              <Link href={`/destinations/${d.slug}`} data-cursor="Explore" className={cn("r-xl group relative block h-full min-h-[380px] overflow-hidden", k % 5 === 0 && "lg:min-h-[780px]")}>
                <Img src={d.image} w={1000} alt={d.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-[11px]">{d.region}</span>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs text-white/70">{d.country} · {d.bestTime}</p>
                  <h3 className="mt-1 text-5xl font-medium tracking-[-0.045em]">{d.name}</h3>
                  <p className="serif-i mt-1 text-xl text-white/85">{d.tagline}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-sm">
                    <span className="text-white/70">from <b className="font-medium text-white">{money(d.startingPrice)}</b></span>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink transition group-hover:rotate-45 group-hover:bg-accent group-hover:text-white"><ArrowUpRight /></span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
