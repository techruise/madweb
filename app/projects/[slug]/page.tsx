import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogDetail } from "@/components/catalog-pages";
import { getItem } from "@/lib/catalog";
import { isProperty } from "@/lib/catalog-types";
import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItem("projects", slug);
  if (!item)
    return pageMetadata(
      "Project unavailable | MAD",
      "This project is no longer published.",
      `/projects/${slug}`,
      true,
    );
  return pageMetadata(
    isProperty(item)
      ? `${item.title} | MAD`
      : `${item.title} · ${item.scope} | MAD`,
    item.description.slice(0, 155),
    `/projects/${slug}`,
    item.is_sample,
  );
}
export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItem("projects", slug);
  if (!item) notFound();
  return <CatalogDetail item={item} kind="projects" />;
}
