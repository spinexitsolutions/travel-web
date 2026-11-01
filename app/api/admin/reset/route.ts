import { NextResponse } from "next/server";
import { resetDB } from "@/lib/db";
import { guard, refresh } from "@/lib/api";

export async function POST() {
  const denied = await guard();
  if (denied) return denied;
  await resetDB();
  refresh();
  return NextResponse.json({ ok: true });
}
