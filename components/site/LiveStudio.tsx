"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Img from "./Img";

/** Live Mumbai clock + open/closed status for the studio. */
export default function LiveStudio({ avatars }: { avatars: string[] }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const t = now ? new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })) : null;
  const h = t?.getHours() ?? 12;
  const day = t?.getDay() ?? 1;
  const open = day !== 0 && h >= 10 && h < 19;
  const fmt = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="relative overflow-hidden r-xl bg-night p-6 text-paper md:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent opacity-25 blur-3xl" />
      <p className="font-mono text-[11px] uppercase tracking-wider text-paper/55">Studio · Mumbai</p>
      <p className="display mt-4 text-7xl tabular-nums md:text-8xl">
        {t ? `${fmt(t.getHours())}:${fmt(t.getMinutes())}` : "--:--"}
        <motion.span key={t?.getSeconds()} initial={{ opacity: 0.2 }} animate={{ opacity: 1 }} className="ml-2 align-top font-mono text-lg text-paper/50">
          {t ? fmt(t.getSeconds()) : "--"}
        </motion.span>
      </p>
      <p className="mt-4 flex items-center gap-2 text-sm">
        <span className="relative flex h-2.5 w-2.5">
          {open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${open ? "bg-emerald-400" : "bg-amber-400"}`} />
        </span>
        {open ? "Studio open — planners usually reply within 2 hours" : "Studio closed — we'll write first thing tomorrow"}
      </p>
      <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
        <div className="flex -space-x-2">
          {avatars.map((a, k) => (
            <span key={k} className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-[var(--night)]"><Img src={a} w={80} alt="" className="h-full w-full object-cover" /></span>
          ))}
        </div>
        <p className="text-sm text-paper/65">{avatars.length} planners on duty · Mon–Sat, 10–19 IST</p>
      </div>
    </div>
  );
}
