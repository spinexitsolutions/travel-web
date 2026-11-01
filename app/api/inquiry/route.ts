import { NextResponse } from "next/server";
import { insert, uid } from "@/lib/db";
import { bad } from "@/lib/api";
import type { Lead } from "@/lib/types";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.name || !b?.email) return bad("Name and email are required");
  if (!/^\S+@\S+\.\S+$/.test(b.email)) return bad("Please enter a valid email");
  const lead: Lead = {
    id: uid("lead"),
    name: String(b.name).slice(0, 120),
    email: String(b.email).slice(0, 160),
    phone: String(b.phone ?? "").slice(0, 40),
    destination: String(b.destination ?? "").slice(0, 120),
    travelers: Number(b.travelers) || 1,
    budget: String(b.budget ?? ""),
    travelDate: String(b.travelDate ?? ""),
    message: String(b.message ?? "").slice(0, 3000),
    source: String(b.source ?? "Website"),
    status: "new",
    value: 0,
    notes: [],
    createdAt: new Date().toISOString(),
  };
  await insert("leads", lead);
  return NextResponse.json({ ok: true });
}
