import "server-only";
import { z } from "zod";
import { site } from "@/config/site";
import { publicDatabase } from "./supabase/public";
import { type CatalogKind, type CatalogItem } from "./catalog-types";
export const PAGE_SIZE = 9;
const numeric = z.coerce.number().finite().min(0).max(1e12);
const filtersSchema = z.object({
  area: z
    .string()
    .refine((value) => site.areas.includes(value))
    .catch(""),
  type: z
    .enum(["sale", "purchase", "construction"])
    .optional()
    .catch(undefined),
  status: z
    .enum(["for sale", "sold", "ongoing", "completed"])
    .optional()
    .catch(undefined),
  min: numeric.optional().catch(undefined),
  max: numeric.optional().catch(undefined),
  sort: z.enum(["newest", "price-asc", "price-desc"]).catch("newest"),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});
export type Search = Record<string, string | string[] | undefined>;
export function parseFilters(search: Search) {
  const single = Object.fromEntries(
    Object.entries(search).map(([k, v]) => [
      k,
      Array.isArray(v) ? v[0] : v || undefined,
    ]),
  );
  return filtersSchema.parse(single);
}
export async function getCatalog(kind: CatalogKind, search: Search = {}) {
  const filters = parseFilters(search);
  const db = publicDatabase();
  if (!db)
    return {
      items: [] as CatalogItem[],
      count: 0,
      filters,
      unavailable: false,
    };
  let query = db
    .from(kind)
    .select(
      `*, ${kind === "properties" ? "property_images" : "project_images"}(*)`,
      { count: "exact" },
    )
    .eq("published", true);
  if (filters.area) query = query.eq("area", filters.area);
  if (filters.status) query = query.eq("status", filters.status);
  if (kind === "properties") {
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.min !== undefined) query = query.gte("price", filters.min);
    if (filters.max !== undefined) query = query.lte("price", filters.max);
  }
  const sortByPrice = kind === "properties" && filters.sort !== "newest";
  query = query
    .order(sortByPrice ? "price" : "created_at", {
      ascending: filters.sort === "price-asc" && sortByPrice,
      nullsFirst: false,
    })
    .order("id");
  const { data, count, error } = await query.range(
    (filters.page - 1) * PAGE_SIZE,
    filters.page * PAGE_SIZE - 1,
  );
  return {
    items: (data ?? []) as CatalogItem[],
    count: count ?? 0,
    filters,
    unavailable: !!error,
  };
}
export async function getItem(
  kind: CatalogKind,
  slug: string,
): Promise<CatalogItem | null> {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  const db = publicDatabase();
  if (!db) return null;
  const { data, error } = await db
    .from(kind)
    .select(
      `*, ${kind === "properties" ? "property_images" : "project_images"}(*)`,
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error("The catalog is temporarily unavailable.");
  return data as CatalogItem | null;
}
