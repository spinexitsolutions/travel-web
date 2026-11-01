"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check } from "./Icons";
import { cn } from "@/lib/utils";

export default function Newsletter({ dark }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) { setState("done"); setEmail(""); }
    else { setState("error"); setMsg(j.error || "Something went wrong"); }
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className={cn("flex h-13 items-center rounded-full p-1.5 pl-5", dark ? "bg-white/8 ring-1 ring-white/15" : "bg-white ring-1 ring-line")}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
          placeholder="you@email.com"
          aria-label="Email address"
          className={cn("h-10 min-w-0 flex-1 bg-transparent text-sm outline-none", dark ? "placeholder:text-paper/40" : "placeholder:text-mute")}
        />
        <button
          disabled={state === "loading"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white transition hover:scale-105 disabled:opacity-60"
          aria-label="Subscribe"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={state === "done" ? "ok" : "go"} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
              {state === "done" ? <Check /> : <ArrowRight />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      <p className={cn("mt-2 h-4 pl-5 text-xs", state === "error" ? "text-red-400" : dark ? "text-paper/50" : "text-mute")}>
        {state === "done" ? "You're in. First letter lands soon." : state === "error" ? msg : ""}
      </p>
    </form>
  );
}
