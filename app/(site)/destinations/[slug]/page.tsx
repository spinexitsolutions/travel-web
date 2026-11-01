import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import HoverList from "@/components/site/HoverList";
import { ManifestoFloat } from "@/components/site/home/Signature";
import Img from "@/components/site/Img";
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
      <PageHero
        eyebrow={`${d.country} · ${d.region}`}
        title={d.name}
        sub={d.tagline}
        image={d.image}
        crumbs={[{ label: "Home", href: "/" }, { label: "Destinations", href: "/destinations" }, { label: d.name }]}
        meta={[
          { label: "Best time", value: d.bestTime },
          { label: "From", value: money(d.startingPrice, b.currency, b.locale) },
          { label: "Journeys", value: String(tours.length) },
        ]}
      />
      <ManifestoFloat
        eyebrow={`Why ${d.name}`}
        text={d.description}
        images={[...d.gallery, ...others.map((o) => o.image), d.image].slice(0, 4)}
        cta={{ label: `Plan a trip to ${d.name}`, href: `/contact?destination=${encodeURIComponent(d.name)}` }}
      />
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
        <h2 className="display text-5xl md:text-7xl">Journeys in <span className="hl text-accent">{d.name}</span></h2>
        {tours.length ? (
          <div className="mt-10">
            <HoverList
              template="56px minmax(0,2fr) 120px 100px 150px 48px"
              head={["No.", "Journey", "Style", "Length", "From"]}
              rows={tours.map((t) => ({
                key: t.id,
                href: `/tours/${t.slug}`,
                image: t.image,
                title: t.title,
                sub: `${t.days} days · ${money(t.price, b.currency, b.locale)}`,
                cells: [t.category, `${t.days} days`, money(t.price, b.currency, b.locale)],
                badge: `★ ${t.rating.toFixed(1)}`,
              }))}
            />
          </div>
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
