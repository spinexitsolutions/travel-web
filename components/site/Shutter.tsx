"use client";
import { motion } from "motion/react";
import Img from "./Img";

const ease = [0.76, 0, 0.24, 1] as const;

/**
 * Full-bleed image that arrives as a staggered "shutter" of vertical slices.
 * Pass `prev` to keep the outgoing image underneath while the new one slides in.
 */
export default function Shutter({
  src,
  prev,
  alt = "",
  strips = 7,
  play = true,
  zoom = 8,
  priority,
}: {
  src: string;
  prev?: string | null;
  alt?: string;
  strips?: number;
  play?: boolean;
  zoom?: number;
  priority?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {prev && <Img src={prev} w={2200} alt="" className="absolute inset-0 h-full w-full scale-[1.06] object-cover" />}
      <motion.div
        key={src}
        className="absolute inset-0"
        initial={{ scale: 1.16 }}
        animate={play ? { scale: 1.04 } : { scale: 1.16 }}
        transition={{ duration: zoom, ease: "linear" }}
      >
        {Array.from({ length: strips }).map((_, k) => (
          <motion.div
            key={k}
            className="absolute top-0 h-full overflow-hidden"
            style={{ left: `${(k * 100) / strips}%`, width: `calc(${100 / strips}% + 1px)` }}
            initial={{ clipPath: k % 2 ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)" }}
            animate={play ? { clipPath: "inset(0% 0 0% 0)" } : undefined}
            transition={{ duration: 1.25, ease, delay: Math.abs(k - (strips - 1) / 2) * 0.06 }}
          >
            <div className="absolute top-0 h-full" style={{ left: `-${k * 100}%`, width: `${strips * 100}%` }}>
              <Img src={src} w={2200} alt={k === 0 ? alt : ""} priority={priority} className="h-full w-full object-cover" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
