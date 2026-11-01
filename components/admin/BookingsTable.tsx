"use client";

import { useMemo, useState } from "react";
import type { Booking, BookingStatus, Tour } from "@/lib/types";
import { cn, fmtDate, money } from "@/lib/utils";
import { adminApi, downloadCSV } from "./api";
import { useToast } from "./Toast";
import { Badge, Button, Card, Drawer, Empty, Field, Input, PageHeader, SearchBox, Select, Textarea } from "./ui";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "paid", "completed", "cancelled"];

export default function BookingsTable({
  initial,
  tours,
  currency,
  locale,
}: {
  initial: Booking[];
  tours: Pick<Tour, "slug" | "title" | "price">[];
  currency: string;
  locale: string;
}) {
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | BookingStatus>("all");
  const [sel, setSel] = useState<(Omit<Booking, "id"> & { id?: string }) | null>(null);
  const m = (n: number) => money(n, currency, locale);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows
      .filter((r) => status === "all" || r.status === status)
      .filter((r) => !s || [r.ref, r.name, r.email, r.tourTitle].join(" ").toLowerCase().includes(s))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [rows, q, status]);

  const totals = useMemo(() => {
    const earn = filtered.filter((r) => ["paid", "confirmed", "completed"].includes(r.status));
    return {
      revenue: earn.reduce((s, r) => s + r.total, 0),
      travellers: filtered.reduce((s, r) => s + r.travelers, 0),
      pending: filtered.filter((r) => r.status === "pending").reduce((s, r) => s + r.total, 0),
    };
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const changeStatus = async (id: string, s: BookingStatus) => {
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: s } : r)));
    try {
      await adminApi.update("bookings", id, { status: s });
      toast(`Booking marked ${s}`);
    } catch (e) {
      setRows(prev);
      toast((e as Error).message, "error");
    }
  };

  const save = async () => {
    if (!sel) return;
    if (!sel.name || !sel.tourSlug) return toast("Guest name and journey are required", "error");
    const tour = tours.find((t) => t.slug === sel.tourSlug);
    const body = { ...sel, tourTitle: tour?.title ?? sel.tourTitle };
    try {
      if (sel.id) {
        const saved = await adminApi.update<Booking>("bookings", sel.id, body);
        setRows((rs) => rs.map((r) => (r.id === saved.id ? saved : r)));
      } else {
        const saved = await adminApi.create<Booking>("bookings", body);
        setRows((rs) => [saved, ...rs]);
      }
      toast("Booking saved");
      setSel(null);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    await adminApi.remove("bookings", id);
    setRows((rs) => rs.filter((r) => r.id !== id));
    setSel(null);
    toast("Booking deleted");
  };

  const newBooking = () => {
    const t = tours[0];
    setSel({
      ref: `VJ-${Date.now().toString(36).slice(-5).toUpperCase()}`,
      tourSlug: t?.slug ?? "",
      tourTitle: t?.title ?? "",
      name: "",
      email: "",
      phone: "",
      date: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
      travelers: 2,
      total: (t?.price ?? 0) * 2,
      status: "pending",
      requests: "",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle="Every confirmed seat, payment and departure."
        actions={
          <>
            <Button variant="outline" onClick={() => downloadCSV("bookings.csv", filtered as unknown as Record<string, unknown>[])}>Export CSV</Button>
            <Button onClick={newBooking}>+ New booking</Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card className="p-4"><div className="text-[12px] text-mute">Revenue (filtered)</div><div className="mt-1 text-lg font-semibold tabular-nums sm:text-2xl">{m(totals.revenue)}</div></Card>
        <Card className="p-4"><div className="text-[12px] text-mute">Awaiting payment</div><div className="mt-1 text-lg font-semibold tabular-nums sm:text-2xl">{m(totals.pending)}</div></Card>
        <Card className="p-4"><div className="text-[12px] text-mute">Travellers</div><div className="mt-1 text-lg font-semibold tabular-nums sm:text-2xl">{totals.travellers}</div></Card>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium capitalize transition", status === s ? "bg-ink text-paper" : "bg-ink/5 text-ink/60 hover:text-ink")}
            >
              {s} <span className="opacity-50">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Search ref, guest, journey…" />
      </div>

      {filtered.length === 0 ? (
        <Empty>No bookings match these filters.</Empty>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {filtered.map((r) => (
              <button key={r.id} onClick={() => setSel(r)} className="w-full rounded-2xl border border-line bg-white/70 p-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-mute">{r.ref}</span>
                  <Badge tone={r.status}>{r.status}</Badge>
                </div>
                <div className="mt-2 font-medium">{r.name}</div>
                <div className="text-[13px] text-mute">{r.tourTitle}</div>
                <div className="mt-2 flex justify-between text-[13px]">
                  <span>{fmtDate(r.date)} · {r.travelers} pax</span>
                  <span className="font-semibold tabular-nums">{m(r.total)}</span>
                </div>
              </button>
            ))}
          </div>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-white/70 md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-[12px] text-mute">
                <tr>
                  <th className="px-4 py-3 font-medium">Ref</th>
                  <th className="px-4 py-3 font-medium">Guest</th>
                  <th className="px-4 py-3 font-medium">Journey</th>
                  <th className="px-4 py-3 font-medium">Departure</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => setSel(r)} className="cursor-pointer transition hover:bg-ink/[0.02]">
                    <td className="px-4 py-3 font-mono text-[12px] text-mute">{r.ref}</td>
                    <td className="px-4 py-3"><div className="font-medium">{r.name}</div><div className="text-[12px] text-mute">{r.email}</div></td>
                    <td className="px-4 py-3">{r.tourTitle}<div className="text-[12px] text-mute">{r.travelers} travellers</div></td>
                    <td className="px-4 py-3">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{m(r.total)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value as BookingStatus)} className="rounded-full border border-line bg-white px-2.5 py-1 text-[12px] capitalize">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Drawer
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel?.id ? `Booking ${sel.ref}` : "New booking"}
        footer={
          <>
            {sel?.id ? <Button variant="ghost" className="text-red-600" onClick={() => del(sel.id!)}>Delete</Button> : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSel(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </>
        }
      >
        {sel && (
          <div className="space-y-4">
            {sel.id && (
              <div className="flex flex-wrap gap-1.5">
                {sel.email && <a className="rounded-full border border-line px-3 py-1.5 text-[12px] hover:bg-white" href={`mailto:${sel.email}?subject=Your journey ${sel.ref}`}>Email guest</a>}
                {sel.phone && <a className="rounded-full bg-emerald-500 px-3 py-1.5 text-[12px] text-white" target="_blank" href={`https://wa.me/${sel.phone.replace(/[^\d]/g, "")}`}>WhatsApp</a>}
              </div>
            )}
            <Field label="Journey">
              <Select
                value={sel.tourSlug}
                onChange={(e) => {
                  const t = tours.find((x) => x.slug === e.target.value);
                  setSel({ ...sel, tourSlug: e.target.value, tourTitle: t?.title ?? "", total: (t?.price ?? 0) * sel.travelers });
                }}
                options={tours.map((t) => ({ value: t.slug, label: t.title }))}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Guest name"><Input value={sel.name} onChange={(e) => setSel({ ...sel, name: e.target.value })} /></Field>
              <Field label="Email"><Input value={sel.email} onChange={(e) => setSel({ ...sel, email: e.target.value })} /></Field>
              <Field label="Phone"><Input value={sel.phone} onChange={(e) => setSel({ ...sel, phone: e.target.value })} /></Field>
              <Field label="Departure"><Input type="date" value={sel.date} onChange={(e) => setSel({ ...sel, date: e.target.value })} /></Field>
              <Field label="Travellers">
                <Input type="number" min={1} value={sel.travelers} onChange={(e) => {
                  const n = Math.max(1, Number(e.target.value));
                  const t = tours.find((x) => x.slug === sel.tourSlug);
                  setSel({ ...sel, travelers: n, total: t ? t.price * n : sel.total });
                }} />
              </Field>
              <Field label={`Total (${currency})`}><Input type="number" value={sel.total} onChange={(e) => setSel({ ...sel, total: Number(e.target.value) })} /></Field>
              <Field label="Status"><Select value={sel.status} onChange={(e) => setSel({ ...sel, status: e.target.value as BookingStatus })} options={STATUSES} /></Field>
              <Field label="Reference"><Input value={sel.ref} onChange={(e) => setSel({ ...sel, ref: e.target.value })} /></Field>
            </div>
            <Field label="Special requests"><Textarea value={sel.requests} onChange={(e) => setSel({ ...sel, requests: e.target.value })} /></Field>
            {sel.id && <p className="text-[12px] text-mute">Booked on {fmtDate(sel.createdAt)}</p>}
          </div>
        )}
      </Drawer>
    </>
  );
}
