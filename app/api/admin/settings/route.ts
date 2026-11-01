import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";
import { guard, refresh } from "@/lib/api";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return NextResponse.json(await getSettings());
}

export async function PUT(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await req.json();
  const saved = await saveSettings(body);
  refresh();
  return NextResponse.json(saved);
}
