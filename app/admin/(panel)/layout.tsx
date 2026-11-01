import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/db";
import Shell from "@/components/admin/Shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const s = await getSettings();
  return <Shell brand={s.brand.name}>{children}</Shell>;
}
