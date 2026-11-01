"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { money as fmt } from "@/lib/utils";

type Ctx = {
  settings: SiteSettings;
  money: (n: number) => string;
  wishlist: string[];
  toggleWish: (slug: string) => void;
  introDone: boolean;
  setIntroDone: (v: boolean) => void;
};

const SiteCtx = createContext<Ctx | null>(null);

export function SiteProvider({ settings, children }: { settings: SiteSettings; children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [introDone, setIntroDone] = useState(!settings.intro.enabled);

  useEffect(() => {
    try {
      setWishlist(JSON.parse(localStorage.getItem("voyaj:wish") || "[]"));
    } catch {}
  }, []);

  const toggleWish = useCallback((slug: string) => {
    setWishlist((w) => {
      const next = w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug];
      try {
        localStorage.setItem("voyaj:wish", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const money = useCallback((n: number) => fmt(n, settings.brand.currency, settings.brand.locale), [settings.brand.currency, settings.brand.locale]);

  return (
    <SiteCtx.Provider value={{ settings, money, wishlist, toggleWish, introDone, setIntroDone }}>{children}</SiteCtx.Provider>
  );
}

export function useSite() {
  const c = useContext(SiteCtx);
  if (!c) throw new Error("useSite must be used inside SiteProvider");
  return c;
}
