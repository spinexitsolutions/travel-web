import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import Img from "@/components/site/Img";
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
      <PageHero eyebrow={`${post.category} · ${fmtDate(post.date)} · ${post.readTime} min read`} title={post.title} image={post.cover} />
      <article className="mx-auto max-w-[720px] px-5 py-20 md:py-28">
        <p className="text-2xl leading-snug tracking-[-0.02em] md:text-3xl">{post.excerpt}</p>
        <div className="mt-10 space-y-6 text-lg leading-relaxed text-ink/80">
          {paras.map((p, k) => (
            <p key={k} className={k === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:italic first-letter:leading-[0.8] first-letter:text-accent" : ""}>{p}</p>
          ))}
        </div>
        <div className="mt-14 flex items-center justify-between border-t border-line pt-6 text-sm">
          <span>Written by <b className="font-medium">{post.author}</b></span>
          <Link href="/journal" className="link-u">← All stories</Link>
        </div>
      </article>
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
