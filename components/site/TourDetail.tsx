"use client";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import type { Destination, Testimonial, Tour } from "@/lib/types";
import { useSite } from "./SiteContext";
import Img from "./Img";
import TourCard from "./TourCard";
import { Reveal, SplitReveal } from "./Reveal";
import { ArrowRight, Calendar, Check, Clock, Heart, Mountain, Pin, Plus, Star, Users, Whatsapp, X } from "./Icons";
import { cn, fmtDate } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export default function TourDetail({ tour, destination, related, reviews }: { tour: Tour; destination: Destination | null; related: Tour[]; reviews: Testimonial[] }) {
  const { money, wishlist, toggleWish, introDone, settings } = useSite();
  const [light, setLight] = useState<number | null>(null);
  const [openDay, setOpenDay] = useState<number>(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const gallery = tour.gallery.length ? tour.gallery : [tour.image];
  const wished = wishlist.includes(tour.slug);

  return (
    <>
      {/* Hero */}
      <section ref={ref} className="px-3 pt-[96px] md:px-6 md:pt-[104px]">
        <div className="r-xl relative min-h-[86svh] overflow-hidden bg-night text-white">
          <motion.div style={{ y }} className="absolute inset-0">
            <Img src={tour.image} w={2200} alt={tour.title} priority className="h-full w-full object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
          <div className="relative mx-auto flex min-h-[86svh] max-w-[1400px] flex-col justify-end px-5 pb-24 pt-32 md:px-10 md:pb-12">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link href="/tours" className="glass rounded-full px-3 py-1.5 text-ink">← All journeys</Link>
              <span className="rounded-md bg-accent px-3 py-1.5">{tour.category}</span>
              {destination && <Link href={`/destinations/${destination.slug}`} className="rounded-md border border-white/30 px-3 py-1.5 hover:bg-white/10"><Pin className="mr-1 inline" />{destination.name}, {destination.country}</Link>}
            </div>
            <h1 className="display mt-5 max-w-[16ch] text-[12vw] md:text-[7vw] xl:text-[6.5rem]">
              <SplitReveal text={tour.title} play={introDone} />
            </h1>
            <div className="mt-8 grid items-end gap-6 md:grid-cols-[1fr_auto]">
              <p className="max-w-xl text-white/80 md:text-lg">{tour.summary}</p>
              <div className="flex gap-2">
                {gallery.slice(0, 4).map((g, k) => (
                  <button key={k} onClick={() => setLight(k)} className="h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-white/30 transition hover:scale-105 md:h-20 md:w-20" aria-label={`Open photo ${k + 1}`}>
                    <Img src={g} w={200} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-2 border-b border-line md:grid-cols-5">
          {[
            { i: <Clock />, l: "Duration", v: `${tour.days} days` },
            { i: <Users />, l: "Group", v: tour.groupSize },
            { i: <Mountain />, l: "Pace", v: tour.difficulty },
            { i: <Star />, l: "Rating", v: `${tour.rating.toFixed(1)} · ${tour.reviews} reviews` },
            { i: <Calendar />, l: "Best time", v: destination?.bestTime ?? "Year-round" },
          ].map((f, k) => (
            <Reveal key={f.l} delay={k * 0.05} className="border-line py-6 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
              <p className="flex items-center gap-2 text-xs text-mute"><span className="text-accent">{f.i}</span>{f.l}</p>
              <p className="mt-2 text-lg font-medium tracking-tight">{f.v}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-14 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-20">
          {/* Highlights */}
          <div>
            <p className="eyebrow text-mute">Highlights</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {tour.highlights.map((h, k) => (
                <Reveal as="li" key={h} delay={k * 0.06} className="r-lg flex gap-4 bg-card p-5">
                  <span className="font-mono text-xs text-accent">0{k + 1}</span>
                  <span className="text-lg font-medium leading-snug tracking-tight">{h}</span>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* Itinerary */}
          <div>
            <div className="flex items-end justify-between">
              <h2 className="display text-5xl md:text-6xl">Day by <span className="hl text-accent">day</span></h2>
              <span className="text-sm text-mute">{tour.itinerary.length} days</span>
            </div>
            <ol className="relative mt-8 border-l border-line pl-6 md:pl-10">
              {tour.itinerary.map((d, k) => {
                const open = openDay === k;
                return (
                  <li key={k} className="relative pb-2">
                    <span className={cn("absolute -left-[31px] top-5 grid h-3 w-3 place-items-center rounded-full ring-4 ring-paper transition-colors md:-left-[47px]", open ? "bg-accent" : "bg-ink/25")} />
                    <button onClick={() => setOpenDay(open ? -1 : k)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
                      <span>
                        <span className="font-mono text-xs text-mute">Day {String(k + 1).padStart(2, "0")}</span>
                        <span className="mt-1 block text-xl font-medium tracking-tight md:text-2xl">{d.title}</span>
                      </span>
                      <motion.span animate={{ rotate: open ? 45 : 0 }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line"><Plus /></motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease }} className="max-w-xl overflow-hidden pb-4 text-mute">
                          {d.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Gallery grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {gallery.map((g, k) => (
              <button key={k} onClick={() => setLight(k)} data-cursor="Zoom" className={cn("r-lg group overflow-hidden", k === 0 && "col-span-2 row-span-2")}>
                <Img src={g} w={1000} alt="" className="aspect-square h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
              </button>
            ))}
          </div>

          {/* Includes */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="r-xl bg-card p-7">
              <p className="eyebrow text-mute">Included</p>
              <ul className="mt-5 space-y-3">
                {tour.includes.map((i) => <li key={i} className="flex gap-3"><Check className="mt-0.5 shrink-0 text-lg text-emerald-600" />{i}</li>)}
              </ul>
            </div>
            <div className="r-xl border border-line p-7">
              <p className="eyebrow text-mute">Not included</p>
              <ul className="mt-5 space-y-3 text-mute">
                {tour.excludes.map((i) => <li key={i} className="flex gap-3"><X className="mt-0.5 shrink-0 text-lg" />{i}</li>)}
              </ul>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <p className="eyebrow text-mute">Travellers say</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {reviews.map((r) => (
                <figure key={r.id} className="r-lg border border-line p-6">
                  <div className="flex gap-0.5 text-accent">{Array.from({ length: r.rating }).map((_, k) => <Star key={k} />)}</div>
                  <blockquote className="mt-4 text-lg leading-snug tracking-tight">“{r.quote}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 text-sm">
                    <Img src={r.avatar} w={80} alt="" className="h-9 w-9 rounded-full object-cover" />
                    <span>{r.name} <span className="text-mute">· {r.location}</span></span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>

        {/* Booking */}
        <aside id="book" className="lg:sticky lg:top-24 lg:self-start">
          <BookingCard tour={tour} />
          <div className="mt-3 flex gap-2">
            <button onClick={() => toggleWish(tour.slug)} className={cn("flex flex-1 items-center justify-center gap-2 rounded-full border py-3 text-sm transition", wished ? "border-accent bg-accent text-white" : "border-line hover:border-ink")}>
              <Heart filled={wished} /> {wished ? "Saved" : "Save"}
            </button>
            <a href={`https://wa.me/${settings.brand.whatsapp}?text=${encodeURIComponent(`Hi! I'm interested in "${tour.title}".`)}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-md border border-line py-3 text-sm transition hover:border-[#25D366] hover:bg-[#25D366] hover:text-white">
              <Whatsapp /> Ask on WhatsApp
            </a>
          </div>
        </aside>
      </section>

      {/* Related */}
      <section className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
        <h2 className="display text-5xl md:text-7xl">You may <span className="hl text-accent">also love</span></h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((t) => <TourCard key={t.id} tour={t} />)}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {light !== null && (
          <motion.div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLight(null)}>
            <motion.div key={light} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease }} className="relative max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <Img src={gallery[light]} w={2000} alt="" className="max-h-[82vh] w-auto rounded-2xl object-contain" />
              <div className="mt-4 flex items-center justify-between text-sm text-white/80">
                <button onClick={() => setLight((light - 1 + gallery.length) % gallery.length)} className="rounded-md border border-white/20 px-4 py-2 hover:bg-white/10">← Prev</button>
                <span className="font-mono">{light + 1} / {gallery.length}</span>
                <button onClick={() => setLight((light + 1) % gallery.length)} className="rounded-md border border-white/20 px-4 py-2 hover:bg-white/10">Next →</button>
              </div>
            </motion.div>
            <button onClick={() => setLight(null)} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl text-white" aria-label="Close"><X /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BookingCard({ tour }: { tour: Tour }) {
  const { money } = useSite();
  const upcoming = tour.departures.filter((d) => new Date(d) > new Date());
  const [date, setDate] = useState(upcoming[0] ?? "");
  const [custom, setCustom] = useState(upcoming.length === 0);
  const [n, setN] = useState(2);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", requests: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState("");
  const total = tour.price * n;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, tourSlug: tour.slug, date, travelers: n }) });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setErr(j.error || "Something went wrong");
    setRef(j.ref);
    setStep(2);
  }

  const input = "w-full rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-ink";

  return (
    <div className="r-xl overflow-hidden bg-night p-6 text-paper shadow-[0_40px_80px_-40px_rgba(0,0,0,.6)] md:p-7">
      <AnimatePresence mode="wait" initial={false}>
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease }}>
            <p className="text-sm text-paper/60">from</p>
            <p className="display text-5xl">{money(tour.price)} <span className="font-sans text-sm font-normal tracking-normal text-paper/50">/ person</span></p>
            {tour.oldPrice && <p className="mt-1 text-sm text-paper/40 line-through">{money(tour.oldPrice)}</p>}

            <p className="eyebrow mt-7 text-paper/50">Departure</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {upcoming.slice(0, 4).map((d) => (
                <button key={d} onClick={() => { setDate(d); setCustom(false); }} className={cn("rounded-2xl border px-3 py-2.5 text-left text-sm transition", date === d && !custom ? "border-accent bg-accent text-white" : "border-white/15 hover:border-white/40")}>
                  {fmtDate(d, { day: "numeric", month: "short", year: "numeric" })}
                </button>
              ))}
              <button onClick={() => { setCustom(true); setDate(""); }} className={cn("col-span-2 rounded-2xl border px-3 py-2.5 text-sm transition", custom ? "border-accent" : "border-white/15 hover:border-white/40")}>Private dates</button>
            </div>
            {custom && <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} className="mt-2 w-full rounded-2xl border border-white/15 bg-transparent px-4 py-2.5 text-sm [color-scheme:dark]" />}

            <div className="mt-6 flex items-center justify-between">
              <span className="eyebrow text-paper/50">Travellers</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setN(Math.max(1, n - 1))} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 hover:bg-white/10" aria-label="Fewer">−</button>
                <span className="w-5 text-center text-lg tabular-nums">{n}</span>
                <button onClick={() => setN(Math.min(20, n + 1))} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 hover:bg-white/10" aria-label="More">+</button>
              </div>
            </div>

            <div className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-5">
              <span className="text-paper/60">Total</span>
              <motion.span key={total} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-medium tabular-nums">{money(total)}</motion.span>
            </div>
            <button disabled={!date} onClick={() => setStep(1)} className="group mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-accent py-4 font-medium text-white transition hover:brightness-110 disabled:opacity-40">
              Reserve — pay 20% later <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-3 text-center text-xs text-paper/40">No payment now · Free changes up to 60 days</p>
          </motion.div>
        )}
        {step === 1 && (
          <motion.form key="s1" onSubmit={submit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease }} className="space-y-3 text-ink">
            <button type="button" onClick={() => setStep(0)} className="text-sm text-paper/60 hover:text-paper">← Back</button>
            <p className="text-paper"><span className="text-paper/60">{fmtDate(date)} · {n} traveller{n > 1 ? "s" : ""} ·</span> {money(total)}</p>
            <input required placeholder="Full name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" placeholder="Email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Phone / WhatsApp" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea placeholder="Anything we should know? (optional)" rows={3} className={input} value={form.requests} onChange={(e) => setForm({ ...form, requests: e.target.value })} />
            {err && <p className="text-sm text-red-400">{err}</p>}
            <button disabled={loading} className="w-full rounded-md bg-accent py-4 font-medium text-white transition hover:brightness-110 disabled:opacity-50">{loading ? "Reserving…" : "Confirm reservation"}</button>
          </motion.form>
        )}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }} className="py-6 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-3xl text-white"><Check /></motion.span>
            <p className="hl mt-5 text-4xl">You’re going.</p>
            <p className="mt-2 text-paper/60">Reservation <b className="font-mono text-paper">{ref}</b> received. Your planner will write within a few hours.</p>
            <button onClick={() => { setStep(0); setForm({ name: "", email: "", phone: "", requests: "" }); }} className="mt-6 text-sm text-paper/60 underline">Make another</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
