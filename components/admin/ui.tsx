"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn, img } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-white/70 p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]", className)}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.035em] sm:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mute">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger" | "accent";
  size?: "sm" | "md";
};

export function Button({ variant = "primary", size = "md", className, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
        variant === "primary" && "bg-ink text-paper hover:bg-ink/85",
        variant === "accent" && "bg-accent text-white hover:brightness-110",
        variant === "outline" && "border border-line bg-white/60 hover:bg-white",
        variant === "ghost" && "hover:bg-ink/5",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
    />
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-ink/30 focus:border-ink/40 focus:ring-4 focus:ring-ink/5";

export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn(inputCls, p.className)} />;
}

export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...p} className={cn(inputCls, "resize-y leading-relaxed", p.className)} />;
}

export function Select({ options, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: (string | { label: string; value: string })[] }) {
  return (
    <select {...p} className={cn(inputCls, "appearance-none bg-[right_0.8rem_center] bg-no-repeat pr-9", p.className)} style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path d='M1 1l4 4 4-4' stroke='%23999' fill='none' stroke-width='1.5'/></svg>\")" }}>
      {options.map((o) => {
        const v = typeof o === "string" ? { label: o, value: o } : o;
        return (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        );
      })}
    </select>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-ink/80">
        {label}
        {hint && <span className="text-[11px] font-normal text-mute">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-sm"
    >
      <span className={cn("relative h-[26px] w-[44px] rounded-full transition-colors", checked ? "bg-emerald-500" : "bg-ink/15")}>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 35 }}
          className={cn("absolute top-[3px] h-5 w-5 rounded-full bg-white shadow", checked ? "right-[3px]" : "left-[3px]")}
        />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}

const TONES: Record<string, string> = {
  new: "bg-sky-100 text-sky-800",
  contacted: "bg-violet-100 text-violet-800",
  qualified: "bg-amber-100 text-amber-800",
  proposal: "bg-orange-100 text-orange-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-zinc-200 text-zinc-600",
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  paid: "bg-emerald-100 text-emerald-800",
  completed: "bg-zinc-900 text-white",
  cancelled: "bg-red-100 text-red-700",
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-zinc-200 text-zinc-600",
};

export function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize", TONES[tone] ?? "bg-ink/5 text-ink/70")}>
      {children}
    </span>
  );
}

export function Thumb({ src, className }: { src?: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-ink/5", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img(src, 400)} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : null}
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className={cn(
              "absolute inset-y-0 right-0 flex w-full flex-col bg-paper shadow-2xl sm:rounded-l-3xl",
              wide ? "sm:max-w-2xl" : "sm:max-w-lg",
            )}
          >
            <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <div className="min-w-0 truncate text-lg font-semibold tracking-tight">{title}</div>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" /></svg>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && <footer className="flex items-center justify-between gap-2 border-t border-line px-5 py-4 sm:px-6">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SearchBox({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-64">
      <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn(inputCls, "rounded-full pl-9")} />
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex self-start rounded-full bg-ink/5 p-1 sm:self-auto">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn("relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition", value === o.value ? "text-ink" : "text-ink/50 hover:text-ink")}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${options.map((x) => x.value).join("")}`} className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center text-sm text-mute">{children}</div>;
}
