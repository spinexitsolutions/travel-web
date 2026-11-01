import { getDB } from "@/lib/db";
import BookingsTable from "@/components/admin/BookingsTable";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const db = await getDB();
  return (
    <BookingsTable
      initial={db.bookings}
      tours={db.tours.map((t) => ({ slug: t.slug, title: t.title, price: t.price }))}
      currency={db.settings.brand.currency}
      locale={db.settings.brand.locale}
    />
  );
}
