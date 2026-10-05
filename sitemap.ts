import type { MetadataRoute } from "next";
import { publicDatabase } from "@/lib/supabase/public";
import { siteUrl } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    "",
    "/properties",
    "/projects",
    "/privacy",
  ].map((path) => ({
    url: siteUrl + path,
    changeFrequency: path ? "weekly" : "monthly",
    priority: path.length ? 0.8 : 1,
  }));
  const db = publicDatabase();
  if (db)
    for (const kind of ["properties", "projects"]) {
      let page = 0;
      while (true) {
        const { data, error } = await db
          .from(kind)
          .select("slug,updated_at")
          .eq("published", true)
          .eq("is_sample", false)
          .order("id")
          .range(page * 500, page * 500 + 499);
        if (error) break;
        for (const item of data ?? [])
          routes.push({
            url: `${siteUrl}/${kind}/${item.slug}`,
            lastModified: item.updated_at,
          });
        if (!data || data.length < 500 || routes.length >= 49000) break;
        page++;
      }
    }
  return routes;
}
