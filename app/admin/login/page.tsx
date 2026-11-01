import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/db";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const s = await getSettings();
  return <LoginForm brand={s.brand.name} image={s.hero.slides[0]?.image ?? ""} />;
}
