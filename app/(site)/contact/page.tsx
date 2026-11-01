import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import InquiryForm from "@/components/site/InquiryForm";
import LiveStudio from "@/components/site/LiveStudio";
import { IMG } from "@/lib/seed";
import { FaqList } from "@/components/site/home/Sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Plan a trip" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ destination?: string }> }) {
  const sp = await searchParams;
  const db = await getDB();
  const b = db.settings.brand;
  return (
    <>
      <PageHero
        eyebrow="Plan a trip"
        title="Let’s compose"
        accent="something rare."
        sub="Three short steps. A real person replies within a few hours — usually much sooner."
        images={[IMG.airport, IMG.flatlay, IMG.santorini, IMG.kyoto, IMG.tent, IMG.infinityPool, IMG.hikers, IMG.jaipur]}
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        meta={[{ label: "Reply time", value: "< 2 hrs" }, { label: "Planners", value: "12" }, { label: "Cost to plan", value: "Free" }]}
      />
      <section className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-24 md:grid-cols-[1.5fr_1fr] md:px-10">
        <InquiryForm destinations={db.destinations.map((d) => d.name)} initialDestination={sp.destination ?? ""} />
        <aside className="space-y-3 md:sticky md:top-24 md:self-start">
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
          <LiveStudio avatars={[IMG.p3, IMG.p4, IMG.p5, IMG.p2]} />
        </aside>
      </section>
      <section className="mx-auto max-w-[1000px] px-5 pb-28 md:px-10">
        <h2 className="display mb-8 text-5xl md:text-6xl">Questions, <span className="hl text-accent">answered.</span></h2>
        <FaqList items={db.faqs} />
      </section>
    </>
  );
}
