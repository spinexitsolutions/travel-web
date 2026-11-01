import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import InquiryForm from "@/components/site/InquiryForm";
import { FaqList } from "@/components/site/home/Sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Plan a trip" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ destination?: string }> }) {
  const sp = await searchParams;
  const db = await getDB();
  const b = db.settings.brand;
  return (
    <>
      <PageHero eyebrow="Plan a trip" title="Let’s compose" accent="something rare." sub="Three short steps. A real person replies within a few hours — usually much sooner." />
      <section className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-24 md:grid-cols-[1.5fr_1fr] md:px-10">
        <InquiryForm destinations={db.destinations.map((d) => d.name)} initialDestination={sp.destination ?? ""} />
        <aside className="space-y-3">
          {[
            { l: "Write", v: b.email, h: `mailto:${b.email}` },
            { l: "Call", v: b.phone, h: `tel:${b.phone.replace(/\s/g, "")}` },
            { l: "WhatsApp", v: "Chat with a planner", h: `https://wa.me/${b.whatsapp}` },
            { l: "Visit", v: b.address, h: `https://maps.google.com/?q=${encodeURIComponent(b.address)}` },
          ].map((c) => (
            <a key={c.l} href={c.h} target={c.h.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="r-lg group block border border-line p-6 transition hover:border-ink hover:bg-card">
              <p className="eyebrow text-mute">{c.l}</p>
              <p className="mt-2 text-xl font-medium tracking-tight transition-colors group-hover:text-accent">{c.v}</p>
            </a>
          ))}
          <div className="r-lg bg-night p-6 text-paper">
            <p className="eyebrow text-paper/50">Studio hours</p>
            <p className="mt-2">Mon–Sat · 10:00–19:00 IST</p>
            <p className="mt-1 text-sm text-paper/60">Travelling clients: 24/7 concierge.</p>
          </div>
        </aside>
      </section>
      <section className="mx-auto max-w-[1000px] px-5 pb-28 md:px-10">
        <h2 className="display mb-8 text-5xl md:text-6xl">Questions, <span className="hl text-accent">answered.</span></h2>
        <FaqList items={db.faqs} />
      </section>
    </>
  );
}
