"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn, slugify } from "@/lib/utils";
import { adminApi } from "./api";
import { ObjectList, StringList, ImageInput } from "./fields";
import { SCHEMAS, type FieldDef, type SchemaKey } from "./schemas";
import { useToast } from "./Toast";
import { Badge, Button, Drawer, Empty, Field, Input, PageHeader, SearchBox, Segmented, Select, Textarea, Thumb, Toggle } from "./ui";

type Item = Record<string, unknown> & { id: string };
type Draft = Record<string, unknown> & { id?: string };

export default function CollectionManager({
  collection,
  initial,
  destinations = [],
}: {
  collection: SchemaKey;
  initial: Item[];
  destinations?: { slug: string; name: string }[];
}) {
  const schema = SCHEMAS[collection];
  const toast = useToast();
  const [items, setItems] = useState<Item[]>(initial);
  const [q, setQ] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">(schema.layout);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => JSON.stringify(i).toLowerCase().includes(s));
  }, [items, q]);

  const open = (item?: Item) => {
    setSlugTouched(!!item);
    setDraft(item ? structuredClone(item) : structuredClone(schema.blank));
  };

  const setField = (key: string, value: unknown) => {
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, [key]: value };
      for (const sec of schema.sections)
        for (const f of sec.fields) if (f.type === "slug" && f.from === key && !slugTouched) next[f.key] = slugify(String(value));
      return next;
    });
  };

  const save = async () => {
    if (!draft) return;
    for (const sec of schema.sections)
      for (const f of sec.fields)
        if ("required" in f && f.required && !String(draft[f.key] ?? "").trim()) return toast(`${f.label} is required`, "error");
    const slugField = schema.sections.flatMap((s) => s.fields).find((f) => f.type === "slug");
    if (slugField) {
      const slug = String(draft[slugField.key] ?? "") || slugify(String(draft[(slugField as { from: string }).from] ?? ""));
      if (items.some((i) => i[slugField.key] === slug && i.id !== draft.id)) return toast("That URL slug is already used", "error");
      draft[slugField.key] = slug;
    }
    setSaving(true);
    try {
      if (draft.id) {
        const saved = await adminApi.update<Item>(collection, draft.id, draft);
        setItems((is) => is.map((i) => (i.id === saved.id ? saved : i)));
        toast(`${cap(schema.singular)} updated`);
      } else {
        const saved = await adminApi.create<Item>(collection, draft);
        setItems((is) => [saved, ...is]);
        toast(`${cap(schema.singular)} created`);
      }
      setDraft(null);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm(`Delete this ${schema.singular}? This cannot be undone.`)) return;
    try {
      await adminApi.remove(collection, id);
      setItems((is) => is.filter((i) => i.id !== id));
      setDraft(null);
      toast(`${cap(schema.singular)} deleted`);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const quickToggle = async (item: Item, key: string) => {
    const next = !item[key];
    setItems((is) => is.map((i) => (i.id === item.id ? { ...i, [key]: next } : i)));
    try {
      await adminApi.update(collection, item.id, { [key]: next });
      toast(`${key === "published" ? (next ? "Published" : "Moved to drafts") : next ? "Featured" : "Unfeatured"}`);
    } catch (e) {
      setItems((is) => is.map((i) => (i.id === item.id ? { ...i, [key]: !next } : i)));
      toast((e as Error).message, "error");
    }
  };

  const title = (i: Draft) => String(i[schema.titleKey] ?? "") || "Untitled";

  return (
    <>
      <PageHeader
        title={schema.title}
        subtitle={`${schema.subtitle} · ${items.length} total`}
        actions={<Button onClick={() => open()}>+ New {schema.singular}</Button>}
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox value={q} onChange={setQ} placeholder={`Search ${schema.title.toLowerCase()}…`} />
        {schema.imageKey && <Segmented value={layout} onChange={setLayout} options={[{ value: "grid", label: "Grid" }, { value: "list", label: "List" }]} />}
      </div>

      {filtered.length === 0 ? (
        <Empty>Nothing here yet. Create your first {schema.singular}.</Empty>
      ) : layout === "grid" && schema.imageKey ? (
        <motion.div layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {filtered.map((it) => (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="group overflow-hidden rounded-2xl border border-line bg-white/70"
              >
                <button onClick={() => open(it)} className="relative block w-full text-left">
                  <Thumb src={String(it[schema.imageKey!] ?? "")} className="aspect-[16/10] rounded-none transition duration-700 group-hover:scale-[1.03]" />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    {schema.publishedKey && <Badge tone={it[schema.publishedKey] ? "published" : "draft"}>{it[schema.publishedKey] ? "Live" : "Draft"}</Badge>}
                    {schema.featuredKey && Boolean(it[schema.featuredKey]) && <Badge tone="proposal">★ Featured</Badge>}
                  </div>
                </button>
                <div className="flex items-start gap-2 p-4">
                  <button onClick={() => open(it)} className="min-w-0 flex-1 text-left">
                    <div className="truncate font-medium tracking-tight">{title(it)}</div>
                    {schema.subtitleKey && <div className="mt-0.5 truncate text-[12px] text-mute">{schema.subtitleKey(it)}</div>}
                  </button>
                  <RowActions item={it} schema={schema} onToggle={quickToggle} onDelete={del} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/70">
          {filtered.map((it) => (
            <li key={it.id} className="flex items-center gap-3 px-4 py-3 transition hover:bg-ink/[0.015]">
              {schema.imageKey && <Thumb src={String(it[schema.imageKey] ?? "")} className={cn("h-12 w-12 shrink-0", collection === "testimonials" && "rounded-full")} />}
              <button onClick={() => open(it)} className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{title(it)}</span>
                  {schema.publishedKey && !it[schema.publishedKey] && <Badge tone="draft">Draft</Badge>}
                </div>
                {schema.subtitleKey && <div className="truncate text-[12px] text-mute">{schema.subtitleKey(it)}</div>}
              </button>
              <RowActions item={it} schema={schema} onToggle={quickToggle} onDelete={del} />
            </li>
          ))}
        </ul>
      )}

      <Drawer
        open={!!draft}
        onClose={() => setDraft(null)}
        wide
        title={draft?.id ? `Edit ${schema.singular}` : `New ${schema.singular}`}
        footer={
          <>
            {draft?.id ? <Button variant="ghost" className="text-red-600" onClick={() => del(draft.id!)}>Delete</Button> : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          </>
        }
      >
        {draft && (
          <div className="space-y-8">
            {schema.sections.map((sec) => (
              <section key={sec.title}>
                <h3 className="eyebrow mb-3 text-ink/45">{sec.title}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {sec.fields.map((f) => (
                    <FieldControl
                      key={f.key}
                      f={f}
                      value={draft[f.key]}
                      onChange={(v) => {
                        if (f.type === "slug") setSlugTouched(true);
                        setField(f.key, v);
                      }}
                      destinations={destinations}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Drawer>
    </>
  );
}

function RowActions({
  item,
  schema,
  onToggle,
  onDelete,
}: {
  item: Item;
  schema: (typeof SCHEMAS)[SchemaKey];
  onToggle: (i: Item, k: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {schema.featuredKey && (
        <button
          title={item[schema.featuredKey] ? "Unfeature" : "Feature"}
          onClick={() => onToggle(item, schema.featuredKey!)}
          className={cn("grid h-8 w-8 place-items-center rounded-lg text-[15px] transition hover:bg-ink/5", item[schema.featuredKey] ? "text-amber-500" : "text-ink/25")}
        >
          ★
        </button>
      )}
      {schema.publishedKey && (
        <button
          title={item[schema.publishedKey] ? "Unpublish" : "Publish"}
          onClick={() => onToggle(item, schema.publishedKey!)}
          className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-ink/5"
        >
          <span className={cn("h-2.5 w-2.5 rounded-full", item[schema.publishedKey] ? "bg-emerald-500" : "bg-ink/20")} />
        </button>
      )}
      <button title="Delete" onClick={() => onDelete(item.id)} className="grid h-8 w-8 place-items-center rounded-lg text-ink/35 transition hover:bg-red-50 hover:text-red-600">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
      </button>
    </div>
  );
}

function FieldControl({
  f,
  value,
  onChange,
  destinations,
}: {
  f: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  destinations: { slug: string; name: string }[];
}) {
  const span = f.span === 2 || ["list", "objects", "richtext", "image"].includes(f.type) ? "sm:col-span-2" : "";
  const label = f.label;
  const hint = f.hint;

  switch (f.type) {
    case "boolean":
      return (
        <div className={cn("flex items-center justify-between rounded-xl border border-line bg-white px-3.5 py-3", span)}>
          <span className="text-sm">{label}</span>
          <Toggle checked={Boolean(value)} onChange={onChange} />
        </div>
      );
    case "textarea":
      return <Field label={label} hint={hint} className={span}><Textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} /></Field>;
    case "richtext":
      return <Field label={label} hint={hint} className={span}><Textarea rows={10} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} /></Field>;
    case "number":
      return (
        <Field label={label} hint={hint} className={span}>
          <Input type="number" step={f.step ?? "any"} value={value === undefined || value === null ? "" : Number(value)} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
        </Field>
      );
    case "date":
      return <Field label={label} hint={hint} className={span}><Input type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} /></Field>;
    case "image":
      return <Field label={label} hint={hint ?? "Paste an image URL"} className={span}><ImageInput value={String(value ?? "")} onChange={onChange} /></Field>;
    case "select": {
      const opts = f.options === "destinations" ? [{ value: "", label: "— Select —" }, ...destinations.map((d) => ({ value: d.slug, label: d.name }))] : f.options;
      return <Field label={label} hint={hint} className={span}><Select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} options={opts} /></Field>;
    }
    case "slug":
      return (
        <Field label={label} hint={hint ?? "auto from title"} className={span}>
          <div className="flex items-center rounded-xl border border-line bg-white pl-3.5 text-sm focus-within:border-ink/40">
            <span className="text-ink/35">/</span>
            <input value={String(value ?? "")} onChange={(e) => onChange(slugify(e.target.value))} className="w-full bg-transparent px-1 py-2.5 outline-none" />
          </div>
        </Field>
      );
    case "list":
      return (
        <Field label={label} hint={hint} className={span}>
          <StringList value={(value as string[]) ?? []} onChange={onChange} image={f.image} type={f.inputType} placeholder={f.image ? "Paste image URL and press Enter" : undefined} />
        </Field>
      );
    case "objects":
      return (
        <div className={span}>
          <div className="mb-1.5 text-[13px] font-medium text-ink/80">{label}</div>
          <ObjectList
            value={(value as Record<string, unknown>[]) ?? []}
            onChange={onChange}
            fields={f.fields}
            blank={f.blank}
            itemLabel={(it, i) => `Day ${i + 1}${it.title ? ` — ${it.title}` : ""}`}
          />
        </div>
      );
    default:
      return <Field label={label} hint={hint} className={span}><Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} /></Field>;
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
