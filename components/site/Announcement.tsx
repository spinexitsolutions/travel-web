import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { ArrowRight } from "./Icons";

export default function Announcement({ a }: { a: SiteSettings["announcement"] }) {
  if (!a.enabled) return null;
  return (
    <Link href={a.href || "#"} className="group relative z-40 flex h-9 items-center justify-center gap-2 overflow-hidden bg-ink px-4 text-center text-[12px] text-paper/85">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span className="truncate">{a.text}</span>
      <ArrowRight className="shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
