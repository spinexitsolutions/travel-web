"use client";

import { useState } from "react";
import { cn, img } from "@/lib/utils";
import { Button, Input, Textarea, inputCls } from "./ui";

function move<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

const IconBtn = ({ onClick, children, label, danger }: { onClick: () => void; children: React.ReactNode; label: string; danger?: boolean }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/50 transition hover:bg-ink/5 hover:text-ink", danger && "hover:bg-red-50 hover:text-red-600")}
  >
    {children}
  </button>
);

const Up = () => <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 8l4-4 4 4" stroke="currentColor" fill="none" strokeWidth="1.6" /></svg>;
const Down = () => <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.6" /></svg>;
const X = () => <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" /></svg>;

export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="flex gap-3">
      <div className="h-[46px] w-[64px] shrink-0 overflow-hidden rounded-lg border border-line bg-ink/5">
        {value && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img(value, 200)} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} onLoad={() => setBroken(false)} />
        ) : (
          <div className="grid h-full place-items-center text-[10px] text-ink/30">{broken ? "invalid" : "no image"}</div>
        )}
      </div>
      <Input value={value} onChange={(e) => { setBroken(false); onChange(e.target.value); }} placeholder="https://images.unsplash.com/photo-…" />
    </div>
  );
}

export function StringList({ value, onChange, image, placeholder, type = "text" }: { value: string[]; onChange: (v: string[]) => void; image?: boolean; placeholder?: string; type?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onChange([...(value ?? []), draft.trim()]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      {image && value?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {value.map((v, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i + v} src={img(v, 200)} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
          ))}
        </div>
      )}
      {(value ?? []).map((v, i) => (
        <div key={i} className="flex items-center gap-1">
          <input type={type} value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} className={cn(inputCls, "py-2")} />
          <IconBtn label="Move up" onClick={() => onChange(move(value, i, -1))}><Up /></IconBtn>
          <IconBtn label="Move down" onClick={() => onChange(move(value, i, 1))}><Down /></IconBtn>
          <IconBtn label="Remove" danger onClick={() => onChange(value.filter((_, j) => j !== i))}><X /></IconBtn>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? "Add item and press Enter"}
          className={cn(inputCls, "border-dashed py-2")}
        />
        <Button type="button" variant="outline" onClick={add}>Add</Button>
      </div>
    </div>
  );
}

export type SubField = { key: string; label: string; type?: "text" | "textarea" | "image" | "number" };

export function ObjectList<T extends Record<string, unknown>>({
  value,
  onChange,
  fields,
  blank,
  itemLabel,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  fields: SubField[];
  blank: T;
  itemLabel: (item: T, i: number) => string;
}) {
  return (
    <div className="space-y-2.5">
      {(value ?? []).map((item, i) => (
        <div key={i} className="rounded-xl border border-line bg-white/60 p-3">
          <div className="mb-2 flex items-center gap-1">
            <span className="mr-auto truncate text-[12px] font-semibold text-ink/60">{itemLabel(item, i)}</span>
            <IconBtn label="Move up" onClick={() => onChange(move(value, i, -1))}><Up /></IconBtn>
            <IconBtn label="Move down" onClick={() => onChange(move(value, i, 1))}><Down /></IconBtn>
            <IconBtn label="Remove" danger onClick={() => onChange(value.filter((_, j) => j !== i))}><X /></IconBtn>
          </div>
          <div className="grid gap-2">
            {fields.map((f) => {
              const v = item[f.key];
              const set = (nv: unknown) => onChange(value.map((x, j) => (j === i ? { ...x, [f.key]: nv } : x)));
              return (
                <div key={f.key}>
                  <div className="mb-1 text-[11px] font-medium text-mute">{f.label}</div>
                  {f.type === "textarea" ? (
                    <Textarea rows={2} value={String(v ?? "")} onChange={(e) => set(e.target.value)} />
                  ) : f.type === "image" ? (
                    <ImageInput value={String(v ?? "")} onChange={set} />
                  ) : f.type === "number" ? (
                    <Input type="number" step="any" value={Number(v ?? 0)} onChange={(e) => set(Number(e.target.value))} />
                  ) : (
                    <Input value={String(v ?? "")} onChange={(e) => set(e.target.value)} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...(value ?? []), { ...blank }])}>+ Add</Button>
    </div>
  );
}
