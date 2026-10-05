import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogDetail } from "@/components/catalog-pages";
import { getItem } from "@/lib/catalog";
import { isProperty, money } from "@/lib/catalog-types";
import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItem("properties", slug);
  if (!item)
    return pageMetadata(
      "Property unavailable | MAD",
      "This listing is no longer published.",
      `/properties/${slug}`,
      true,
    );
  return pageMetadata(
    isProperty(item)
      ? `${item.title} · ${money(item.price)} | MAD`
      : `${item.title} | MAD`,
    item.description.slice(0, 155),
    `/properties/${slug}`,
    item.is_sample,
  );
}
export default async function PropertyDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItem("properties", slug);
  if (!item) notFound();
  return <CatalogDetail item={item} kind="properties" />;
}
