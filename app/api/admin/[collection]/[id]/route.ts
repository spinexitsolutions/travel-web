import { NextResponse } from "next/server";
import { remove, update } from "@/lib/db";
import { bad, guard, isCollection, refresh } from "@/lib/api";

type Ctx = { params: Promise<{ collection: string; id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { collection, id } = await params;
  if (!isCollection(collection)) return bad("Unknown collection", 404);
  const patch = await req.json();
  const saved = await update(collection, id, patch);
  if (!saved) return bad("Not found", 404);
  refresh();
  return NextResponse.json(saved);
}

export async function DELETE(_: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { collection, id } = await params;
  if (!isCollection(collection)) return bad("Unknown collection", 404);
  const ok = await remove(collection, id);
  if (!ok) return bad("Not found", 404);
  refresh();
  return NextResponse.json({ ok: true });
}
