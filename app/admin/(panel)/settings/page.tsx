import { getSettings } from "@/lib/db";
import SettingsEditor from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  return <SettingsEditor initial={await getSettings()} />;
}
