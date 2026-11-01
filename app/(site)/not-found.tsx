import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80svh] max-w-[1400px] flex-col justify-center px-5 md:px-10">
      <p className="eyebrow text-mute">Error 404</p>
      <h1 className="display mt-4 text-[18vw] md:text-[11rem]">Off the <span className="serif-i text-accent">map.</span></h1>
      <p className="mt-4 max-w-md text-mute">Even the best explorers take a wrong turn. Let’s get you somewhere beautiful.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-full bg-ink px-6 py-3 text-sm text-paper hover:bg-accent">Back home</Link>
        <Link href="/tours" className="rounded-full border border-line px-6 py-3 text-sm hover:border-ink">Browse journeys</Link>
      </div>
    </section>
  );
}
