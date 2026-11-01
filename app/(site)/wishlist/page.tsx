import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import WishlistGrid from "@/components/site/WishlistGrid";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const tours = (await getDB()).tours.filter((t) => t.published);
  return (
    <>
      <PageHero eyebrow="Saved for later" title="Your" accent="wishlist." crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <WishlistGrid tours={tours} />
    </>
  );
}
