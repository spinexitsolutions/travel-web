"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Lead, LeadStatus } from "@/lib/types";
import { cn, fmtDate, money } from "@/lib/utils";
import { adminApi, downloadCSV } from "./api";
import { useToast } from "./Toast";
import { Badge, Button, Drawer, Field, Input, PageHeader, SearchBox, Segmented, Select, Textarea } from "./ui";

const STATUSES: { key: LeadStatus; label: string; dot: string }[] = [
  { key: "new", label: "New", dot: "bg-sky-400" },
  { key: "contacted", label: "Contacted", dot: "bg-violet-400" },
  { key: "qualified", label: "Qualified", dot: "bg-amber-400" },
  { key: "proposal", label: "Proposal", dot: "bg-orange-400" },
  { key: "won", label: "Won", dot: "bg-emerald-500" },
  { key: "lost", label: "Lost", dot: "bg-zinc-400" },
];

const blank = (): Omit<Lead, "id"> => ({
  name: "",
  email: "",
  phone: "",
  destination: "",
  travelers: 2,
  budget: "",
  travelDate: "",
  message: "",
  source: "Manual",
  status: "new",
  value: 0,
  notes: [],
  createdAt: new Date().toISOString(),
});

const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export default function LeadsBoard({ initial, currency, locale }: { initial: Lead[]; currency: string; locale: string }) {
  const toast = useToast();
  const [leads, setLeads] = useState<Lead[]>(initial);
  const [view, setView] = useState<"board" | "list">("board");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<(Omit<Lead, "id"> & { id?: string }) | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<LeadStatus | null>(null);
  const m = (n: number) => money(n, currency, locale);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return leads;
    return leads.filter((l) => [l.name, l.email, l.phone, l.destination, l.source].join(" ").toLowerCase().includes(s));
  }, [leads, q]);

  const setStatus = async (id: string, status: LeadStatus) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await adminApi.update("leads", id, { status });
      toast(`Moved to ${status}`);
    } catch (e) {
      setLeads(prev);
      toast((e as Error).message, "error");
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast("Name is required", "error");
    try {
      if (editing.id) {
        const saved = await adminApi.update<Lead>("leads", editing.id, editing);
        setLeads((ls) => ls.map((l) => (l.id === saved.id ? saved : l)));
        toast("Lead saved");
      } else {
        const saved = await adminApi.create<Lead>("leads", editing);
        setLeads((ls) => [saved, ...ls]);
        toast("Lead added");
      }
      setEditing(null);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this lead permanently?")) return;
    try {
      await adminApi.remove("leads", id);
      setLeads((ls) => ls.filter((l) => l.id !== id));
      setEditing(null);
      toast("Lead deleted");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const totalOpen = leads.filter((l) => !["won", "lost"].includes(l.status)).reduce((s, l) => s + (l.value || 0), 0);

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} enquiries · ${m(totalOpen)} in open pipeline`}
        actions={
          <>
            <Button variant="outline" onClick={() => downloadCSV("leads.csv", leads.map(({ notes, ...l }) => ({ ...l, notes: notes.map((n) => n.text).join(" | ") })))}>
              Export CSV
            </Button>
            <Button onClick={() => setEditing(blank())}>+ Add lead</Button>
          </>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox value={q} onChange={setQ} placeholder="Search name, email, destination…" />
        <Segmented value={view} onChange={setView} options={[{ value: "board", label: "Board" }, { value: "list", label: "List" }]} />
      </div>

      {view === "board" ? (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 no-scrollbar sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          {STATUSES.map((col) => {
            const items = filtered.filter((l) => l.status === col.key);
            const sum = items.reduce((s, l) => s + (l.value || 0), 0);
            return (
              <div
                key={col.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(col.key);
                }}
                onDragLeave={() => setOver((o) => (o === col.key ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain") || dragId;
                  setOver(null);
                  setDragId(null);
                  const lead = leads.find((l) => l.id === id);
                  if (lead && lead.status !== col.key) setStatus(lead.id, col.key);
                }}
                className={cn(
                  "flex w-[82vw] shrink-0 snap-start flex-col rounded-2xl border p-2.5 transition sm:w-72",
                  over === col.key ? "border-ink/30 bg-white" : "border-line bg-ink/[0.025]",
                )}
              >
                <div className="flex items-center justify-between px-1.5 pb-2.5 pt-1">
                  <div className="flex items-center gap-2 text-[13px] font-semibold">
                    <span className={cn("h-2 w-2 rounded-full", col.dot)} />
                    {col.label}
                    <span className="rounded-full bg-ink/5 px-1.5 text-[11px] font-medium text-mute">{items.length}</span>
                  </div>
                  <span className="text-[11px] tabular-nums text-mute">{sum ? m(sum) : ""}</span>
                </div>
                <div className="flex min-h-24 flex-1 flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {items.map((l) => (
                      <motion.div
                        key={l.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: dragId === l.id ? 0.4 : 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      >
                        <div
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", l.id);
                            e.dataTransfer.effectAllowed = "move";
                            setDragId(l.id);
                          }}
                          onDragEnd={() => setDragId(null)}
                          onClick={() => setEditing(l)}
                          className="cursor-grab rounded-xl border border-line bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:shadow-md active:cursor-grabbing"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/5 text-[11px] font-semibold">{initials(l.name)}</span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{l.name}</div>
                              <div className="truncate text-[12px] text-mute">{l.destination || "Undecided"} · {l.travelers} pax</div>
                            </div>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-mute">
                            <span className="rounded-full bg-ink/5 px-2 py-0.5">{l.source}</span>
                            <span className="font-medium tabular-nums text-ink">{l.value ? m(l.value) : l.budget || "—"}</span>
                          </div>
                          <select
                            value={l.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setStatus(l.id, e.target.value as LeadStatus)}
                            className="mt-2 w-full rounded-lg border border-line bg-paper/60 px-2 py-1 text-[12px] lg:hidden"
                            aria-label="Move to stage"
                          >
                            {STATUSES.map((s) => (
                              <option key={s.key} value={s.key}>Move to: {s.label}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {!items.length && <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-line py-6 text-[12px] text-ink/30">Drop here</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-line text-left text-[12px] text-mute">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Destination</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((l) => (
                  <tr key={l.id} onClick={() => setEditing(l)} className="cursor-pointer transition hover:bg-ink/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-medium">{l.name}</div>
                      <div className="text-[12px] text-mute">{l.email}</div>
                    </td>
                    <td className="px-4 py-3">{l.destination || "—"}</td>
                    <td className="px-4 py-3 text-mute">{l.source}</td>
                    <td className="px-4 py-3 tabular-nums">{l.value ? m(l.value) : "—"}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value as LeadStatus)} className="rounded-full border border-line bg-white px-2.5 py-1 text-[12px] capitalize">
                        {STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-mute">{fmtDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <LeadDrawer editing={editing} setEditing={setEditing} onSave={save} onDelete={del} />
    </>
  );
}

function LeadDrawer({
  editing,
  setEditing,
  onSave,
  onDelete,
}: {
  editing: (Omit<Lead, "id"> & { id?: string }) | null;
  setEditing: (l: (Omit<Lead, "id"> & { id?: string }) | null) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
}) {
  const [note, setNote] = useState("");
  const e = editing;
  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => e && setEditing({ ...e, [k]: v });
  const wa = e?.phone.replace(/[^\d]/g, "");

  return (
    <Drawer
      open={!!e}
      onClose={() => setEditing(null)}
      title={e?.id ? e.name || "Lead" : "New lead"}
      footer={
        <>
          {e?.id ? (
            <Button variant="ghost" className="text-red-600" onClick={() => onDelete(e.id!)}>Delete</Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={onSave}>Save lead</Button>
          </div>
        </>
      }
    >
      {e && (
        <div className="space-y-5">
          {e.id && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={e.status}>{e.status}</Badge>
              <span className="text-[12px] text-mute">Received {fmtDate(e.createdAt)} via {e.source}</span>
              <div className="ml-auto flex gap-1.5">
                {e.email && <a className="rounded-full border border-line px-3 py-1.5 text-[12px] hover:bg-white" href={`mailto:${e.email}`}>Email</a>}
                {e.phone && <a className="rounded-full border border-line px-3 py-1.5 text-[12px] hover:bg-white" href={`tel:${e.phone}`}>Call</a>}
                {wa && <a className="rounded-full bg-emerald-500 px-3 py-1.5 text-[12px] text-white" target="_blank" href={`https://wa.me/${wa}`}>WhatsApp</a>}
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><Input value={e.name} onChange={(x) => set("name", x.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={e.email} onChange={(x) => set("email", x.target.value)} /></Field>
            <Field label="Phone"><Input value={e.phone} onChange={(x) => set("phone", x.target.value)} /></Field>
            <Field label="Destination"><Input value={e.destination} onChange={(x) => set("destination", x.target.value)} /></Field>
            <Field label="Travellers"><Input type="number" min={1} value={e.travelers} onChange={(x) => set("travelers", Number(x.target.value))} /></Field>
            <Field label="Travel date"><Input type="date" value={e.travelDate} onChange={(x) => set("travelDate", x.target.value)} /></Field>
            <Field label="Budget"><Input value={e.budget} onChange={(x) => set("budget", x.target.value)} /></Field>
            <Field label="Deal value" hint="estimated"><Input type="number" min={0} value={e.value} onChange={(x) => set("value", Number(x.target.value))} /></Field>
            <Field label="Stage">
              <Select value={e.status} onChange={(x) => set("status", x.target.value as LeadStatus)} options={STATUSES.map((s) => ({ value: s.key, label: s.label }))} />
            </Field>
            <Field label="Source">
              <Select value={e.source} onChange={(x) => set("source", x.target.value)} options={Array.from(new Set(["Website", "Instagram", "Referral", "Google Ads", "WhatsApp", "Manual", e.source]))} />
            </Field>
          </div>
          <Field label="Message"><Textarea value={e.message} onChange={(x) => set("message", x.target.value)} /></Field>

          <div>
            <div className="mb-2 text-[13px] font-medium">Activity notes</div>
            <div className="flex gap-2">
              <Input value={note} onChange={(x) => setNote(x.target.value)} placeholder="Log a call, email or next step…" onKeyDown={(k) => {
                if (k.key === "Enter" && note.trim()) {
                  k.preventDefault();
                  set("notes", [{ at: new Date().toISOString(), text: note.trim() }, ...e.notes]);
                  setNote("");
                }
              }} />
              <Button variant="outline" onClick={() => {
                if (!note.trim()) return;
                set("notes", [{ at: new Date().toISOString(), text: note.trim() }, ...e.notes]);
                setNote("");
              }}>Add</Button>
            </div>
            <ol className="mt-4 space-y-3 border-l border-line pl-4">
              {e.notes.map((n, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-accent" />
                  <div className="text-sm">{n.text}</div>
                  <div className="text-[11px] text-mute">{new Date(n.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</div>
                </li>
              ))}
              {!e.notes.length && <li className="text-[12px] text-mute">No notes yet. Notes are saved with the lead.</li>}
            </ol>
          </div>
        </div>
      )}
    </Drawer>
  );
}
