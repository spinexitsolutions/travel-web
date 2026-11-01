import "server-only";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "./auth";
import type { CollectionKey } from "./types";

export const COLLECTIONS: CollectionKey[] = [
  "destinations", "tours", "posts", "testimonials", "faqs", "experiences", "leads", "bookings", "subscribers",
];

export function isCollection(k: string): k is CollectionKey {
  return (COLLECTIONS as string[]).includes(k);
}

export async function guard() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export function refresh() {
  try {
    revalidatePath("/", "layout");
  } catch {}
}

export const bad = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });
