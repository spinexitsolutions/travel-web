import { getDB } from "@/lib/db";
import CustomersTable, { type Customer } from "@/components/admin/CustomersTable";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const db = await getDB();
  const map = new Map<string, Customer>();
  const touch = (email: string, name: string, phone: string, at: string) => {
    const key = email.toLowerCase();
    const c = map.get(key) ?? { email: key, name, phone, trips: 0, enquiries: 0, value: 0, lastActivity: at, tours: [] as string[], subscribed: false };
    if (!c.phone && phone) c.phone = phone;
    if (+new Date(at) > +new Date(c.lastActivity)) c.lastActivity = at;
    map.set(key, c);
    return c;
  };
  for (const b of db.bookings) {
    const c = touch(b.email, b.name, b.phone, b.createdAt);
    if (b.status !== "cancelled") {
      c.trips++;
      if (["paid", "confirmed", "completed"].includes(b.status)) c.value += b.total;
      if (!c.tours.includes(b.tourTitle)) c.tours.push(b.tourTitle);
    }
  }
  for (const l of db.leads) touch(l.email, l.name, l.phone, l.createdAt).enquiries++;
  const subs = new Set(db.subscribers.map((s) => s.email.toLowerCase()));
  const customers = [...map.values()].map((c) => ({ ...c, subscribed: subs.has(c.email) })).sort((a, b) => b.value - a.value);
  return <CustomersTable customers={customers} currency={db.settings.brand.currency} locale={db.settings.brand.locale} />;
}
