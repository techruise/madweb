export const imagePlaceholder =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMkIyRjM4Ii8+PC9zdmc+";
export function imageUrl(kind: "properties" | "projects", path?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!path || !url || !/^[a-zA-Z0-9/_\-.]+$/.test(path) || path.includes(".."))
    return "/images/placeholder.svg";
  return `${url}/storage/v1/object/public/${kind}/${path}`;
}
