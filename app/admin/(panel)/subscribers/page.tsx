import { list } from "@/lib/db";
import SubscribersTable from "@/components/admin/SubscribersTable";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  return <SubscribersTable initial={await list("subscribers")} />;
}
