import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-pages";
import { ui } from "@/config/content/ui";
import type { Search } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata(
  "Construction projects in Lahore | MAD",
  `${ui.catalog.projectIntro} ${ui.catalog.verify}`,
  "/projects",
);
export default async function Projects({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return <CatalogPage kind="projects" search={await searchParams} />;
}
