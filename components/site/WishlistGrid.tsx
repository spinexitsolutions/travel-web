"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Tour } from "@/lib/types";
import { useSite } from "./SiteContext";
import TourCard from "./TourCard";

export default function WishlistGrid({ tours }: { tours: Tour[] }) {
  const { wishlist, money } = useSite();
  const saved = tours.filter((t) => wishlist.includes(t.slug));
  const total = saved.reduce((a, t) => a + t.price, 0);
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
      {saved.length === 0 ? (
        <div className="r-xl border border-dashed border-line px-6 py-24 text-center">
          <p className="hl text-5xl">Nothing saved yet.</p>
          <p className="mt-3 text-mute">Tap the heart on any journey to keep it here.</p>
          <Link href="/tours" className="mt-8 inline-flex rounded-md bg-ink px-6 py-3 text-sm text-paper hover:bg-accent">Browse journeys</Link>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-mute">{saved.length} saved · from {money(total)} combined per person</p>
            <Link href={`/contact?destination=${encodeURIComponent(saved.map((s) => s.title).join(", "))}`} className="rounded-md bg-ink px-5 py-3 text-sm text-paper hover:bg-accent">Plan these together</Link>
          </div>
          <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">{saved.map((t) => <TourCard key={t.id} tour={t} />)}</AnimatePresence>
          </motion.div>
        </>
      )}
    </section>
  );
}
