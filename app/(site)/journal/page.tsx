import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import HoverList from "@/components/site/HoverList";
import { JournalBento } from "@/components/site/home/Signature";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Journal" };

export default async function JournalPage() {
  const posts = (await getDB()).posts.filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date));
  const cats = Array.from(new Set(posts.map((p) => p.category)));
  return (
    <>
      <PageHero
        eyebrow="The journal"
        title="Notes from"
        accent="the road."
        sub="Field guides, slow-travel essays and the little things we've learned across 10,000 trips."
        images={posts.map((p) => p.cover).concat(posts.map((p) => p.cover)).slice(0, 8)}
        crumbs={[{ label: "Home", href: "/" }, { label: "Journal" }]}
        meta={[
          { label: "Stories", value: String(posts.length) },
          { label: "Topics", value: String(cats.length) },
          { label: "Latest", value: posts[0] ? fmtDate(posts[0].date, { day: "numeric", month: "short" }) : "—" },
        ]}
      />
      <div className="pt-6">
        <JournalBento posts={posts} />
      </div>
      <section className="mx-auto max-w-[1440px] px-5 pb-28 md:px-10">
        <h2 className="display mb-8 text-5xl md:text-7xl">Every <span className="hl">story</span></h2>
        <HoverList
          template="56px minmax(0,2.4fr) 140px 120px 100px 48px"
          head={["No.", "Story", "Topic", "Published", "Read"]}
          rows={posts.map((p) => ({
            key: p.id,
            href: `/journal/${p.slug}`,
            image: p.cover,
            title: p.title,
            sub: `${p.category} · ${p.readTime} min`,
            cells: [p.category, fmtDate(p.date, { day: "numeric", month: "short", year: "numeric" }), `${p.readTime} min`],
            badge: `By ${p.author}`,
          }))}
        />
      </section>
    </>
  );
}
