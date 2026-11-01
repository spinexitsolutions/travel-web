import { NextResponse } from "next/server";
import { insert, list, uid } from "@/lib/db";
import { bad } from "@/lib/api";
import type { Booking } from "@/lib/types";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.name || !b?.email || !b?.tourSlug || !b?.date) return bad("Please complete all required fields");
  if (!/^\S+@\S+\.\S+$/.test(b.email)) return bad("Please enter a valid email");
  const tours = await list("tours");
  const tour = tours.find((t) => t.slug === b.tourSlug);
  if (!tour) return bad("Journey not found", 404);
  const travelers = Math.min(20, Math.max(1, Number(b.travelers) || 1));
  const booking: Booking = {
    id: uid("bk"),
    ref: `VJ-${Date.now().toString(36).slice(-5).toUpperCase()}`,
    tourSlug: tour.slug,
    tourTitle: tour.title,
    name: String(b.name).slice(0, 120),
    email: String(b.email).slice(0, 160),
    phone: String(b.phone ?? "").slice(0, 40),
    date: String(b.date),
    travelers,
    total: tour.price * travelers,
    status: "pending",
    requests: String(b.requests ?? "").slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  await insert("bookings", booking);
  return NextResponse.json({ ok: true, ref: booking.ref, total: booking.total });
}
