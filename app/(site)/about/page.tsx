import type { Metadata } from "next";
import Link from "next/link";
import { getDB } from "@/lib/db";
import { IMG } from "@/lib/seed";
import PageHero from "@/components/site/PageHero";
import Img from "@/components/site/Img";
import { Reveal } from "@/components/site/Reveal";
import { Stats } from "@/components/site/home/Sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The Studio" };

const TEAM = [
  { n: "Ira Sen", r: "Founder · Europe", i: IMG.p3 },
  { n: "Kenji Aoki", r: "Japan & Korea", i: IMG.p4 },
  { n: "Maya Rao", r: "Islands & honeymoons", i: IMG.p5 },
  { n: "Luca Bern", r: "Mountains & trails", i: IMG.p2 },
];
const VALUES = [
  ["Fewer, better", "Fewer places, longer stays. We’d rather you feel a city than tick it off."],
  ["Been there", "We never sell a hotel we haven’t slept in or a guide we haven’t walked with."],
  ["Human, always", "A named planner before, a real concierge during — never a call centre."],
  ["Lighter footprint", "Local partners, fair wages, and a tree planted for every traveller."],
];

export default async function AboutPage() {
  const s = (await getDB()).settings;
  return (
    <>
      <PageHero eyebrow="The studio" title="Small team." accent="Long memories." sub={s.manifesto} image={IMG.backpackLake} />
      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <div className="grid gap-12 md:grid-cols-2">
          <Reveal><h2 className="display text-5xl md:text-7xl">What we <span className="hl text-accent">believe.</span></h2></Reveal>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius)] bg-line sm:grid-cols-2">
            {VALUES.map(([t, d], k) => (
              <Reveal key={t} delay={k * 0.06} className="bg-paper p-6 md:p-8">
                <p className="font-mono text-xs text-accent">0{k + 1}</p>
                <p className="mt-6 text-2xl font-medium tracking-tight">{t}</p>
                <p className="mt-2 text-sm text-mute">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <Stats stats={s.stats} image={IMG.himalaya} />
      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <h2 className="display text-5xl md:text-7xl">The <span className="hl text-accent">planners.</span></h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {TEAM.map((t, k) => (
            <Reveal key={t.n} delay={k * 0.08}>
              <div className="r-xl group aspect-[3/4] overflow-hidden">
                <Img src={t.i} w={700} alt={t.n} className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
              </div>
              <p className="mt-3 text-lg font-medium tracking-tight">{t.n}</p>
              <p className="text-sm text-mute">{t.r}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-20 text-center">
          <Link href="/contact" className="inline-flex rounded-md bg-ink px-7 py-4 text-paper transition hover:bg-accent">Talk to a planner</Link>
        </div>
      </section>
    </>
  );
}
