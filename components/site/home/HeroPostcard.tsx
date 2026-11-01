"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSite } from "../SiteContext";
import Img from "../Img";
import { ArrowRight } from "../Icons";

const soft = [0.22, 1, 0.36, 1] as const;

/**
 * Postcard hero — a hand-dealt stack of postcards that shuffles itself
 * (or can be flicked away), beside a big friendly headline with a
 * highlighter-marked accent word and an "address line" search.
 */
export default function HeroPostcard({ destinations }: { destinations: string[] }) {
  const { settings, introDone } = useSite();
  const h = settings.hero;
  const slides = h.slides.length ? h.slides : [{ image: settings.intro.images[0], caption: "Somewhere" }];
  const [order, setOrder] = useState(() => slides.map((_, k) => k));
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const [to, setTo] = useState("");

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const stackY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const stackR = useTransform(scrollYProgress, [0, 1], [0, -8]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  const next = () => setOrder((o) => [...o.slice(1), o[0]]);

  useEffect(() => {
    if (!introDone || paused) return;
    const id = setInterval(next, 4200);
    return () => clearInterval(id);
  }, [introDone, paused]);

  const top = slides[order[0]];
  const words = (s: string) => s.split(" ");
  let wi = 0;
  const renderWords = (text: string, className?: string) => (
    <>
      {words(text).map((w, k) => {
        const d = 0.12 + wi++ * 0.07;
        return (
          <span key={k} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span
              className={`inline-block ${className ?? ""}`}
              initial={{ y: "110%", rotate: 6 }}
              animate={introDone ? { y: "0%", rotate: 0 } : {}}
              transition={{ duration: 1.1, ease: soft, delay: d }}
            >
              {w}&nbsp;
            </motion.span>
          </span>
        );
      })}
    </>
  );

  return (
    <section ref={ref} className="dots relative overflow-hidden pb-14 pt-24 md:min-h-[100svh] md:pb-10 md:pt-28">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] items-center gap-10 px-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:px-10">
        {/* ── Copy ── */}
        <motion.div style={{ y: textY }} className="relative z-10 min-w-0">
          <motion.div
            initial={{ opacity: 0, rotate: -8, scale: 0.8 }}
            animate={introDone ? { opacity: 1, rotate: -4, scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-[4px] border-2 border-dashed border-accent px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-accent"
          >
            <span className="h-2 w-2 rounded-full bg-accent" /> {h.eyebrow}
          </motion.div>
          <h1 className="display text-[15vw] md:text-[min(8.4vw,8.6rem)]">
            {renderWords(h.titleTop)} <span className="hl inline-block">{renderWords(h.titleAccent)}</span>
            <br className="hidden md:block" /> {renderWords(h.titleBottom)}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={introDone ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: soft, delay: 0.6 }}
            className="mt-6 max-w-md text-[17px] leading-relaxed text-ink/70"
          >
            {h.subtitle}
          </motion.p>

          {/* address-line search */}
          <motion.form
            onSubmit={(e) => { e.preventDefault(); router.push(`/tours${to ? `?q=${encodeURIComponent(to)}` : ""}`); }}
            initial={{ opacity: 0, y: 20 }}
            animate={introDone ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: soft, delay: 0.75 }}
            className="mt-8 max-w-xl"
          >
            <label className="font-mono text-[11px] uppercase tracking-wider text-mute">Send me to —</label>
            <div className="mt-1 flex items-end gap-3 border-b-2 border-ink pb-2">
              <input
                list="pc-dest"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="somewhere warm…"
                className="w-0 min-w-0 flex-1 bg-transparent font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.03em] outline-none placeholder:text-ink/25 md:text-4xl"
              />
              <datalist id="pc-dest">{destinations.map((d) => <option key={d} value={d} />)}</datalist>
              <button className="group flex shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition hover:bg-ink hover:text-paper">
                Go <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {destinations.slice(0, 5).map((d, k) => (
                <motion.button
                  type="button"
                  key={d}
                  onClick={() => setTo(d)}
                  whileHover={{ rotate: k % 2 ? 3 : -3, y: -2 }}
                  className="rounded-full border border-ink/15 bg-white/60 px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-accent hover:text-accent"
                >
                  {d}
                </motion.button>
              ))}
            </div>
          </motion.form>
        </motion.div>

        {/* ── Postcard stack ── */}
        <motion.div
          style={{ y: stackY, rotate: stackR }}
          className="relative mx-auto aspect-[4/5] w-[78vw] max-w-[460px] md:w-full"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {order.slice(0, 4).reverse().map((idx) => {
            const depth = order.indexOf(idx); // 0 = top
            const s = slides[idx];
            const rot = [-3, 4, -7, 8][depth] ?? 0;
            const isTop = depth === 0;
            return (
              <motion.div
                key={idx}
                className="absolute inset-0"
                style={{ zIndex: 10 - depth }}
                initial={{ opacity: 0, y: 120, rotate: rot * 3 }}
                animate={introDone ? { opacity: 1, y: depth * -10, x: depth * 14, rotate: rot, scale: 1 - depth * 0.04 } : {}}
                transition={{ type: "spring", stiffness: 140, damping: 20, delay: introDone ? 0 : 0.3 + depth * 0.1 }}
                drag={isTop}
                dragSnapToOrigin
                dragElastic={0.6}
                onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 90 || Math.abs(info.offset.y) > 90) next(); }}
                whileDrag={{ scale: 1.03, rotate: rot + 6, cursor: "grabbing" }}
              >
                <div className={`flex h-full flex-col rounded-[6px] bg-white p-3 shadow-[0_30px_60px_-25px_rgba(40,25,10,.45)] ${isTop ? "cursor-grab" : ""}`}>
                  <div className="relative min-h-0 flex-1 overflow-hidden rounded-[3px]">
                    <Img src={s.image} w={900} alt={s.caption} priority={depth < 2} className="pointer-events-none h-full w-full object-cover" />
                    <span className="absolute left-3 top-3 font-[family-name:var(--font-display)] text-[13px] font-semibold uppercase tracking-wide text-white drop-shadow">Greetings from</span>
                  </div>
                  <div className="flex items-end justify-between gap-3 pt-3 text-ink">
                    <div className="min-w-0">
                      <p className="truncate font-[family-name:var(--font-display)] text-2xl font-bold leading-none tracking-[-0.04em] md:text-3xl">{s.caption.split(",")[0]}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink/50">{s.caption.split(",")[1]?.trim() ?? "Somewhere"} · Postcard {String(idx + 1).padStart(2, "0")}</p>
                    </div>
                    {/* postmark */}
                    <svg viewBox="0 0 80 80" className="h-14 w-14 shrink-0 text-accent opacity-80" aria-hidden>
                      <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="40" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
                      <text x="40" y="37" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="currentColor">{settings.brand.name.toUpperCase()}</text>
                      <text x="40" y="49" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor">AIR MAIL</text>
                    </svg>
                  </div>
                </div>
                {/* stamp */}
                <div className="stamp absolute -right-3 -top-4 w-[22%] rotate-6 shadow-sm">
                  <div className="aspect-[4/5] overflow-hidden">
                    <Img src={slides[(idx + 1) % slides.length].image} w={200} alt="" className="pointer-events-none h-full w-full object-cover" />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* hint + counter */}
          <div className="absolute -bottom-10 left-0 right-0 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-mute">
            <span>← drag to shuffle →</span>
            <AnimatePresence mode="wait">
              <motion.span key={top.caption} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                {String(order[0] + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* bottom ribbon */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={introDone ? { opacity: 1 } : {}}
        transition={{ delay: 1 }}
        className="mx-auto mt-20 flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 text-sm md:mt-12 md:px-10"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {settings.intro.images.slice(0, 4).map((src, k) => (
              <span key={k} className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-paper"><Img src={src} w={80} alt="" className="h-full w-full object-cover" /></span>
            ))}
          </div>
          <span className="text-ink/70"><b className="font-semibold text-ink">12,000+</b> travellers sent home with stories</span>
        </div>
        <Link href="/contact" className="link-u font-semibold text-accent">{h.ctaLabel} →</Link>
      </motion.div>
    </section>
  );
}
