import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import TourDetail from "@/components/site/TourDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = (await getDB()).tours.find((x) => x.slug === slug);
  return t ? { title: t.title, description: t.summary, openGraph: { images: [t.image] } } : {};
}

export default async function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDB();
  const tour = db.tours.find((t) => t.slug === slug && t.published);
  if (!tour) notFound();
  const destination = db.destinations.find((d) => d.slug === tour.destinationSlug) ?? null;
  const related = db.tours.filter((t) => t.published && t.id !== tour.id && (t.category === tour.category || t.destinationSlug === tour.destinationSlug)).slice(0, 3);
  const reviews = db.testimonials.filter((r) => r.trip === tour.title);
  return <TourDetail tour={tour} destination={destination} related={related.length ? related : db.tours.filter((t) => t.published && t.id !== tour.id).slice(0, 3)} reviews={reviews.length ? reviews : db.testimonials.slice(0, 2)} />;
}
