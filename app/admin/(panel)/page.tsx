import Link from "next/link";
import { getDB } from "@/lib/db";
import { fmtDate, money } from "@/lib/utils";
import { Badge, Card, PageHeader, Thumb } from "@/components/admin/ui";
import { Funnel, RevenueChart } from "@/components/admin/Charts";
import type { LeadStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const EARNING = new Set(["paid", "confirmed", "completed"]);
const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "#38bdf8",
  contacted: "#a78bfa",
  qualified: "#fbbf24",
  proposal: "#fb923c",
  won: "#10b981",
  lost: "#a1a1aa",
};

export default async function Dashboard() {
  const db = await getDB();
  const { currency, locale } = db.settings.brand;
  const m = (n: number) => money(n, currency, locale);

  const earning = db.bookings.filter((b) => EARNING.has(b.status));
  const revenue = earning.reduce((s, b) => s + b.total, 0);
  const openLeads = db.leads.filter((l) => !["won", "lost"].includes(l.status)).length;
  const closed = db.leads.filter((l) => ["won", "lost"].includes(l.status));
  const conversion = closed.length ? Math.round((db.leads.filter((l) => l.status === "won").length / closed.length) * 100) : 0;
  const pipelineValue = db.leads.filter((l) => !["won", "lost"].includes(l.status)).reduce((s, l) => s + (l.value || 0), 0);

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GB", { month: "short" }), value: 0, count: 0 };
  });
  for (const b of earning) {
    const d = new Date(b.createdAt);
    const mo = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (mo) {
      mo.value += b.total;
      mo.count++;
    }
  }
  const sixMonthTotal = months.reduce((a, x) => a + x.value, 0);
  const DAY = 864e5;
  const inWindow = (from: number, to: number) =>
    earning.filter((b) => {
      const age = now.getTime() - +new Date(b.createdAt);
      return age >= from * DAY && age < to * DAY;
    }).reduce((a, b) => a + b.total, 0);
  const last30 = inWindow(0, 30);
  const prev30 = inWindow(30, 60);
  const delta = prev30 ? Math.round(((last30 - prev30) / prev30) * 100) : 0;

  const statuses: LeadStatus[] = ["new", "contacted", "qualified", "proposal", "won", "lost"];
  const funnel = statuses.map((s) => ({ label: s, value: db.leads.filter((l) => l.status === s).length, color: STATUS_COLORS[s] }));

  const byTour = new Map<string, { title: string; revenue: number; count: number }>();
  for (const b of earning) {
    const t = byTour.get(b.tourSlug) ?? { title: b.tourTitle, revenue: 0, count: 0 };
    t.revenue += b.total;
    t.count += b.travelers;
    byTour.set(b.tourSlug, t);
  }
  const top = [...byTour.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
  const tourImg = (slug: string) => db.tours.find((t) => t.slug === slug)?.image;

  const recentBookings = [...db.bookings].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);
  const recentLeads = [...db.leads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);

  const kpis = [
    { label: "Revenue", value: m(revenue), sub: `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}% last 30 days`, tone: delta >= 0 ? "text-emerald-600" : "text-red-600" },
    { label: "Bookings", value: String(db.bookings.length), sub: `${db.bookings.filter((b) => b.status === "pending").length} pending`, tone: "text-mute" },
    { label: "Open leads", value: String(openLeads), sub: `${m(pipelineValue)} pipeline`, tone: "text-mute" },
    { label: "Conversion", value: `${conversion}%`, sub: "won / closed leads", tone: "text-mute" },
    { label: "Subscribers", value: String(db.subscribers.length), sub: "newsletter list", tone: "text-mute" },
  ];

  const hour = now.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        title={`${greet}.`}
        subtitle={`Here's how ${db.settings.brand.name} is doing — ${now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}.`}
        actions={
          <>
            <Link href="/admin/leads" className="inline-flex h-10 items-center rounded-full border border-line bg-white/60 px-4 text-sm font-medium hover:bg-white">Open pipeline</Link>
            <Link href="/admin/tours" className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-medium text-paper hover:bg-ink/85">+ New journey</Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className={`rounded-2xl border p-5 ${i === 0 ? "col-span-2 border-transparent text-white md:col-span-1" : "border-line bg-white/70"}`}
            style={i === 0 ? { background: "var(--night)" } : undefined}
          >
            <div className={`text-[12px] font-medium ${i === 0 ? "text-white/60" : "text-mute"}`}>{k.label}</div>
            <div className="mt-2 truncate text-[26px] font-semibold tracking-[-0.03em] tabular-nums">{k.value}</div>
            <div className={`mt-1 text-[12px] ${i === 0 ? (delta >= 0 ? "text-emerald-400" : "text-red-400") : k.tone}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <div className="text-[15px] font-semibold tracking-tight">Revenue</div>
              <div className="text-[12px] text-mute">Paid, confirmed & completed bookings · last 6 months</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold tabular-nums">{m(sixMonthTotal)}</div>
              <div className="text-[11px] text-mute">6-month total</div>
            </div>
          </div>
          <RevenueChart data={months.map(({ label, value, count }) => ({ label, value, count }))} currency={currency} locale={locale} />
        </Card>
        <Card>
          <div className="mb-4 text-[15px] font-semibold tracking-tight">Lead pipeline</div>
          <Funnel rows={funnel} />
          <Link href="/admin/leads" className="mt-5 inline-block text-[13px] font-medium text-accent">Manage leads →</Link>
        </Card>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[15px] font-semibold tracking-tight">Recent bookings</div>
            <Link href="/admin/bookings" className="text-[13px] text-mute hover:text-ink">View all</Link>
          </div>
          <ul className="divide-y divide-line">
            {recentBookings.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3">
                <Thumb src={tourImg(b.tourSlug)} className="h-10 w-10 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{b.name}</div>
                  <div className="truncate text-[12px] text-mute">{b.tourTitle} · {b.travelers} pax · {fmtDate(b.date)}</div>
                </div>
                <div className="hidden sm:block"><Badge tone={b.status}>{b.status}</Badge></div>
                <div className="w-24 text-right text-sm font-medium tabular-nums">{m(b.total)}</div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[15px] font-semibold tracking-tight">New enquiries</div>
            <Link href="/admin/leads" className="text-[13px] text-mute hover:text-ink">View all</Link>
          </div>
          <ul className="divide-y divide-line">
            {recentLeads.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/5 text-[13px] font-semibold">
                  {l.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{l.name}</div>
                  <div className="truncate text-[12px] text-mute">{l.destination || "—"} · {l.source}</div>
                </div>
                <Badge tone={l.status}>{l.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-3">
        <div className="mb-3 text-[15px] font-semibold tracking-tight">Top journeys</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {top.map(([slug, t], i) => (
            <div key={slug} className="group relative overflow-hidden rounded-2xl">
              <Thumb src={tourImg(slug)} className="aspect-[4/5] rounded-2xl transition duration-700 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-xs font-semibold">{i + 1}</div>
              <div className="absolute inset-x-3 bottom-3 text-white">
                <div className="text-sm font-medium leading-tight">{t.title}</div>
                <div className="mt-1 text-[12px] text-white/70">{m(t.revenue)} · {t.count} travellers</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
