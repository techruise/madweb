import { site } from "./site";
export type Field = {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "checkbox"
    | "email"
    | "password";
  options?: string[];
  nullable?: boolean;
  min?: number;
  max?: number;
};
const common: Field[] = [
  { key: "title", label: "Title", type: "text" },
  {
    key: "slug",
    label: "URL slug (lowercase letters, numbers and hyphens)",
    type: "text",
  },
  { key: "description", label: "Description", type: "textarea" },
  { key: "area", label: "Area", type: "select", options: site.areas },
];
const flags: Field[] = [
  { key: "featured", label: "Featured", type: "checkbox" },
  {
    key: "published",
    label: "Published (visible to visitors)",
    type: "checkbox",
  },
  { key: "is_sample", label: "SAMPLE demonstration content", type: "checkbox" },
];
export const adminFields: Record<string, Field[]> = {
  properties: [
    ...common,
    {
      key: "type",
      label: "Service type",
      type: "select",
      options: site.services.map((service) => service.id),
    },
    {
      key: "price",
      label: "Price (PKR)",
      type: "number",
      nullable: true,
      min: 0,
      max: 1e12,
    },
    {
      key: "size",
      label: "Size",
      type: "number",
      nullable: true,
      min: 0.01,
      max: 1e6,
    },
    {
      key: "size_unit",
      label: "Size unit",
      type: "select",
      options: ["marla", "kanal"],
    },
    {
      key: "bedrooms",
      label: "Bedrooms",
      type: "number",
      nullable: true,
      min: 0,
      max: 100,
    },
    {
      key: "bathrooms",
      label: "Bathrooms",
      type: "number",
      nullable: true,
      min: 0,
      max: 100,
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["for sale", "sold"],
    },
    ...flags,
  ],
  projects: [
    ...common,
    {
      key: "scope",
      label: "Scope",
      type: "select",
      options: ["grey structure", "finishing"],
    },
    {
      key: "year",
      label: "Year",
      type: "number",
      nullable: true,
      min: 1900,
      max: 2100,
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["ongoing", "completed"],
    },
    ...flags,
  ],
  testimonials: [
    { key: "name", label: "Client name (with consent)", type: "text" },
    { key: "text", label: "Testimonial", type: "textarea" },
    { key: "rating", label: "Rating (1–5)", type: "number", min: 1, max: 5 },
    { key: "approved", label: "Approved for public display", type: "checkbox" },
  ],
  faqs: [
    { key: "question", label: "Question", type: "text" },
    { key: "answer", label: "Answer", type: "textarea" },
    {
      key: "sort_order",
      label: "Sort order",
      type: "number",
      min: 0,
      max: 10000,
    },
    { key: "published", label: "Published", type: "checkbox" },
  ],
  inquiries: [
    {
      key: "status",
      label: "Enquiry status",
      type: "select",
      options: ["new", "contacted", "closed"],
    },
    { key: "notes", label: "Internal notes", type: "textarea" },
  ],
  users: [
    { key: "email", label: "Email", type: "email" },
    {
      key: "password",
      label: "Temporary password (minimum 12 characters)",
      type: "password",
    },
    {
      key: "role",
      label: "Role",
      type: "select",
      options: ["editor", "admin"],
    },
  ],
};
