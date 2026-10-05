import { z } from "zod";
import { site } from "@/config/site";
const plain = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((value) => !/[<>\u0000-\u0008]/.test(value), "Use plain text.");
const nullableNumber = (max: number) => z.number().min(0).max(max).nullable();
const common = {
  title: plain(3, 160),
  slug: z.string().regex(/^[a-z0-9-]{1,100}$/),
  description: plain(10, 10000),
  area: z.string().refine((value) => site.areas.includes(value)),
  featured: z.boolean(),
  published: z.boolean(),
  is_sample: z.boolean(),
};
export const propertySchema = z
  .object({
    ...common,
    type: z.enum(["sale", "purchase", "construction"]),
    price: nullableNumber(1e12),
    size: z.number().positive().max(1e6).nullable(),
    size_unit: z.enum(["marla", "kanal"]),
    bedrooms: nullableNumber(100).refine(
      (value) => value === null || Number.isInteger(value),
    ),
    bathrooms: nullableNumber(100).refine(
      (value) => value === null || Number.isInteger(value),
    ),
    status: z.enum(["for sale", "sold"]),
  })
  .strict();
export const projectSchema = z
  .object({
    ...common,
    scope: z.enum(["grey structure", "finishing"]),
    year: z.number().int().min(1900).max(2100).nullable(),
    status: z.enum(["ongoing", "completed"]),
  })
  .strict();
export const testimonialSchema = z
  .object({
    name: plain(2, 80),
    text: plain(10, 2000),
    rating: z.number().int().min(1).max(5),
    approved: z.boolean(),
  })
  .strict();
export const faqSchema = z
  .object({
    question: plain(5, 200),
    answer: plain(10, 3000),
    published: z.boolean(),
    sort_order: z.number().int().min(0).max(10000),
  })
  .strict();
export const inquiryUpdateSchema = z
  .object({
    status: z.enum(["new", "contacted", "closed"]),
    notes: plain(0, 5000),
  })
  .strict();
export const imageUpdateSchema = z
  .object({
    alt: plain(3, 200),
    sort_order: z.number().int().min(0).max(1000),
    stage: z.enum(["before", "after"]).optional(),
  })
  .strict();
export const resources = [
  "properties",
  "projects",
  "testimonials",
  "faqs",
  "inquiries",
  "property_images",
  "project_images",
] as const;
export type Resource = (typeof resources)[number];
export function schemaFor(resource: Resource) {
  switch (resource) {
    case "properties":
      return propertySchema;
    case "projects":
      return projectSchema;
    case "testimonials":
      return testimonialSchema;
    case "faqs":
      return faqSchema;
    case "inquiries":
      return inquiryUpdateSchema;
    default:
      return imageUpdateSchema;
  }
}
