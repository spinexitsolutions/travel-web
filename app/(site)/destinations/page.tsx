import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import DestinationIndex from "@/components/site/DestinationIndex";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Destinations" };

export default async function DestinationsPage() {
  const db = await getDB();
  return (
    <>
      <PageHero
        eyebrow={`${db.destinations.length} destinations · 6 continents`}
        title="The world,"
        accent="edited."
        sub="Places we return to again and again — each one scouted, slept in and eaten through by our team."
        images={db.destinations.slice(0, 8).map((d) => d.image)}
        crumbs={[{ label: "Home", href: "/" }, { label: "Destinations" }]}
        meta={[
          { label: "Destinations", value: String(db.destinations.length) },
          { label: "Regions", value: String(new Set(db.destinations.map((d) => d.region)).size) },
          { label: "Featured", value: String(db.destinations.filter((d) => d.featured).length) },
        ]}
      />
      <DestinationIndex items={db.destinations} />
    </>
  );
}
