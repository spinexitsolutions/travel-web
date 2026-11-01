import type { Metadata } from "next";
import Link from "next/link";
import { getDB } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import Img from "@/components/site/Img";
import { Reveal } from "@/components/site/Reveal";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Journal" };

export default async function JournalPage() {
  const posts = (await getDB()).posts.filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date));
  const [lead, ...rest] = posts;
  return (
    <>
      <PageHero eyebrow="The journal" title="Notes from" accent="the road." sub="Field guides, slow-travel essays and the little things we've learned across 10,000 trips." />
      <section className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
        {lead && (
          <Reveal>
            <Link href={`/journal/${lead.slug}`} data-cursor="Read" className="group grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
              <div className="r-xl aspect-[16/11] overflow-hidden">
                <Img src={lead.cover} w={1600} alt={lead.title} priority className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-105" />
              </div>
              <div>
                <p className="text-xs text-mute">{lead.category} · {fmtDate(lead.date)} · {lead.readTime} min read</p>
                <h2 className="display mt-4 text-5xl transition-colors group-hover:text-accent md:text-6xl">{lead.title}</h2>
                <p className="mt-4 text-mute">{lead.excerpt}</p>
                <p className="mt-6 text-sm">By {lead.author}</p>
              </div>
            </Link>
          </Reveal>
        )}
        <div className="mt-20 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, k) => (
            <Reveal key={p.id} delay={(k % 3) * 0.08}>
              <Link href={`/journal/${p.slug}`} data-cursor="Read" className="group block">
                <div className="r-xl aspect-[4/3] overflow-hidden">
                  <Img src={p.cover} w={900} alt={p.title} className="h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
                </div>
                <p className="mt-4 text-xs text-mute">{p.category} · {fmtDate(p.date)} · {p.readTime} min</p>
                <h3 className="mt-2 text-2xl font-medium leading-tight tracking-[-0.03em] transition-colors group-hover:text-accent">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-mute">{p.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
