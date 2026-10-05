import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-pages";
import { ui } from "@/config/content/ui";
import type { Search } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata(
  "Properties in Lahore | MAD",
  `${ui.catalog.propertyIntro} ${ui.catalog.verify}`,
  "/properties",
);
export default async function Properties({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return <CatalogPage kind="properties" search={await searchParams} />;
}
