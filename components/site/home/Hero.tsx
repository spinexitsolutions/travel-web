"use client";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSite } from "../SiteContext";
import Img from "../Img";
import { SplitReveal } from "../Reveal";
import { ArrowRight, Calendar, Pin, Search, Users } from "../Icons";

const ease = [0.22, 1, 0.36, 1] as const;
const MONTHS = ["Any month", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Hero({ destinations }: { destinations: string[] }) {
  const { settings, introDone } = useSite();
  const h = settings.hero;
  const slides = h.slides.length ? h.slides : [{ image: settings.intro.images[0], caption: "" }];
  const [i, setI] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const [where, setWhere] = useState("");
  const [month, setMonth] = useState("Any month");
  const [guests, setGuests] = useState(2);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const radius = useTransform(scrollYProgress, [0, 1], [0, 48]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    if (!introDone) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 6500);
    return () => clearInterval(id);
  }, [introDone, slides.length]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (where) p.set("q", where);
    if (month !== "Any month") p.set("month", month);
    if (guests) p.set("guests", String(guests));
    router.push(`/tours?${p.toString()}`);
  }

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] bg-paper">
      <motion.div style={{ scale, borderRadius: radius }} className="relative h-full w-full origin-top overflow-hidden bg-night">
        {/* slides */}
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 1, scale: 1.02 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.4, ease: "easeInOut" }, scale: { duration: 8, ease: "linear" } }}
            >
              <Img src={slides[i].image} w={2200} alt={slides[i].caption} priority className="h-full w-full object-cover" />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="grain absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.35)_0%,rgba(0,0,0,0)_30%,rgba(0,0,0,.05)_55%,rgba(0,0,0,.65)_100%)]" />

        {/* content */}
        <motion.div
          style={{ y: textY, opacity: fade }}
          className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-28 pt-24 text-white md:px-10 md:pb-16"
        >
          <motion.p
            className="eyebrow mb-5 flex items-center gap-2 text-white/80"
            initial={{ opacity: 0, y: 10 }}
            animate={introDone ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {h.eyebrow}
          </motion.p>
          <h1 className="display max-w-[14ch] text-[15vw] sm:text-[12vw] md:text-[9.2vw] xl:text-[8.4rem]">
            <SplitReveal text={h.titleTop} play={introDone} delay={0.15} />{" "}
            <span className="serif-i text-accent">
              <SplitReveal text={h.titleAccent} play={introDone} delay={0.35} />
            </span>{" "}
            <SplitReveal text={h.titleBottom} play={introDone} delay={0.45} />
          </h1>

          <div className="mt-8 grid items-end gap-6 md:grid-cols-[1fr_auto]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={introDone ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease, delay: 0.7 }}
            >
              <p className="max-w-md text-[15px] leading-relaxed text-white/80 md:text-base">{h.subtitle}</p>

              {/* Search capsule */}
              <form
                onSubmit={search}
                className="glass mt-6 grid w-full max-w-3xl grid-cols-2 gap-1 rounded-[26px] p-1.5 text-ink md:flex md:items-center md:rounded-full"
              >
                <label className="col-span-2 flex items-center gap-3 rounded-full px-4 py-2.5 transition hover:bg-white/50 md:flex-[1.4]">
                  <Pin className="shrink-0 text-lg text-accent" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-mute">Where to</span>
                    <input
                      list="dest-list"
                      value={where}
                      onChange={(e) => setWhere(e.target.value)}
                      placeholder="Anywhere"
                      className="w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-ink/70"
                    />
                    <datalist id="dest-list">{destinations.map((d) => <option key={d} value={d} />)}</datalist>
                  </span>
                </label>
                <span className="hidden h-8 w-px bg-ink/10 md:block" />
                <label className="flex items-center gap-3 rounded-full px-4 py-2.5 transition hover:bg-white/50 md:flex-1">
                  <Calendar className="shrink-0 text-lg text-accent" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-mute">When</span>
                    <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full appearance-none bg-transparent text-[15px] font-medium outline-none">
                      {MONTHS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </span>
                </label>
                <span className="hidden h-8 w-px bg-ink/10 md:block" />
                <div className="flex items-center gap-3 rounded-full px-4 py-2.5 md:flex-1">
                  <Users className="shrink-0 text-lg text-accent" />
                  <span className="flex flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-mute">Guests</span>
                    <span className="flex items-center gap-2 text-[15px] font-medium">
                      <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-5 w-5 place-items-center rounded-full bg-ink/10 text-xs">−</button>
                      <span className="w-4 text-center tabular-nums">{guests}</span>
                      <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(20, g + 1))} className="grid h-5 w-5 place-items-center rounded-full bg-ink/10 text-xs">+</button>
                    </span>
                  </span>
                </div>
                <button className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-paper transition hover:bg-accent md:col-span-1 md:h-14">
                  <Search className="text-base" /> Search
                </button>
              </form>
            </motion.div>

            {/* slide indicator */}
            <motion.div
              className="hidden min-w-[240px] md:mr-20 md:block"
              initial={{ opacity: 0 }}
              animate={introDone ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
            >
              <div className="flex items-baseline justify-between font-mono text-[11px] text-white/70">
                <span>{String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
                <AnimatePresence mode="wait">
                  <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    {slides[i].caption}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="mt-2 flex gap-1.5">
                {slides.map((_, k) => (
                  <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                    {k === i && (
                      <motion.span
                        key={`p${i}`}
                        className="absolute inset-y-0 left-0 bg-white"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 6.5, ease: "linear" }}
                      />
                    )}
                    {k < i && <span className="absolute inset-0 bg-white/70" />}
                  </button>
                ))}
              </div>
              <a href="#discover" className="mt-6 flex items-center gap-2 text-sm text-white/80 hover:text-white">
                Scroll to discover <ArrowRight className="rotate-90" />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
