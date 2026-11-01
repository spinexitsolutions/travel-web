"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSite } from "./SiteContext";
import Img from "./Img";

const ease = [0.76, 0, 0.24, 1] as const;

/**
 * Intro: a framed slideshow of destinations + counter, then the frame
 * blooms to full-bleed and the curtain lifts into the hero.
 * Fully driven by settings.intro (admin → Settings → Intro).
 */
export default function Intro() {
  const { settings, setIntroDone } = useSite();
  const cfg = settings.intro;
  const [phase, setPhase] = useState<"idle" | "run" | "bloom" | "exit" | "done">(cfg.enabled ? "idle" : "done");
  const [i, setI] = useState(0);
  const [count, setCount] = useState(0);
  const images = cfg.images.length ? cfg.images : settings.hero.slides.map((s) => s.image);
  const words = cfg.words.length ? cfg.words : ["Wander"];

  useEffect(() => {
    if (!cfg.enabled) return;
    const forced = new URLSearchParams(location.search).get("intro") === "1";
    let seen = false;
    try {
      seen = sessionStorage.getItem("voyaj:intro") === "1";
    } catch {}
    if (cfg.oncePerSession && seen && !forced) {
      setPhase("done");
      setIntroDone(true);
      return;
    }
    try {
      sessionStorage.setItem("voyaj:intro", "1");
    } catch {}
    document.documentElement.dataset.introSeen = "";
    setPhase("run");
  }, [cfg.enabled, cfg.oncePerSession, setIntroDone]);

  // Drive slideshow + counter
  useEffect(() => {
    if (phase !== "run") return;
    window.__lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const total = Math.max(1.2, cfg.duration) * 1000;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total);
      const eased = 1 - Math.pow(1 - p, 2.2);
      setCount(Math.round(eased * 100));
      setI(Math.min(images.length - 1, Math.floor(eased * images.length)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setPhase("bloom");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, cfg.duration, images.length]);

  useEffect(() => {
    if (phase === "bloom") {
      const t = setTimeout(() => {
        setPhase("exit");
        setIntroDone(true);
      }, 900);
      return () => clearTimeout(t);
    }
    if (phase === "exit") {
      const t = setTimeout(() => {
        setPhase("done");
        document.documentElement.style.overflow = "";
        window.__lenis?.start();
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [phase, setIntroDone]);

  if (phase === "done") return null;

  return (
    <motion.div
      className="intro-layer fixed inset-0 z-[100] overflow-hidden bg-night text-paper"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={phase === "exit" ? { clipPath: "inset(0% 0% 100% 0%)" } : { clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: 1, ease }}
      aria-hidden
    >
      {/* top row */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 md:p-8">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-semibold text-white">
            {settings.brand.logoMark}
          </span>
          <span className="text-lg font-medium tracking-tight">{settings.brand.name}</span>
        </div>
        <span className="eyebrow text-paper/50">Composing your journey</span>
      </div>

      {/* frame */}
      <div className="absolute inset-0 grid place-items-center">
        <motion.div
          className="relative overflow-hidden"
          initial={{ width: "min(56vw, 300px)", height: "min(72vw, 400px)", borderRadius: 24, opacity: 0, y: 40 }}
          animate={
            phase === "bloom" || phase === "exit"
              ? { width: "100vw", height: "100dvh", borderRadius: 0, opacity: 1, y: 0 }
              : { width: "min(56vw, 300px)", height: "min(72vw, 400px)", borderRadius: 24, opacity: 1, y: 0 }
          }
          transition={{ duration: phase === "bloom" ? 0.9 : 0.8, ease }}
        >
          {images.map((src, k) => (
            <motion.div
              key={src + k}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: k <= i ? 1 : 0, scale: k === i ? 1 : 1.15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ zIndex: k }}
            >
              <Img src={src} w={1600} alt="" priority={k < 2} className="h-full w-full object-cover" />
            </motion.div>
          ))}
          <div className="absolute inset-0 z-50 bg-gradient-to-t from-black/30 to-transparent" />
        </motion.div>
      </div>

      {/* word */}
      <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center mix-blend-difference">
        <AnimatePresence mode="popLayout">
          {phase === "run" && (
            <motion.span
              key={words[i % words.length]}
              className="serif-i text-[18vw] leading-none text-white md:text-[11vw]"
              initial={{ y: "60%", opacity: 0, filter: "blur(10px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-60%", opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {words[i % words.length]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* bottom row */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 p-5 md:p-8"
        animate={{ opacity: phase === "run" ? 1 : 0 }}
      >
        <p className="max-w-[16rem] text-sm text-paper/60">{cfg.tagline}</p>
        <div className="font-mono text-6xl font-light tabular-nums tracking-tighter md:text-8xl">
          {String(count).padStart(3, "0")}
        </div>
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 z-20 h-[2px] bg-accent"
        style={{ width: `${count}%` }}
        animate={{ opacity: phase === "run" ? 1 : 0 }}
      />
    </motion.div>
  );
}
