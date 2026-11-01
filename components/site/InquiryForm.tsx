"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Check } from "./Icons";
import { cn } from "@/lib/utils";

const STYLES = ["Honeymoon", "Family", "Adventure", "Culture", "Wellness", "Celebration"];
const BUDGETS = ["₹1–2L", "₹2–4L", "₹4–8L", "₹8L+"];
const ease = [0.22, 1, 0.36, 1] as const;

export default function InquiryForm({ destinations, initialDestination = "" }: { destinations: string[]; initialDestination?: string }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ destination: initialDestination, style: "", travelDate: "", travelers: 2, budget: "", name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f, v: string | number) => setF((x) => ({ ...x, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, message: [f.style && `Style: ${f.style}`, f.message].filter(Boolean).join("\n"), source: "Website" }),
    });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setErr(j.error || "Something went wrong");
    setStep(3);
  }

  const chip = (active: boolean) => cn("rounded-full border px-4 py-2.5 text-sm transition", active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink");
  const input = "w-full border-b border-line bg-transparent py-3 text-lg outline-none transition placeholder:text-ink/30 focus:border-ink";
  const steps = ["Where", "How", "You"];

  return (
    <div className="r-xl bg-card p-6 md:p-10">
      {step < 3 && (
        <div className="mb-8 flex items-center gap-2">
          {steps.map((s, k) => (
            <button key={s} type="button" onClick={() => k < step && setStep(k)} className="flex flex-1 flex-col gap-2 text-left">
              <span className="relative h-[3px] overflow-hidden rounded-full bg-line">
                <motion.span className="absolute inset-y-0 left-0 bg-accent" animate={{ width: k <= step ? "100%" : "0%" }} transition={{ duration: 0.6, ease }} />
              </span>
              <span className={cn("font-mono text-[11px] uppercase tracking-wider", k <= step ? "text-ink" : "text-mute")}>0{k + 1} {s}</span>
            </button>
          ))}
        </div>
      )}
      <form onSubmit={submit}>
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.div key="0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease }} className="space-y-8">
              <div>
                <p className="text-3xl font-medium tracking-[-0.03em]">Where are you dreaming of?</p>
                <input list="inq-dest" value={f.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Type a place — or “surprise me”" className={cn(input, "mt-4")} />
                <datalist id="inq-dest">{destinations.map((d) => <option key={d} value={d} />)}</datalist>
                <div className="mt-4 flex flex-wrap gap-2">
                  {destinations.slice(0, 6).map((d) => <button type="button" key={d} onClick={() => set("destination", d)} className={chip(f.destination === d)}>{d}</button>)}
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="eyebrow text-mute">Roughly when</span>
                  <input type="month" value={f.travelDate} onChange={(e) => set("travelDate", e.target.value)} className={input} />
                </label>
                <div>
                  <span className="eyebrow text-mute">Travellers</span>
                  <div className="mt-3 flex items-center gap-4">
                    <button type="button" onClick={() => set("travelers", Math.max(1, f.travelers - 1))} className="grid h-11 w-11 place-items-center rounded-full border border-line hover:border-ink">−</button>
                    <span className="w-8 text-center text-2xl tabular-nums">{f.travelers}</span>
                    <button type="button" onClick={() => set("travelers", Math.min(30, f.travelers + 1))} className="grid h-11 w-11 place-items-center rounded-full border border-line hover:border-ink">+</button>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setStep(1)} className="group flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm text-paper transition hover:bg-accent">Continue <ArrowRight className="transition-transform group-hover:translate-x-1" /></button>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease }} className="space-y-8">
              <div>
                <p className="text-3xl font-medium tracking-[-0.03em]">What kind of trip?</p>
                <div className="mt-4 flex flex-wrap gap-2">{STYLES.map((s) => <button type="button" key={s} onClick={() => set("style", s)} className={chip(f.style === s)}>{s}</button>)}</div>
              </div>
              <div>
                <p className="text-3xl font-medium tracking-[-0.03em]">Budget per person</p>
                <div className="mt-4 flex flex-wrap gap-2">{BUDGETS.map((s) => <button type="button" key={s} onClick={() => set("budget", s)} className={chip(f.budget === s)}>{s}</button>)}</div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="rounded-md border border-line px-6 py-3.5 text-sm hover:border-ink">Back</button>
                <button type="button" onClick={() => setStep(2)} className="group flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm text-paper transition hover:bg-accent">Continue <ArrowRight className="transition-transform group-hover:translate-x-1" /></button>
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease }} className="space-y-5">
              <p className="text-3xl font-medium tracking-[-0.03em]">Lastly, who should we write to?</p>
              <input required placeholder="Your name" value={f.name} onChange={(e) => set("name", e.target.value)} className={input} />
              <div className="grid gap-5 sm:grid-cols-2">
                <input required type="email" placeholder="Email" value={f.email} onChange={(e) => set("email", e.target.value)} className={input} />
                <input placeholder="Phone / WhatsApp" value={f.phone} onChange={(e) => set("phone", e.target.value)} className={input} />
              </div>
              <textarea rows={3} placeholder="Anything else? Occasions, must-dos, dietary needs…" value={f.message} onChange={(e) => set("message", e.target.value)} className={cn(input, "resize-none")} />
              {err && <p className="text-sm text-red-600">{err}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="rounded-md border border-line px-6 py-3.5 text-sm hover:border-ink">Back</button>
                <button disabled={loading} className="flex items-center gap-2 rounded-md bg-accent px-7 py-3.5 text-sm font-medium text-on-accent transition hover:brightness-110 disabled:opacity-50">{loading ? "Sending…" : "Send to a planner"} <ArrowRight /></button>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease }} className="py-10 text-center">
              <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.15 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent text-4xl text-on-accent"><Check /></motion.span>
              <p className="hl mt-6 text-5xl">Thank you, {f.name.split(" ")[0]}.</p>
              <p className="mx-auto mt-3 max-w-sm text-mute">A planner who knows {f.destination || "the world"} well will write to you within a few hours.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
