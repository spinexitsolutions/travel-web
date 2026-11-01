import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import { IMG } from "@/lib/seed";
import PageHero from "@/components/site/PageHero";
import Img from "@/components/site/Img";
import { Reveal } from "@/components/site/Reveal";
import { ClosingCta, SectionHead } from "@/components/site/home/Sections";
import { GlobeStats, ManifestoFloat, StackedExperiences } from "@/components/site/home/Signature";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The Studio" };

const TEAM = [
  { n: "Ira Sen", r: "Founder · Europe", i: IMG.p3, q: "Fewer places, longer stays." },
  { n: "Kenji Aoki", r: "Japan & Korea", i: IMG.p4, q: "Kyoto belongs to early risers." },
  { n: "Maya Rao", r: "Islands & honeymoons", i: IMG.p5, q: "The best room is the quiet one." },
  { n: "Luca Bern", r: "Mountains & trails", i: IMG.p2, q: "Hard days, then a spa." },
];

const VALUES = [
  { id: "v1", title: "Fewer, better", subtitle: "We'd rather you feel a city than tick it off.", image: IMG.alley, count: "Principle 01" },
  { id: "v2", title: "Been there", subtitle: "We never sell a hotel we haven't slept in.", image: IMG.lodgePool, count: "Principle 02" },
  { id: "v3", title: "Human, always", subtitle: "A named planner before, a real concierge during.", image: IMG.airport, count: "Principle 03" },
  { id: "v4", title: "Lighter footprint", subtitle: "Local partners, fair wages, a tree for every traveller.", image: IMG.highlands, count: "Principle 04" },
];

export default async function AboutPage() {
  const db = await getDB();
  const s = db.settings;
  return (
    <>
      <PageHero
        eyebrow="The studio · Mumbai"
        title="Small team."
        accent="Long memories."
        sub="An independent travel studio of twelve planners who have, between them, lived in nine countries."
        image={IMG.backpackLake}
        crumbs={[{ label: "Home", href: "/" }, { label: "Studio" }]}
        meta={[{ label: "Founded", value: "2014" }, { label: "Planners", value: "12" }, { label: "Countries", value: "48" }]}
      />
      <ManifestoFloat eyebrow="What we believe" text={s.manifesto} images={[IMG.flatlay, IMG.tent, IMG.thaiTemple, IMG.bigSur]} cta={{ label: "Start a conversation", href: "/contact" }} />
      <StackedExperiences items={VALUES} heading={{ eyebrow: "How we work", title: "Four", accent: "principles." }} hideCta />
      <div className="h-24" />
      <GlobeStats stats={s.stats} destinations={db.destinations} />

      <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-36">
        <SectionHead eyebrow="The planners" title="People who've" accent="been there." />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {TEAM.map((t, k) => (
            <Reveal key={t.n} delay={k * 0.08}>
              <div className="group relative aspect-[3/4] overflow-hidden r-xl bg-night">
                <Img src={t.i} w={700} alt={t.n} className="h-full w-full object-cover grayscale transition duration-[1.2s] group-hover:scale-110 group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <p className="absolute inset-x-0 bottom-0 translate-y-4 p-4 text-lg font-semibold leading-snug tracking-tight text-white opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100 md:p-6 md:text-2xl">“{t.q}”</p>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <p className="text-lg font-semibold tracking-tight">{t.n}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-mute">0{k + 1}</p>
              </div>
              <p className="text-sm text-mute">{t.r}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <ClosingCta image={IMG.aboveClouds} />
    </>
  );
}
