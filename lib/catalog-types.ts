export type CatalogKind = "properties" | "projects";
export type Media = {
  id: string;
  storage_path: string;
  alt: string;
  sort_order: number;
  stage?: "before" | "after";
};
export type Property = {
  id: string;
  title: string;
  slug: string;
  description: string;
  area: string;
  type: "sale" | "purchase" | "construction";
  price: number | null;
  size: number | null;
  size_unit: "marla" | "kanal";
  bedrooms: number | null;
  bathrooms: number | null;
  status: "for sale" | "sold";
  featured: boolean;
  published: boolean;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
  property_images: Media[];
};
export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  area: string;
  scope: "grey structure" | "finishing";
  year: number | null;
  status: "ongoing" | "completed";
  featured: boolean;
  published: boolean;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
  project_images: Media[];
};
export type CatalogItem = Property | Project;
export function isProperty(item: CatalogItem): item is Property {
  return "property_images" in item;
}
export function itemImages(item: CatalogItem) {
  return (isProperty(item) ? item.property_images : item.project_images).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
}
export const money = (value: number | null) =>
  value === null
    ? "Price on request"
    : `PKR ${new Intl.NumberFormat("en-PK").format(value)}`;
