"use client";
import Link from "next/link";
import { motion } from "motion/react";
import type { Tour } from "@/lib/types";
import { useSite } from "./SiteContext";
import Img from "./Img";
import { Clock, Heart, Star } from "./Icons";
import { cn } from "@/lib/utils";

export default function TourCard({ tour, className, priority }: { tour: Tour; className?: string; priority?: boolean }) {
  const { money, wishlist, toggleWish } = useSite();
  const wished = wishlist.includes(tour.slug);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative", className)}
    >
      <Link href={`/tours/${tour.slug}`} className="block" data-cursor="View">
        <div className="r-xl relative aspect-[4/5] overflow-hidden bg-line">
          <Img
            src={tour.image}
            w={900}
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            alt={tour.title}
            priority={priority}
            className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10" />
          <div className="absolute left-4 top-4 flex gap-1.5">
            <span className="glass rounded-full px-3 py-1 text-[11px] font-medium">{tour.category}</span>
            {tour.oldPrice && <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-white">Save {Math.round((1 - tour.price / tour.oldPrice) * 100)}%</span>}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="flex items-center gap-1"><Clock /> {tour.days} days</span>
              <span className="flex items-center gap-1"><Star className="text-amber-300" /> {tour.rating.toFixed(1)} <span className="text-white/50">({tour.reviews})</span></span>
            </div>
            <h3 className="mt-2 text-[1.45rem] font-medium leading-[1.05] tracking-[-0.03em]">{tour.title}</h3>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-sm text-white/75">
                from <span className="text-lg font-medium text-white">{money(tour.price)}</span>
                {tour.oldPrice && <span className="ml-2 text-xs text-white/50 line-through">{money(tour.oldPrice)}</span>}
              </p>
              <span className="translate-y-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                Explore
              </span>
            </div>
          </div>
        </div>
      </Link>
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => toggleWish(tour.slug)}
        aria-pressed={wished}
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        className={cn(
          "absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-lg transition-colors",
          wished ? "bg-accent text-white" : "glass text-ink hover:bg-white",
        )}
      >
        <Heart filled={wished} />
      </motion.button>
    </motion.article>
  );
}
