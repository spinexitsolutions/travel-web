import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import { IMG } from "@/lib/seed";
import PageHero from "@/components/site/PageHero";
import ToursExplorer from "@/components/site/ToursExplorer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Journeys" };

export default async function ToursPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const db = await getDB();
  const published = db.tours.filter((t) => t.published);
  return (
    <>
      <PageHero
        eyebrow="Signature journeys"
        title="Every trip,"
        accent="hand-composed."
        sub="Start from one of our signature routes, then make it entirely yours — dates, pace, rooms and all."
        image={IMG.hikerValley}
        crumbs={[{ label: "Home", href: "/" }, { label: "Journeys" }]}
        meta={[
          { label: "Journeys", value: String(published.length) },
          { label: "Destinations", value: String(db.destinations.length) },
          { label: "From", value: `${db.settings.brand.currency}${Math.min(...published.map((t) => t.price)).toLocaleString(db.settings.brand.locale)}` },
        ]}
      />
      <div className="h-10 md:h-16" />
      <ToursExplorer
        tours={published}
        destinations={db.destinations.map((d) => ({ slug: d.slug, name: d.name, country: d.country }))}
        initial={{ q: sp.q, category: sp.category, month: sp.month }}
      />
    </>
  );
}
