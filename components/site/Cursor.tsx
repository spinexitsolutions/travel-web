"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/** Desktop-only follower that becomes a labelled bubble over [data-cursor] elements. */
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(el?.dataset.cursor ?? null);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[95] grid place-items-center rounded-full bg-accent text-[11px] font-medium uppercase tracking-wider text-on-accent"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{ width: label ? 88 : 0, height: label ? 88 : 0, opacity: label ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {label && <span>{label}</span>}
    </motion.div>
  );
}
