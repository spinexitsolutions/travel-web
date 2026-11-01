import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import Img from "@/components/site/Img";
import ReadingProgress from "@/components/site/ReadingProgress";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getDB()).posts.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.excerpt, openGraph: { images: [p.cover] } } : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDB();
  const post = db.posts.find((p) => p.slug === slug && p.published);
  if (!post) notFound();
  const more = db.posts.filter((p) => p.published && p.id !== post.id).slice(0, 2);
  const paras = post.content.split(/\n\s*\n/).filter(Boolean);
  return (
    <>
      <PageHero
        eyebrow={`${post.category} · ${post.readTime} min read`}
        title={post.title}
        image={post.cover}
        crumbs={[{ label: "Home", href: "/" }, { label: "Journal", href: "/journal" }, { label: post.category }]}
        meta={[
          { label: "Written by", value: post.author },
          { label: "Published", value: fmtDate(post.date) },
          { label: "Reading time", value: `${post.readTime} min` },
        ]}
      />
      <ReadingProgress>
        <article className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 md:grid-cols-[200px_minmax(0,1fr)] md:py-28">
          <aside className="md:sticky md:top-28 md:self-start">
            <div className="flex items-center gap-3 md:flex-col md:items-start">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-lg font-bold text-on-accent">{post.author.split(" ").map((x) => x[0]).join("")}</span>
              <div>
                <p className="font-semibold">{post.author}</p>
                <p className="text-sm text-mute">Travel planner</p>
              </div>
            </div>
            <div className="mt-6 hidden space-y-1 border-t border-line pt-5 font-mono text-[11px] uppercase tracking-wider text-mute md:block">
              <p>{fmtDate(post.date)}</p>
              <p>{post.readTime} minute read</p>
              <p>{post.category}</p>
            </div>
            <Link href="/journal" className="link-u mt-6 hidden text-sm md:inline-block">← All stories</Link>
          </aside>
          <div className="min-w-0 max-w-[720px]">
            <p className="text-2xl font-medium leading-snug tracking-[-0.02em] md:text-[2rem]">{post.excerpt}</p>
            <div className="mt-10 space-y-6 text-lg leading-[1.75] text-ink/80">
              {paras.map((p, k) => (
                <div key={k}>
                  <p className={k === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-[family-name:var(--font-display)] first-letter:text-7xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-accent" : ""}>{p}</p>
                  {k === 0 && paras.length > 2 && (
                    <blockquote className="my-12 border-l-4 border-accent pl-6 text-3xl font-semibold leading-tight tracking-[-0.03em] text-ink md:text-4xl">
                      “{paras[paras.length - 1].split(".")[0]}.”
                    </blockquote>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-6">
              <p className="text-lg font-semibold tracking-tight">Want a trip like this, planned for you?</p>
              <Link href="/contact" className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent">Talk to {post.author.split(" ")[0]}</Link>
            </div>
          </div>
        </article>
      </ReadingProgress>
      {more.length > 0 && (
        <section className="mx-auto grid max-w-[1400px] gap-6 px-5 pb-28 md:grid-cols-2 md:px-10">
          {more.map((p) => (
            <Link key={p.id} href={`/journal/${p.slug}`} className="r-xl group relative block aspect-[16/10] overflow-hidden">
              <Img src={p.cover} w={1200} alt={p.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <p className="text-xs text-white/70">Up next · {p.category}</p>
                <h3 className="mt-2 text-3xl font-medium tracking-[-0.03em]">{p.title}</h3>
              </div>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
