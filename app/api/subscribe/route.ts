import { NextResponse } from "next/server";
import { insert, list, uid } from "@/lib/db";
import { bad } from "@/lib/api";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const email = String(b?.email ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return bad("Please enter a valid email");
  const subs = await list("subscribers");
  if (!subs.some((s) => s.email === email)) {
    await insert("subscribers", { id: uid("sub"), email, createdAt: new Date().toISOString() });
  }
  return NextResponse.json({ ok: true });
}
