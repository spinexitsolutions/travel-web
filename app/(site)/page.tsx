import { getDB } from "@/lib/db";
import { IMG } from "@/lib/seed";
import Hero from "@/components/site/home/Hero";
import {
  ClosingCta,
  DestinationsRail,
  Experiences,
  FaqSection,
  FeaturedTours,
  Journal,
  Manifesto,
  PlacesMarquee,
  Process,
  Stats,
  Testimonials,
} from "@/components/site/home/Sections";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await getDB();
  const s = db.settings;
  const on = s.sections;
  const tours = db.tours.filter((t) => t.published);
  const featured = [...tours].sort((a, b) => Number(b.featured) - Number(a.featured));
  const featuredDest = db.destinations.filter((d) => d.featured);

  return (
    <>
      <Hero destinations={db.destinations.map((d) => d.name)} />
      {on.marquee && <PlacesMarquee items={db.destinations.map((d) => ({ name: d.name, image: d.image }))} />}
      {on.manifesto && <Manifesto text={s.manifesto} images={[IMG.alley, IMG.santorini]} />}
      {on.destinations && <DestinationsRail items={featuredDest.length ? featuredDest : db.destinations} />}
      {on.tours && <FeaturedTours tours={featured} />}
      {on.experiences && <Experiences items={db.experiences} />}
      {on.stats && <Stats stats={s.stats} image={IMG.aboveClouds} />}
      {on.process && <Process images={{ flatlay: IMG.flatlay, alley: IMG.alley, airport: IMG.airport, santorini: IMG.aerialBoats }} />}
      {on.testimonials && <Testimonials items={db.testimonials} />}
      {on.journal && <Journal posts={db.posts.filter((p) => p.published)} />}
      {on.faq && <FaqSection items={db.faqs} />}
      {on.newsletter && <ClosingCta image={IMG.backpackLake} />}
    </>
  );
}
