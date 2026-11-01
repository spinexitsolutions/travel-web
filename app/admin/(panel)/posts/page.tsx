import { getDB } from "@/lib/db";
import CollectionManager from "@/components/admin/CollectionManager";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const db = await getDB();
  return (
    <CollectionManager
      collection="posts"
      initial={db.posts as unknown as (Record<string, unknown> & { id: string })[]}
      destinations={db.destinations.map((d) => ({ slug: d.slug, name: d.name }))}
    />
  );
}
