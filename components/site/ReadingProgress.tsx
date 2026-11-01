"use client";
import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

/** Accent bar + percentage that track how far through the article you are. */
export default function ReadingProgress({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.3", "end 0.7"] });
  const w = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  return (
    <div ref={ref} className="relative">
      <motion.div style={{ scaleX: w }} className="fixed inset-x-0 top-0 z-[81] h-[3px] origin-left bg-accent" />
      {children}
    </div>
  );
}
