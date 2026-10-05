import { z } from "zod";
import { site } from "@/config/site";
const text = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine(
      (value) => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value),
      "Please use plain text.",
    );
export const normalizePhone = (value: string) => {
  const digits = value.replace(/[\s()-]/g, "");
  return digits.startsWith("03")
    ? `+92${digits.slice(1)}`
    : digits.startsWith("923")
      ? `+${digits}`
      : digits;
};
export const inquirySchema = z.object({
  name: text(2, 80),
  phone: z
    .string()
    .max(25)
    .transform(normalizePhone)
    .pipe(z.string().regex(/^\+923\d{9}$/, "Enter a Pakistani mobile number.")),
  email: z
    .union([z.string().trim().email().max(254), z.literal(""), z.null()])
    .optional()
    .transform((value) => value || null),
  service: z.enum(["sale", "purchase", "construction"]),
  area: z
    .string()
    .refine((value) => site.areas.includes(value), "Select an area."),
  message: text(10, 2000),
  source_page: z
    .string()
    .max(300)
    .startsWith("/")
    .refine((value) => !value.startsWith("//"))
    .default("/"),
  website: z.string().max(200).optional().default(""),
  consent: z.literal(true),
});
export type InquiryInput = z.input<typeof inquirySchema>;
