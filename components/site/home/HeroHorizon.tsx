"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSite } from "../SiteContext";
import Img from "../Img";
import { ArrowRight, Search } from "../Icons";
import { img } from "@/lib/utils";

const soft = [0.22, 1, 0.36, 1] as const;

/**
 * Horizon hero — the destination's name is set huge, with the photograph
 * living *inside* the letters. A glowing horizon line sits beneath.
 * On scroll you fly into the type until the full image takes over.
 */
export default function HeroHorizon({ destinations }: { destinations: string[] }) {
  const { settings, introDone } = useSite();
  const h = settings.hero;
  const slides = h.slides.length ? h.slides : [{ image: settings.intro.images[0], caption: "Somewhere, Earth" }];
  const [i, setI] = useState(0);
  const [vw, setVw] = useState(1440);
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const [q, setQ] = useState("");

  useEffect(() => {
    const f = () => setVw(window.innerWidth);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  useEffect(() => {
    if (!introDone) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 5600);
    return () => clearInterval(id);
  }, [introDone, slides.length]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const zoom = useTransform(scrollYProgress, [0.05, 0.75], [1, 26]);
  const bgOpacity = useTransform(scrollYProgress, [0.3, 0.62], [0, 1]);
  const uiFade = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const arrive = useTransform(scrollYProgress, [0.78, 0.95], [0, 1]);
  const arriveY = useTransform(scrollYProgress, [0.78, 0.95], [40, 0]);
  const arrivePE = useTransform(arrive, (v) => (v > 0.5 ? "auto" : "none"));

  const place = (slides[i].caption.split(",")[1] ?? slides[i].caption).trim().toUpperCase();
  // fit the word to ~92% of the viewport width (Unbounded ≈ 0.86em per capital)
  const fontPx = Math.min(vw * 0.3, (vw * 0.92) / Math.max(3, place.length * 0.86));

  return (
    <section ref={ref} className="relative h-[240svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-paper">
        {/* ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-[58%] h-[50vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-accent opacity-[0.10] blur-[120px]" />

        {/* full image (revealed as you fly through the letters) */}
        <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 z-0">
          <Img src={slides[i].image} w={2200} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        </motion.div>

        {/* headline line */}
        <motion.div style={{ opacity: uiFade }} className="absolute inset-x-0 top-[13svh] z-20 px-5 md:top-[15svh] md:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-mute">{h.eyebrow}</p>
              <h1 className="display mt-4 text-[9vw] md:text-[3.6vw]">
                <motion.span className="inline-block" initial={{ opacity: 0, y: 20 }} animate={introDone ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease: soft, delay: 0.1 }}>
                  {h.titleTop}
                </motion.span>{" "}
                <motion.span className="hl inline-block" initial={{ opacity: 0, y: 20 }} animate={introDone ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease: soft, delay: 0.2 }}>
                  {h.titleAccent}
                </motion.span>{" "}
                <motion.span className="inline-block" initial={{ opacity: 0, y: 20 }} animate={introDone ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease: soft, delay: 0.3 }}>
                  {h.titleBottom}
                </motion.span>
              </h1>
            </div>
            <motion.p initial={{ opacity: 0 }} animate={introDone ? { opacity: 1 } : {}} transition={{ delay: 0.6 }} className="max-w-sm text-[15px] leading-relaxed text-ink/60 md:text-right">
              {h.subtitle}
            </motion.p>
          </div>
        </motion.div>

        {/* the masked word */}
        <div className="absolute inset-x-0 top-[50%] z-10 flex -translate-y-1/2 justify-center md:top-[54%]">
          <motion.div style={{ scale: zoom }} className="origin-[50%_55%] will-change-transform">
            <AnimatePresence mode="wait">
              <motion.div
                key={place}
                className="flex select-none"
                style={{ fontSize: fontPx }}
                initial="hide"
                animate={introDone ? "show" : "hide"}
                exit="out"
              >
                {place.split("").map((c, k) => (
                  <motion.span
                    key={k}
                    variants={{
                      hide: { y: "60%", opacity: 0, filter: "blur(12px)" },
                      show: { y: "0%", opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: soft, delay: k * 0.05 } },
                      out: { y: "-40%", opacity: 0, filter: "blur(12px)", transition: { duration: 0.45, delay: k * 0.025 } },
                    }}
                    className="inline-block font-[family-name:var(--font-display)] font-black leading-[0.85] tracking-[-0.04em] text-transparent [-webkit-background-clip:text] [background-clip:text]"
                    style={{
                      backgroundImage: `url(${img(slides[i].image, 1800)})`,
                      backgroundSize: `${place.length * 100}% 140%`,
                      backgroundPosition: `${(k / Math.max(1, place.length - 1)) * 100}% 50%`,
                    }}
                  >
                    {c === " " ? " " : c}
                  </motion.span>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* horizon line */}
        <motion.div style={{ opacity: uiFade }} className="absolute inset-x-0 top-[63%] z-10 md:top-[77%]">
          <motion.div initial={{ scaleX: 0 }} animate={introDone ? { scaleX: 1 } : {}} transition={{ duration: 1.6, ease: soft, delay: 0.3 }} className="glow-line mx-auto w-[86%]" />
        </motion.div>

        {/* bottom rail: destinations + search */}
        <motion.div style={{ opacity: uiFade }} className="absolute inset-x-0 bottom-[max(16px,3svh)] z-20 px-4 md:px-10">
          <div className="flex flex-col-reverse items-stretch gap-3 md:flex-row md:items-end md:justify-between">
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {slides.map((s, k) => (
                <button
                  key={k}
                  onClick={() => setI(k)}
                  className={`group flex shrink-0 items-center gap-2.5 rounded-full border p-1 pr-4 text-left transition ${k === i ? "border-accent bg-accent/10 shadow-glow" : "border-white/10 hover:border-white/30"}`}
                >
                  <span className="h-9 w-9 overflow-hidden rounded-full"><Img src={s.image} w={100} alt="" className="h-full w-full object-cover" /></span>
                  <span className="text-[12px] leading-tight">
                    <span className={`block font-semibold ${k === i ? "text-accent" : "text-ink"}`}>{(s.caption.split(",")[1] ?? s.caption).trim()}</span>
                    <span className="block text-ink/50">{s.caption.split(",")[0]}</span>
                  </span>
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); router.push(`/tours${q ? `?q=${encodeURIComponent(q)}` : ""}`); }}
              className="glass flex items-center gap-2 rounded-full p-1.5 pl-5 md:w-[380px]"
            >
              <Search className="shrink-0 text-ink/50" />
              <input list="hz-dest" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Where does your horizon end?" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/40" />
              <datalist id="hz-dest">{destinations.map((d) => <option key={d} value={d} />)}</datalist>
              <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition hover:scale-105" aria-label="Search"><ArrowRight /></button>
            </form>
          </div>
        </motion.div>

        {/* arrival */}
        <motion.div style={{ opacity: arrive, y: arriveY }} className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end p-5 pb-10 text-white md:p-10">
          <p className="eyebrow text-white/70">You&apos;ve arrived</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-[12vw] font-semibold uppercase leading-[0.9] tracking-[-0.04em] md:text-[7vw]">{slides[i].caption.split(",")[0]}</p>
          <motion.div style={{ pointerEvents: arrivePE }} className="mt-6 flex gap-3">
            <Link href="/tours" className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent">Explore journeys <ArrowRight /></Link>
            <Link href="/contact" className="rounded-full border border-white/40 px-5 py-3 text-sm">{h.ctaLabel}</Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
