"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "./Toast";

const I = {
  dash: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  leads: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  bookings: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  customers: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  mail: "M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6",
  tours: "M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3zM9 4v13M15 7v13",
  dest: "M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  posts: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5",
  quote: "M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6",
  faq: "M12 22a10 10 0 100-20 10 10 0 000 20zM9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01",
  exp: "M12 2l3 7h7l-5.5 4.5 2 7.5L12 16.5 5.5 21l2-7.5L2 9h7z",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z",
  menu: "M3 6h18M3 12h18M3 18h18",
  out: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  ext: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
};

export function Icon({ d, size = 18, className }: { d: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

const GROUPS = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: I.dash }] },
  {
    title: "CRM",
    items: [
      { href: "/admin/leads", label: "Leads", icon: I.leads },
      { href: "/admin/bookings", label: "Bookings", icon: I.bookings },
      { href: "/admin/customers", label: "Customers", icon: I.customers },
      { href: "/admin/subscribers", label: "Subscribers", icon: I.mail },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/tours", label: "Journeys", icon: I.tours },
      { href: "/admin/destinations", label: "Destinations", icon: I.dest },
      { href: "/admin/posts", label: "Journal", icon: I.posts },
      { href: "/admin/experiences", label: "Experiences", icon: I.exp },
      { href: "/admin/testimonials", label: "Testimonials", icon: I.quote },
      { href: "/admin/faqs", label: "FAQs", icon: I.faq },
    ],
  },
  { title: "Site", items: [{ href: "/admin/settings", label: "Site settings", icon: I.settings }] },
];

const MOBILE_TABS = [
  { href: "/admin", label: "Home", icon: I.dash },
  { href: "/admin/leads", label: "Leads", icon: I.leads },
  { href: "/admin/bookings", label: "Bookings", icon: I.bookings },
  { href: "/admin/tours", label: "Content", icon: I.tours },
  { href: "/admin/settings", label: "Settings", icon: I.settings },
];

function isActive(path: string, href: string) {
  return href === "/admin" ? path === "/admin" : path.startsWith(href);
}

function Nav({ path, onNavigate, brand }: { path: string; onNavigate?: () => void; brand: string }) {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-3 pb-6 pt-1">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-[15px] font-semibold text-paper">{brand.slice(0, 1)}</span>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">{brand}</div>
          <div className="text-[11px] text-mute">Studio console</div>
        </div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="eyebrow mb-1.5 px-3 text-[10px] text-ink/40">{g.title}</div>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(path, it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition",
                        active ? "text-ink" : "text-ink/60 hover:bg-ink/[0.04] hover:text-ink",
                      )}
                    >
                      {active && (
                        <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                      )}
                      <Icon d={it.icon} className="relative" />
                      <span className="relative">{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="mt-4 space-y-1 border-t border-line pt-4">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] text-ink/60 hover:bg-ink/[0.04] hover:text-ink">
          <Icon d={I.ext} /> View site ↗
        </a>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[14px] text-ink/60 hover:bg-ink/[0.04] hover:text-ink">
          <Icon d={I.out} /> Log out
        </button>
      </div>
    </div>
  );
}

export default function Shell({ children, brand }: { children: React.ReactNode; brand: string }) {
  const path = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-[#f2f0eb] text-ink">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-paper/80 p-4 backdrop-blur-xl lg:block">
          <Nav path={path} brand={brand} />
        </aside>

        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-sm font-semibold text-paper">{brand.slice(0, 1)}</span>
            <span className="text-[15px] font-semibold tracking-tight">{brand} Studio</span>
          </div>
          <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" aria-label="Open menu">
            <Icon d={I.menu} />
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[70] lg:hidden">
              <motion.div className="absolute inset-0 bg-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 36 }}
                className="absolute inset-y-0 left-0 w-[82%] max-w-xs rounded-r-3xl bg-paper p-4 shadow-2xl"
              >
                <Nav path={path} brand={brand} onNavigate={() => setOpen(false)} />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-[22px] border border-white/60 bg-paper/85 px-1 py-1.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden" style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}>
          {MOBILE_TABS.map((t) => {
            const active = isActive(path, t.href);
            return (
              <Link key={t.href} href={t.href} className={cn("flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-medium", active ? "text-ink" : "text-ink/45")}>
                <Icon d={t.icon} size={20} />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </ToastProvider>
  );
}
