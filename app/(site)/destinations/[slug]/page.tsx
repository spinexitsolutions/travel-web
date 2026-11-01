import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import TourCard from "@/components/site/TourCard";
import Img from "@/components/site/Img";
import { Reveal } from "@/components/site/Reveal";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = (await getDB()).destinations.find((x) => x.slug === slug);
  return d ? { title: `${d.name}, ${d.country}`, description: d.description } : {};
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDB();
  const d = db.destinations.find((x) => x.slug === slug);
  if (!d) notFound();
  const tours = db.tours.filter((t) => t.published && t.destinationSlug === d.slug);
  const others = db.destinations.filter((x) => x.id !== d.id && x.region === d.region).slice(0, 4);
  const b = db.settings.brand;
  return (
    <>
      <PageHero eyebrow={`${d.country} · ${d.region}`} title={d.name} sub={d.tagline} image={d.image} />
      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 md:grid-cols-[1.3fr_1fr] md:px-10 md:py-28">
        <Reveal>
          <p className="text-[7vw] font-medium leading-[1.15] tracking-[-0.035em] md:text-[2.6vw]">{d.description}</p>
        </Reveal>
        <Reveal delay={0.1} className="grid grid-cols-2 content-start gap-3">
          {[
            ["Best time", d.bestTime],
            ["From", money(d.startingPrice, b.currency, b.locale)],
            ["Journeys", String(tours.length)],
            ["Region", d.region],
          ].map(([l, v]) => (
            <div key={l} className="r-lg bg-card p-5">
              <p className="eyebrow text-mute">{l}</p>
              <p className="mt-2 text-xl font-medium tracking-tight">{v}</p>
            </div>
          ))}
          <Link href={`/contact?destination=${encodeURIComponent(d.name)}`} className="col-span-2 rounded-full bg-ink py-4 text-center text-sm text-paper transition hover:bg-accent">Plan a trip to {d.name}</Link>
        </Reveal>
      </section>
      {d.gallery.length > 1 && (
        <section className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-5 md:px-10">
          {d.gallery.map((g, k) => (
            <div key={k} className="r-xl h-[60vh] w-[85vw] shrink-0 snap-center overflow-hidden md:w-[45vw]">
              <Img src={g} w={1400} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </section>
      )}
      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10">
        <h2 className="display text-5xl md:text-7xl">Journeys in <span className="serif-i text-accent">{d.name}</span></h2>
        {tours.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{tours.map((t) => <TourCard key={t.id} tour={t} />)}</div>
        ) : (
          <p className="mt-6 text-mute">Every {d.name} trip we plan is bespoke. <Link className="link-u text-ink" href="/contact">Tell us your dates →</Link></p>
        )}
      </section>
      {others.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
          <p className="eyebrow text-mute">Nearby inspiration</p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {others.map((o) => (
              <Link key={o.id} href={`/destinations/${o.slug}`} className="r-lg group relative aspect-[3/4] overflow-hidden">
                <Img src={o.image} w={600} alt={o.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <p className="absolute bottom-4 left-4 text-2xl font-medium tracking-tight text-white">{o.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
