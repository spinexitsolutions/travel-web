"use client";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import { useState } from "react";
import Img from "./Img";
import { ArrowUpRight } from "./Icons";

const soft = [0.22, 1, 0.36, 1] as const;

export type HoverRow = {
  key: string;
  href: string;
  image: string;
  title: string;
  sub?: string; // shown on mobile under the title
  cells: string[]; // extra desktop columns
  badge?: string; // shown on the floating preview
};

/**
 * Editorial index list: the row under the cursor floods with the accent
 * colour and a photo of that row follows the pointer (desktop).
 */
export default function HoverList({ rows, head, template }: { rows: HoverRow[]; head: string[]; template: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 26 });
  const sy = useSpring(y, { stiffness: 220, damping: 26 });
  const rotate = useTransform(useVelocity(sx), [-1500, 1500], [-10, 10]);
  const on = (k: number) => (hover === k ? { color: "var(--on-accent)" } : undefined);

  return (
    <div className="relative" onPointerMove={(e) => { x.set(e.clientX); y.set(e.clientY); }} onPointerLeave={() => setHover(null)}>
      <div className="hidden gap-4 border-b border-line pb-3 font-mono text-[10.5px] uppercase tracking-wider text-mute md:grid" style={{ gridTemplateColumns: template }}>
        {head.map((h, k) => <span key={k} className={k === head.length - 1 ? "text-right" : ""}>{h}</span>)}
        <span />
      </div>
      <ul>
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((r, k) => (
            <motion.li
              key={r.key}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: soft, delay: Math.min(k, 8) * 0.03 }}
              onPointerEnter={() => setHover(k)}
              className="relative border-b border-line"
            >
              <Link href={r.href} className="relative block py-4 md:py-6">
                <motion.span className="absolute inset-0 origin-bottom bg-accent" initial={false} animate={{ scaleY: hover === k ? 1 : 0 }} transition={{ duration: 0.5, ease: soft }} />
                {/* mobile */}
                <span className="relative flex items-center gap-4 md:hidden">
                  <span className="h-16 w-16 shrink-0 overflow-hidden rounded-lg"><Img src={r.image} w={140} alt="" className="h-full w-full object-cover" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-semibold tracking-tight">{r.title}</span>
                    {r.sub && <span className="mt-0.5 block truncate text-xs text-mute">{r.sub}</span>}
                  </span>
                  <ArrowUpRight className="shrink-0 text-lg" />
                </span>
                {/* desktop */}
                <span className="relative hidden items-center gap-4 md:grid" style={{ gridTemplateColumns: template }}>
                  <span className="font-mono text-xs" style={on(k)}>{String(k + 1).padStart(2, "0")}</span>
                  <motion.span animate={{ x: hover === k ? 14 : 0 }} transition={{ duration: 0.5, ease: soft }} className="block truncate text-[2rem] font-semibold leading-none tracking-[-0.03em]" style={on(k)}>
                    {r.title}
                  </motion.span>
                  {r.cells.map((c, ci) => (
                    <span key={ci} className={ci === r.cells.length - 1 ? "text-right text-lg font-semibold tabular-nums" : "truncate text-sm"} style={on(k)}>{c}</span>
                  ))}
                  <span
                    className="grid h-11 w-11 place-items-center justify-self-end rounded-full border border-line"
                    style={hover === k ? { borderColor: "transparent", background: "var(--on-accent)", color: "var(--accent)" } : undefined}
                  >
                    <motion.span animate={{ rotate: hover === k ? 45 : 0 }}><ArrowUpRight /></motion.span>
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <motion.div style={{ left: sx, top: sy, rotate }} className="pointer-events-none fixed z-40 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        <AnimatePresence>
          {hover !== null && rows[hover] && (
            <motion.div
              key="pv"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.4, ease: soft }}
              className="relative h-[230px] w-[320px] overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)]"
            >
              {rows.map((r, k) => (
                <motion.div key={r.key} className="absolute inset-0" animate={{ opacity: hover === k ? 1 : 0, scale: hover === k ? 1 : 1.15 }} transition={{ duration: 0.5, ease: soft }}>
                  <Img src={r.image} w={700} alt="" className="h-full w-full object-cover" />
                </motion.div>
              ))}
              {rows[hover].badge && (
                <span className="absolute bottom-3 left-3 rounded-md bg-black/45 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur">{rows[hover].badge}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
