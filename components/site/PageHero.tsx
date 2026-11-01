"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Img from "./Img";
import Shutter from "./Shutter";
import { useSite } from "./SiteContext";
import { cn } from "@/lib/utils";

const soft = [0.22, 1, 0.36, 1] as const;

type Crumb = { label: string; href?: string };
type Meta = { label: string; value: string };

function Title({ title, accent, play, light, className }: { title: string; accent?: string; play: boolean; light?: boolean; className?: string }) {
  const parts = [title, accent].filter(Boolean) as string[];
  let n = 0;
  return (
    <h1 className={cn("display", className)} aria-label={parts.join(" ")}>
      {parts.map((p, pi) => (
        <span key={pi} className={cn(pi === 1 && cn("hl", light && "hero-hl"))}>
          {p.split(" ").map((w, wi) => {
            const d = 0.15 + n++ * 0.07;
            return (
              <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
                <motion.span className="inline-block" initial={{ y: "110%" }} animate={play ? { y: "0%" } : {}} transition={{ duration: 1.1, ease: soft, delay: d }}>
                  {w}&nbsp;
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

function Crumbs({ items, light }: { items?: Crumb[]; light?: boolean }) {
  if (!items?.length) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider", light ? "text-white/70" : "text-mute")}>
      {items.map((c, k) => (
        <span key={k} className="flex items-center gap-2">
          {c.href ? <Link href={c.href} className="link-u hover:opacity-100">{c.label}</Link> : <span className={light ? "text-white" : "text-ink"}>{c.label}</span>}
          {k < items.length - 1 && <span className="opacity-50">/</span>}
        </span>
      ))}
    </nav>
  );
}

/**
 * Page header in three flavours:
 * - `image`  → cinematic full-bleed with shutter reveal, settles into a card on scroll
 * - `images` → typographic title + two drifting columns of photographs
 * - neither  → pure typographic
 */
export default function PageHero({
  eyebrow,
  title,
  accent,
  sub,
  image,
  images,
  crumbs,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  sub?: string;
  image?: string;
  images?: string[];
  crumbs?: Crumb[];
  meta?: Meta[];
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { introDone } = useSite();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const radius = useTransform(scrollYProgress, [0, 0.5], [0, 36]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const colA = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const colB = useTransform(scrollYProgress, [0, 1], ["-20%", "10%"]);

  /* ── Cinematic ── */
  if (image) {
    return (
      <section ref={ref} data-nav-overlay className="relative h-[92svh] min-h-[600px] bg-paper">
        <motion.div style={{ scale, borderRadius: radius }} className="relative h-full origin-top overflow-hidden bg-night text-white">
          <Shutter src={image} play={introDone} priority />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.78)_0%,rgba(0,0,0,.2)_45%,rgba(0,0,0,.35)_100%)]" />
          <motion.div style={{ y: contentY, opacity: fade }} className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col px-5 pb-8 pt-[110px] md:px-10 md:pb-12 md:pt-[124px]">
            <Crumbs items={crumbs} light />
            <div className="mt-auto">
              <motion.p initial={{ opacity: 0, y: 10 }} animate={introDone ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: soft, delay: 0.1 }} className="eyebrow text-white/75">
                {eyebrow}
              </motion.p>
              <Title title={title} accent={accent} play={introDone} light className="mt-4 max-w-[16ch] text-[13vw] text-white md:text-[min(8vw,8.5rem)]" />
              <div className="mt-6 grid items-end gap-6 md:grid-cols-[1fr_auto]">
                {sub ? (
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={introDone ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, ease: soft, delay: 0.5 }} className="max-w-xl text-white/80 md:text-lg">
                    {sub}
                  </motion.p>
                ) : <span />}
                {meta && (
                  <motion.dl
                    initial={{ opacity: 0, y: 16 }}
                    animate={introDone ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.9, ease: soft, delay: 0.6 }}
                    className="flex flex-wrap divide-x divide-white/15 rounded-2xl border border-white/15 bg-black/25 backdrop-blur-xl"
                  >
                    {meta.map((m) => (
                      <div key={m.label} className="px-4 py-3 md:px-6">
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-white/55">{m.label}</dt>
                        <dd className="mt-1 text-[15px] font-semibold md:text-lg">{m.value}</dd>
                      </div>
                    ))}
                  </motion.dl>
                )}
              </div>
              {children}
            </div>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  /* ── Collage / typographic ── */
  const cols = images && images.length >= 4 ? [images.filter((_, k) => k % 2 === 0), images.filter((_, k) => k % 2 === 1)] : null;
  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className={cn("mx-auto grid max-w-[1440px] gap-10 px-5 pb-12 pt-32 md:px-10 md:pb-16 md:pt-40", cols && "md:min-h-[86svh] md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-center md:pt-24")}>
        <div className="min-w-0">
          <Crumbs items={crumbs} />
          <motion.p initial={{ opacity: 0, y: 10 }} animate={introDone ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: soft }} className="eyebrow mt-6 text-mute">
            {eyebrow}
          </motion.p>
          <Title title={title} accent={accent} play={introDone} className="mt-5 max-w-[14ch] text-[14vw] md:text-[min(7.6vw,8rem)]" />
          {sub && (
            <motion.p initial={{ opacity: 0, y: 12 }} animate={introDone ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, ease: soft, delay: 0.45 }} className="mt-6 max-w-xl text-lg text-mute">
              {sub}
            </motion.p>
          )}
          {meta && (
            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
              {meta.map((m) => (
                <div key={m.label}>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-mute">{m.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">{m.value}</p>
                </div>
              ))}
            </div>
          )}
          {children}
        </div>
        {cols && (
          <div className="relative -mx-5 grid h-[52svh] grid-cols-2 gap-3 overflow-hidden px-5 [mask-image:linear-gradient(180deg,transparent,#000_12%,#000_88%,transparent)] md:mx-0 md:h-[86svh] md:px-0">
            {cols.map((c, ci) => (
              <motion.div key={ci} style={{ y: ci ? colB : colA }} className="flex flex-col gap-3">
                {[...c, ...c].map((src, k) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, y: 60 }}
                    animate={introDone ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1.1, ease: soft, delay: 0.2 + k * 0.08 + ci * 0.15 }}
                    className={cn("overflow-hidden r-lg", k % 3 === 1 ? "aspect-[4/5]" : "aspect-[4/3]")}
                  >
                    <Img src={src} w={600} alt="" className="h-full w-full object-cover" />
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
