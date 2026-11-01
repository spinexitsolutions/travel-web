"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { HomeSectionKey, SiteSettings } from "@/lib/types";
import { cn, img } from "@/lib/utils";
import { apiFetch } from "./api";
import { ObjectList, StringList } from "./fields";
import { useToast } from "./Toast";
import { Button, Card, Field, Input, PageHeader, Textarea, Toggle } from "./ui";

const TABS = [
  { key: "brand", label: "Brand" },
  { key: "theme", label: "Theme" },
  { key: "intro", label: "Intro animation" },
  { key: "hero", label: "Hero" },
  { key: "announcement", label: "Announcement" },
  { key: "nav", label: "Navigation" },
  { key: "sections", label: "Homepage" },
  { key: "content", label: "Manifesto & stats" },
  { key: "seo", label: "SEO" },
  { key: "danger", label: "Danger zone" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const SECTION_LABELS: Record<HomeSectionKey, { label: string; desc: string }> = {
  marquee: { label: "Marquee", desc: "Scrolling strip of destinations under the hero" },
  manifesto: { label: "Manifesto", desc: "Large word-by-word reveal statement" },
  destinations: { label: "Destinations", desc: "Pinned horizontal destination carousel" },
  tours: { label: "Featured journeys", desc: "Cards of featured packages" },
  experiences: { label: "Experiences", desc: "Bento grid of travel styles" },
  stats: { label: "Stats", desc: "Animated counters" },
  process: { label: "How it works", desc: "Sticky step-by-step process" },
  testimonials: { label: "Testimonials", desc: "Guest reviews" },
  journal: { label: "Journal", desc: "Latest blog stories" },
  faq: { label: "FAQ", desc: "Accordion of questions" },
  newsletter: { label: "Newsletter", desc: "Signup CTA before the footer" },
};

export default function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const toast = useToast();
  const router = useRouter();
  const [s, setS] = useState<SiteSettings>(initial);
  const [saved, setSaved] = useState<string>(JSON.stringify(initial));
  const [tab, setTab] = useState<Tab>("brand");
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(() => JSON.stringify(s) !== saved, [s, saved]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const patch = <K extends keyof SiteSettings>(k: K, v: Partial<SiteSettings[K]>) =>
    setS((p) => ({ ...p, [k]: Array.isArray(v) || typeof v !== "object" ? v : { ...(p[k] as object), ...v } }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await apiFetch<SiteSettings>("/api/admin/settings", { method: "PUT", json: s });
      setS(res);
      setSaved(JSON.stringify(res));
      toast("Settings saved — live on the site");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm("Reset ALL content, leads, bookings and settings to the demo data? This cannot be undone.")) return;
    try {
      await apiFetch("/api/admin/reset", { method: "POST" });
      const fresh = await apiFetch<SiteSettings>("/api/admin/settings");
      setS(fresh);
      setSaved(JSON.stringify(fresh));
      toast("Demo data restored");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  return (
    <>
      <PageHeader
        title="Site settings"
        subtitle="Control every part of the public website — changes go live on save."
        actions={
          <>
            <a href="/" target="_blank" className="inline-flex h-10 items-center rounded-full border border-line bg-white/60 px-4 text-sm font-medium hover:bg-white">Preview ↗</a>
            <Button onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : dirty ? "Save changes" : "Saved"}</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 no-scrollbar sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:px-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative shrink-0 rounded-xl px-3.5 py-2 text-left text-[14px] transition",
                tab === t.key ? "text-ink" : "text-ink/55 hover:text-ink",
                t.key === "danger" && "text-red-600/70 lg:mt-4",
              )}
            >
              {tab === t.key && <motion.span layoutId="settings-tab" className="absolute inset-0 rounded-xl bg-white shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="min-w-0 space-y-4">
            {tab === "brand" && (
              <>
                <Card>
                  <h3 className="mb-4 font-semibold tracking-tight">Identity</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Brand name"><Input value={s.brand.name} onChange={(e) => patch("brand", { name: e.target.value })} /></Field>
                    <Field label="Logo mark" hint="1–2 characters"><Input maxLength={3} value={s.brand.logoMark} onChange={(e) => patch("brand", { logoMark: e.target.value })} /></Field>
                    <Field label="Tagline" className="sm:col-span-2"><Input value={s.brand.tagline} onChange={(e) => patch("brand", { tagline: e.target.value })} /></Field>
                    <Field label="Currency symbol"><Input value={s.brand.currency} onChange={(e) => patch("brand", { currency: e.target.value })} /></Field>
                    <Field label="Number locale" hint="e.g. en-IN, en-US"><Input value={s.brand.locale} onChange={(e) => patch("brand", { locale: e.target.value })} /></Field>
                  </div>
                </Card>
                <Card>
                  <h3 className="mb-4 font-semibold tracking-tight">Contact</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email"><Input value={s.brand.email} onChange={(e) => patch("brand", { email: e.target.value })} /></Field>
                    <Field label="Phone"><Input value={s.brand.phone} onChange={(e) => patch("brand", { phone: e.target.value })} /></Field>
                    <Field label="WhatsApp number" hint="digits with country code"><Input value={s.brand.whatsapp} onChange={(e) => patch("brand", { whatsapp: e.target.value.replace(/[^\d]/g, "") })} /></Field>
                    <Field label="Address"><Input value={s.brand.address} onChange={(e) => patch("brand", { address: e.target.value })} /></Field>
                  </div>
                </Card>
                <Card>
                  <h3 className="mb-4 font-semibold tracking-tight">Social links</h3>
                  <ObjectList
                    value={s.brand.socials}
                    onChange={(v) => patch("brand", { socials: v })}
                    fields={[{ key: "label", label: "Label" }, { key: "href", label: "URL" }]}
                    blank={{ label: "", href: "https://" }}
                    itemLabel={(it) => it.label || "New link"}
                  />
                </Card>
              </>
            )}

            {tab === "theme" && (
              <Card>
                <h3 className="mb-4 font-semibold tracking-tight">Colours & shape</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {(["accent", "dark", "paper"] as const).map((k) => (
                    <Field key={k} label={k === "accent" ? "Accent" : k === "dark" ? "Dark sections" : "Background (paper)"}>
                      <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-1.5">
                        <input type="color" value={s.theme[k]} onChange={(e) => patch("theme", { [k]: e.target.value })} className="h-9 w-11 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
                        <input value={s.theme[k]} onChange={(e) => patch("theme", { [k]: e.target.value })} className="w-full bg-transparent font-mono text-sm uppercase outline-none" />
                      </div>
                    </Field>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    ["Sunset", "#FF5A1F", "#0E1512", "#F4F1EA"],
                    ["Lagoon", "#0EA5A4", "#0B1B24", "#F2F5F4"],
                    ["Saffron", "#E8A317", "#1A1410", "#F7F2E8"],
                    ["Rose", "#E5476B", "#1A0F14", "#F7F0EF"],
                    ["Cobalt", "#2F5BFF", "#0B1020", "#F2F3F7"],
                  ].map(([n, a, d, p]) => (
                    <button key={n} onClick={() => patch("theme", { accent: a, dark: d, paper: p })} className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] hover:shadow-sm">
                      <span className="flex -space-x-1">
                        {[a, d, p].map((c) => <span key={c} className="h-4 w-4 rounded-full border border-white" style={{ background: c }} />)}
                      </span>
                      {n}
                    </button>
                  ))}
                </div>
                <Field label={`Corner radius — ${s.theme.radius}px`} className="mt-5">
                  <input type="range" min={0} max={48} value={s.theme.radius} onChange={(e) => patch("theme", { radius: Number(e.target.value) })} className="w-full accent-[var(--ink)]" />
                </Field>
                <div className="mt-6">
                  <div className="eyebrow mb-2 text-ink/45">Live preview</div>
                  <div className="overflow-hidden border border-line p-5" style={{ background: s.theme.paper, borderRadius: s.theme.radius }}>
                    <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr]">
                      <div className="relative min-h-44 overflow-hidden" style={{ borderRadius: s.theme.radius * 0.7 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img(s.hero.slides[0]?.image ?? "", 900)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <div className="text-2xl font-medium tracking-[-0.04em]">{s.hero.titleTop} <span className="serif-i">{s.hero.titleAccent}</span></div>
                          <span className="mt-3 inline-block rounded-full px-4 py-2 text-xs font-medium text-white" style={{ background: s.theme.accent }}>{s.hero.ctaLabel}</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between gap-3 p-4 text-white" style={{ background: s.theme.dark, borderRadius: s.theme.radius * 0.7 }}>
                        <div className="eyebrow text-white/50">Dark section</div>
                        <div className="text-3xl font-medium tracking-[-0.04em]">12k<span style={{ color: s.theme.accent }}>+</span></div>
                        <div className="text-xs text-white/60">Travellers hosted</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {tab === "intro" && (
              <>
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold tracking-tight">Intro animation</h3>
                      <p className="text-[13px] text-mute">The full-screen loader that plays before the homepage.</p>
                    </div>
                    <a href="/?intro=1" target="_blank" className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-[13px] font-medium text-white">▶ Preview intro</a>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl border border-line bg-white px-3.5 py-3"><span className="text-sm">Enabled</span><Toggle checked={s.intro.enabled} onChange={(v) => patch("intro", { enabled: v })} /></div>
                    <div className="flex items-center justify-between rounded-xl border border-line bg-white px-3.5 py-3"><span className="text-sm">Play once per session</span><Toggle checked={s.intro.oncePerSession} onChange={(v) => patch("intro", { oncePerSession: v })} /></div>
                  </div>
                  <Field label={`Duration — ${s.intro.duration.toFixed(1)}s`} className="mt-4">
                    <input type="range" min={1.5} max={7} step={0.1} value={s.intro.duration} onChange={(e) => patch("intro", { duration: Number(e.target.value) })} className="w-full accent-[var(--ink)]" />
                  </Field>
                  <Field label="Tagline" className="mt-4"><Input value={s.intro.tagline} onChange={(e) => patch("intro", { tagline: e.target.value })} /></Field>
                </Card>
                <div className="grid gap-4 xl:grid-cols-2">
                  <Card>
                    <h3 className="mb-3 font-semibold tracking-tight">Cycling words</h3>
                    <StringList value={s.intro.words} onChange={(v) => patch("intro", { words: v })} placeholder="Add a destination word" />
                  </Card>
                  <Card>
                    <h3 className="mb-3 font-semibold tracking-tight">Images</h3>
                    <StringList value={s.intro.images} onChange={(v) => patch("intro", { images: v })} image placeholder="Paste image URL" />
                  </Card>
                </div>
              </>
            )}

            {tab === "hero" && (
              <>
                <Card>
                  <h3 className="mb-4 font-semibold tracking-tight">Headline</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Eyebrow" className="sm:col-span-3"><Input value={s.hero.eyebrow} onChange={(e) => patch("hero", { eyebrow: e.target.value })} /></Field>
                    <Field label="Title — first line"><Input value={s.hero.titleTop} onChange={(e) => patch("hero", { titleTop: e.target.value })} /></Field>
                    <Field label="Accent word" hint="serif italic"><Input value={s.hero.titleAccent} onChange={(e) => patch("hero", { titleAccent: e.target.value })} /></Field>
                    <Field label="Title — last line"><Input value={s.hero.titleBottom} onChange={(e) => patch("hero", { titleBottom: e.target.value })} /></Field>
                    <Field label="Subtitle" className="sm:col-span-3"><Textarea rows={3} value={s.hero.subtitle} onChange={(e) => patch("hero", { subtitle: e.target.value })} /></Field>
                    <Field label="CTA label"><Input value={s.hero.ctaLabel} onChange={(e) => patch("hero", { ctaLabel: e.target.value })} /></Field>
                  </div>
                  <div className="mt-5 rounded-2xl bg-ink p-6 text-paper">
                    <div className="eyebrow text-paper/50">{s.hero.eyebrow}</div>
                    <div className="mt-3 text-3xl font-medium leading-[0.95] tracking-[-0.045em] sm:text-5xl">
                      {s.hero.titleTop} <span className="serif-i" style={{ color: s.theme.accent }}>{s.hero.titleAccent}</span>
                      <br />
                      {s.hero.titleBottom}
                    </div>
                  </div>
                </Card>
                <Card>
                  <h3 className="mb-3 font-semibold tracking-tight">Background slides</h3>
                  <ObjectList
                    value={s.hero.slides}
                    onChange={(v) => patch("hero", { slides: v })}
                    fields={[{ key: "image", label: "Image URL", type: "image" }, { key: "caption", label: "Caption" }]}
                    blank={{ image: "", caption: "" }}
                    itemLabel={(it, i) => `Slide ${i + 1}${it.caption ? ` — ${it.caption}` : ""}`}
                  />
                </Card>
              </>
            )}

            {tab === "announcement" && (
              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold tracking-tight">Announcement bar</h3>
                  <Toggle checked={s.announcement.enabled} onChange={(v) => patch("announcement", { enabled: v })} />
                </div>
                <div className="grid gap-4">
                  <Field label="Text"><Input value={s.announcement.text} onChange={(e) => patch("announcement", { text: e.target.value })} /></Field>
                  <Field label="Link"><Input value={s.announcement.href} onChange={(e) => patch("announcement", { href: e.target.value })} /></Field>
                </div>
                <div className={cn("mt-5 rounded-full px-4 py-2 text-center text-[13px] text-white transition", !s.announcement.enabled && "opacity-30")} style={{ background: s.theme.dark }}>
                  {s.announcement.text} <span style={{ color: s.theme.accent }}>→</span>
                </div>
              </Card>
            )}

            {tab === "nav" && (
              <Card>
                <h3 className="font-semibold tracking-tight">Navigation links</h3>
                <p className="mb-4 text-[13px] text-mute">Shown in the navbar island. Images appear as hover previews in the expanded menu.</p>
                <ObjectList
                  value={s.nav as unknown as Record<string, unknown>[]}
                  onChange={(v) => patch("nav", v as unknown as SiteSettings["nav"])}
                  fields={[{ key: "label", label: "Label" }, { key: "href", label: "Link (e.g. /tours)" }, { key: "image", label: "Preview image", type: "image" }]}
                  blank={{ label: "", href: "/", image: "" }}
                  itemLabel={(it) => String(it.label || "New link")}
                />
              </Card>
            )}

            {tab === "sections" && (
              <Card>
                <h3 className="font-semibold tracking-tight">Homepage sections</h3>
                <p className="mb-4 text-[13px] text-mute">Turn any section of the homepage on or off.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(SECTION_LABELS) as HomeSectionKey[]).map((k) => (
                    <div key={k} className={cn("flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 transition", !s.sections[k] && "opacity-60")}>
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{SECTION_LABELS[k].label}</div>
                        <div className="truncate text-[12px] text-mute">{SECTION_LABELS[k].desc}</div>
                      </div>
                      <Toggle checked={!!s.sections[k]} onChange={(v) => patch("sections", { [k]: v } as Partial<SiteSettings["sections"]>)} />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {tab === "content" && (
              <>
                <Card>
                  <h3 className="mb-3 font-semibold tracking-tight">Manifesto</h3>
                  <Textarea rows={5} value={s.manifesto} onChange={(e) => setS({ ...s, manifesto: e.target.value })} />
                </Card>
                <Card>
                  <h3 className="mb-3 font-semibold tracking-tight">Stats</h3>
                  <ObjectList
                    value={s.stats as unknown as Record<string, unknown>[]}
                    onChange={(v) => setS({ ...s, stats: v as unknown as SiteSettings["stats"] })}
                    fields={[{ key: "value", label: "Number", type: "number" }, { key: "suffix", label: "Suffix (k+, /5…)" }, { key: "label", label: "Label" }]}
                    blank={{ value: 0, suffix: "", label: "" }}
                    itemLabel={(it) => `${it.value}${it.suffix} ${it.label}`}
                  />
                </Card>
              </>
            )}

            {tab === "seo" && (
              <Card>
                <h3 className="mb-4 font-semibold tracking-tight">Search & social</h3>
                <div className="grid gap-4">
                  <Field label="Meta title" hint={`${s.seo.title.length}/60`}><Input value={s.seo.title} onChange={(e) => patch("seo", { title: e.target.value })} /></Field>
                  <Field label="Meta description" hint={`${s.seo.description.length}/160`}><Textarea rows={3} value={s.seo.description} onChange={(e) => patch("seo", { description: e.target.value })} /></Field>
                </div>
                <div className="mt-5 rounded-2xl border border-line bg-white p-4">
                  <div className="text-[12px] text-emerald-700">voyaj.travel</div>
                  <div className="mt-0.5 text-lg text-[#1a0dab]">{s.seo.title}</div>
                  <div className="text-[13px] text-ink/60">{s.seo.description}</div>
                </div>
              </Card>
            )}

            {tab === "danger" && (
              <Card className="border-red-200 bg-red-50/40">
                <h3 className="font-semibold tracking-tight text-red-700">Reset demo data</h3>
                <p className="mt-1 text-[13px] text-ink/60">Restores all content, CRM records and settings to the original demo. Useful before presenting to a client.</p>
                <Button variant="danger" className="mt-4" onClick={reset}>Reset everything</Button>
              </Card>
            )}

            {tab !== "danger" && (
              <div className="flex justify-end">
                <Button onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : "Save changes"}</Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-sm text-paper shadow-2xl lg:bottom-6 lg:left-64"
          >
            <span>Unsaved changes</span>
            <div className="flex gap-1.5">
              <button onClick={() => setS(JSON.parse(saved))} className="rounded-full px-3 py-1.5 text-paper/70 hover:text-paper">Discard</button>
              <button onClick={save} className="rounded-full bg-accent px-4 py-1.5 font-medium text-white">{saving ? "Saving…" : "Save"}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

