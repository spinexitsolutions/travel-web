import { getDB } from "@/lib/db";
import LeadsBoard from "@/components/admin/LeadsBoard";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const db = await getDB();
  return <LeadsBoard initial={db.leads} currency={db.settings.brand.currency} locale={db.settings.brand.locale} />;
}
