"use client";

import { useState } from "react";
import type { Subscriber } from "@/lib/types";
import { fmtDate } from "@/lib/utils";
import { adminApi, downloadCSV } from "./api";
import { useToast } from "./Toast";
import { Button, Empty, Input, PageHeader, SearchBox } from "./ui";

export default function SubscribersTable({ initial }: { initial: Subscriber[] }) {
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [email, setEmail] = useState("");
  const list = rows.filter((r) => r.email.includes(q.toLowerCase()));

  const add = async () => {
    const e = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(e)) return toast("Enter a valid email", "error");
    if (rows.some((r) => r.email === e)) return toast("Already subscribed", "info");
    const saved = await adminApi.create<Subscriber>("subscribers", { email: e });
    setRows((r) => [saved, ...r]);
    setEmail("");
    toast("Subscriber added");
  };

  const del = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    await adminApi.remove("subscribers", id);
    setRows((r) => r.filter((x) => x.id !== id));
    toast("Subscriber removed");
  };

  return (
    <>
      <PageHeader
        title="Subscribers"
        subtitle={`${rows.length} people on the newsletter list`}
        actions={<Button variant="outline" onClick={() => downloadCSV("subscribers.csv", rows as unknown as Record<string, unknown>[])}>Export CSV</Button>}
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <SearchBox value={q} onChange={setQ} placeholder="Search email…" />
        <div className="flex gap-2">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="add@email.com" className="sm:w-60" onKeyDown={(e) => e.key === "Enter" && add()} />
          <Button onClick={add}>Add</Button>
        </div>
      </div>
      {list.length === 0 ? (
        <Empty>No subscribers yet.</Empty>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/70">
          {list.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/10 text-[13px] font-semibold uppercase text-accent">{s.email[0]}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{s.email}</div>
                <div className="text-[12px] text-mute">Joined {fmtDate(s.createdAt)}</div>
              </div>
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => del(s.id)}>Remove</Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
