import { getDB } from "@/lib/db";
import { IMG } from "@/lib/seed";
import Hero from "@/components/site/home/Hero";
import HeroPostcard from "@/components/site/home/HeroPostcard";
import HeroHorizon from "@/components/site/home/HeroHorizon";
import { FlightPath, GlobeStats, JourneyIndex, JournalBento, ManifestoFloat, ReviewWall, StackedExperiences, VelocityMarquee } from "@/components/site/home/Signature";
import HeroCinematic, { type CineSlide } from "@/components/site/home/HeroCinematic";
import {
  ClosingCta,
  DestinationsRail,
  FaqSection,
} from "@/components/site/home/Sections";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await getDB();
  const s = db.settings;
  const on = s.sections;
  const tours = db.tours.filter((t) => t.published);
  const featured = [...tours].sort((a, b) => Number(b.featured) - Number(a.featured));
  const featuredDest = db.destinations.filter((d) => d.featured);
  const destNames = db.destinations.map((d) => d.name);
  const layout = s.hero.layout ?? "cinematic";
  const cineSource = featuredDest.length ? featuredDest : db.destinations;
  const cine: CineSlide[] = cineSource.slice(0, 6).map((d) => {
    const tour = tours.find((t) => t.destinationSlug === d.slug);
    return {
      image: d.image,
      name: d.name,
      country: d.country,
      tagline: d.tagline,
      bestTime: d.bestTime,
      price: tour?.price ?? d.startingPrice,
      href: tour ? `/tours/${tour.slug}` : `/destinations/${d.slug}`,
    };
  });

  return (
    <>
      {layout === "mask" ? (
        <HeroHorizon destinations={destNames} />
      ) : layout === "window" ? (
        <Hero destinations={destNames} />
      ) : layout === "stack" ? (
        <HeroPostcard destinations={destNames} />
      ) : (
        <HeroCinematic slides={cine} destinations={destNames} />
      )}
      {on.marquee && <VelocityMarquee items={db.destinations.slice(0, 8).map((d) => ({ name: d.name, image: d.image }))} />}
      {on.manifesto && <ManifestoFloat text={s.manifesto} images={[IMG.alley, IMG.tent, IMG.scuba, IMG.aerialBoats]} />}
      {on.destinations && <DestinationsRail items={featuredDest.length ? featuredDest : db.destinations} />}
      {on.tours && <JourneyIndex tours={featured} destinations={db.destinations} />}
      {on.experiences && <StackedExperiences items={db.experiences} />}
      {on.stats && <GlobeStats stats={s.stats} destinations={db.destinations} />}
      {on.process && <FlightPath />}
      {on.testimonials && <ReviewWall items={db.testimonials} />}
      {on.journal && <JournalBento posts={db.posts.filter((p) => p.published)} />}
      {on.faq && <FaqSection items={db.faqs} />}
      {on.newsletter && <ClosingCta image={IMG.backpackLake} />}
    </>
  );
}
