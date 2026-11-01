import { NextResponse } from "next/server";
import { insert, list, uid } from "@/lib/db";
import { bad, guard, isCollection, refresh } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ collection: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { collection } = await params;
  if (!isCollection(collection)) return bad("Unknown collection", 404);
  return NextResponse.json(await list(collection));
}

export async function POST(req: Request, { params }: { params: Promise<{ collection: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { collection } = await params;
  if (!isCollection(collection)) return bad("Unknown collection", 404);
  const body = await req.json();
  const item = { ...body, id: uid(collection.slice(0, 3)) };
  if (["leads", "bookings", "subscribers"].includes(collection) && !item.createdAt) item.createdAt = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await insert(collection, item as any);
  refresh();
  return NextResponse.json(item, { status: 201 });
}
