import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import DestinationGrid from "@/components/site/DestinationGrid";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Destinations" };

export default async function DestinationsPage() {
  const db = await getDB();
  return (
    <>
      <PageHero eyebrow={`${db.destinations.length} destinations · 6 continents`} title="The world," accent="edited." sub="Places we return to again and again — each one scouted, slept in and eaten through by our team." />
      <DestinationGrid items={db.destinations} />
    </>
  );
}
