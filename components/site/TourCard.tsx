"use client";
import Link from "next/link";
import { motion } from "motion/react";
import type { Tour } from "@/lib/types";
import { useSite } from "./SiteContext";
import Img from "./Img";
import { ArrowUpRight, Heart, Star } from "./Icons";
import { cn } from "@/lib/utils";

export default function TourCard({ tour, className, priority }: { tour: Tour; className?: string; priority?: boolean }) {
  const { money, wishlist, toggleWish } = useSite();
  const wished = wishlist.includes(tour.slug);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative", className)}
    >
      <Link href={`/tours/${tour.slug}`} className="block" data-cursor="View">
        <div className="r-xl relative aspect-[4/5] overflow-hidden bg-line">
          <div className="absolute inset-0 transition-[clip-path] duration-700 ease-[cubic-bezier(.22,1,.36,1)] [clip-path:inset(0_round_var(--radius))] group-hover:[clip-path:inset(10px_round_calc(var(--radius)-4px))]">
            <Img
              src={tour.image}
              w={900}
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              alt={tour.title}
              priority={priority}
              className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
            />
          </div>
          <div className="absolute left-3 top-3 flex gap-1.5">
            <span className="rounded-[5px] bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink">{tour.category}</span>
            {tour.oldPrice && <span className="rounded-[5px] bg-accent px-2 py-1 font-mono text-[10px] uppercase text-white">−{Math.round((1 - tour.price / tour.oldPrice) * 100)}%</span>}
          </div>
          <span className="absolute bottom-3 right-3 grid h-11 w-11 translate-y-3 place-items-center rounded-full bg-accent text-lg text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight />
          </span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-mute">
              <span>{String(tour.days).padStart(2, "0")} days</span>
              <span className="h-px w-3 bg-ink/25" />
              <span className="flex items-center gap-1"><Star className="text-accent" />{tour.rating.toFixed(1)}</span>
              <span className="hidden sm:inline">({tour.reviews})</span>
            </p>
            <h3 className="mt-2 text-[1.35rem] font-semibold leading-[1.1] tracking-[-0.025em] transition-colors group-hover:text-accent">{tour.title}</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-[10px] uppercase text-mute">from</p>
            <p className="text-lg font-semibold tabular-nums tracking-tight">{money(tour.price)}</p>
            {tour.oldPrice && <p className="text-xs text-mute line-through">{money(tour.oldPrice)}</p>}
          </div>
        </div>
      </Link>
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => toggleWish(tour.slug)}
        aria-pressed={wished}
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        className={cn(
          "absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md text-base transition-colors",
          wished ? "bg-accent text-white" : "bg-paper/90 text-ink hover:bg-white",
        )}
      >
        <Heart filled={wished} />
      </motion.button>
    </motion.article>
  );
}
