"use client";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Img from "./Img";
import { ArrowRight, Search } from "./Icons";
import { cn } from "@/lib/utils";

export type SpotItem = { type: "Journey" | "Destination" | "Story" | "Page"; title: string; sub: string; href: string; image?: string };

export default function Spotlight({ open, onClose, index }: { open: boolean; onClose: () => void; index: SpotItem[] }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const r = s
      ? index.filter((i) => `${i.title} ${i.sub} ${i.type}`.toLowerCase().includes(s))
      : index.filter((i) => i.type !== "Story").slice(0, 7);
    return r.slice(0, 8);
  }, [q, index]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => input.current?.focus(), 50);
      window.__lenis?.stop();
    } else window.__lenis?.start();
  }, [open]);

  useEffect(() => setSel(0), [q]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 px-3 pt-[12vh] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-label="Search"
            className="glass w-full max-w-xl overflow-hidden rounded-[26px] text-ink"
            initial={{ y: -20, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -10, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search className="text-xl text-mute" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
                  if (e.key === "Enter" && results[sel]) go(results[sel].href);
                  if (e.key === "Escape") onClose();
                }}
                placeholder="Search journeys, places, stories…"
                className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-mute"
              />
              <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-mute sm:block">ESC</kbd>
            </div>
            <ul className="max-h-[55vh] overflow-y-auto p-2" data-lenis-prevent>
              {results.length === 0 && <li className="px-4 py-10 text-center text-mute">Nothing yet — try “Bali” or “honeymoon”.</li>}
              {results.map((r, k) => (
                <li key={r.href}>
                  <button
                    onMouseEnter={() => setSel(k)}
                    onClick={() => go(r.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors",
                      sel === k ? "bg-ink text-paper" : "hover:bg-black/5",
                    )}
                  >
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-line">
                      {r.image && <Img src={r.image} w={120} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.title}</span>
                      <span className={cn("block truncate text-xs", sel === k ? "text-paper/60" : "text-mute")}>
                        {r.type} · {r.sub}
                      </span>
                    </span>
                    <ArrowRight className={cn("mr-2 transition-opacity", sel === k ? "opacity-100" : "opacity-0")} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-mute">
              <span>↑↓ navigate · ↵ open</span>
              <span>⌘K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
