"use client";

import { useMemo, useState } from "react";
import { fmtDate, money } from "@/lib/utils";
import { downloadCSV } from "./api";
import { Button, Card, PageHeader, SearchBox, Segmented } from "./ui";

export type Customer = {
  email: string;
  name: string;
  phone: string;
  trips: number;
  enquiries: number;
  value: number;
  lastActivity: string;
  tours: string[];
  subscribed: boolean;
};

function tier(v: number) {
  if (v >= 600000) return { label: "Gold", cls: "bg-amber-100 text-amber-800" };
  if (v >= 200000) return { label: "Silver", cls: "bg-zinc-200 text-zinc-700" };
  if (v > 0) return { label: "Member", cls: "bg-sky-100 text-sky-800" };
  return { label: "Prospect", cls: "bg-ink/5 text-ink/60" };
}

export default function CustomersTable({ customers, currency, locale }: { customers: Customer[]; currency: string; locale: string }) {
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState<"all" | "buyers" | "prospects">("all");
  const m = (n: number) => money(n, currency, locale);
  const list = useMemo(
    () =>
      customers
        .filter((c) => (seg === "buyers" ? c.trips > 0 : seg === "prospects" ? c.trips === 0 : true))
        .filter((c) => [c.name, c.email, c.phone].join(" ").toLowerCase().includes(q.toLowerCase())),
    [customers, q, seg],
  );
  const ltv = customers.filter((c) => c.trips).reduce((s, c) => s + c.value, 0);
  const buyers = customers.filter((c) => c.trips).length;
  const repeat = customers.filter((c) => c.trips > 1).length;

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="A single view of every traveller — built from bookings and enquiries."
        actions={<Button variant="outline" onClick={() => downloadCSV("customers.csv", list.map((c) => ({ ...c, tours: c.tours.join(" | ") })))}>Export CSV</Button>}
      />
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card className="p-4"><div className="text-[12px] text-mute">Customers</div><div className="mt-1 text-2xl font-semibold">{buyers}</div></Card>
        <Card className="p-4"><div className="text-[12px] text-mute">Avg. lifetime value</div><div className="mt-1 text-lg font-semibold tabular-nums sm:text-2xl">{m(buyers ? ltv / buyers : 0)}</div></Card>
        <Card className="p-4"><div className="text-[12px] text-mute">Repeat travellers</div><div className="mt-1 text-2xl font-semibold">{repeat}</div></Card>
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented value={seg} onChange={setSeg} options={[{ value: "all", label: "All" }, { value: "buyers", label: "Customers" }, { value: "prospects", label: "Prospects" }]} />
        <SearchBox value={q} onChange={setQ} placeholder="Search people…" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => {
          const t = tier(c.value);
          return (
            <Card key={c.email} className="p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-semibold text-paper">
                  {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{c.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.cls}`}>{t.label}</span>
                  </div>
                  <div className="truncate text-[12px] text-mute">{c.email}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-ink/[0.03] py-2"><div className="text-[15px] font-semibold">{c.trips}</div><div className="text-[10px] text-mute">Trips</div></div>
                <div className="rounded-xl bg-ink/[0.03] py-2"><div className="text-[15px] font-semibold">{c.enquiries}</div><div className="text-[10px] text-mute">Enquiries</div></div>
                <div className="rounded-xl bg-ink/[0.03] py-2"><div className="truncate px-1 text-[13px] font-semibold tabular-nums">{m(c.value)}</div><div className="text-[10px] text-mute">LTV</div></div>
              </div>
              {c.tours.length > 0 && <div className="mt-3 truncate text-[12px] text-mute">{c.tours.join(" · ")}</div>}
              <div className="mt-3 flex items-center justify-between text-[12px]">
                <span className="text-mute">Last active {fmtDate(c.lastActivity)}{c.subscribed ? " · ✉︎ subscribed" : ""}</span>
                <div className="flex gap-1.5">
                  <a href={`mailto:${c.email}`} className="rounded-full border border-line px-2.5 py-1 hover:bg-white">Email</a>
                  {c.phone && <a href={`https://wa.me/${c.phone.replace(/[^\d]/g, "")}`} target="_blank" className="rounded-full border border-line px-2.5 py-1 hover:bg-white">WA</a>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
