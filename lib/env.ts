import "server-only";
import { z } from "zod";
const optional = <T extends z.ZodType<string>>(schema: T) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    schema.optional(),
  );
const schema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_SUPABASE_URL: optional(z.string().url()),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optional(z.string().min(20)),
    SUPABASE_SERVICE_ROLE_KEY: optional(z.string().min(20)),
    RATE_LIMIT_SECRET: optional(z.string().min(32)),
    ALLOW_PREVIEW_EMBED: z.enum(["true", "false"]).default("false"),
    REQUIRE_BACKEND: z.enum(["true", "false"]).default("false"),
    RESEND_API_KEY: optional(z.string().min(10)),
    NOTIFICATION_FROM: optional(z.string().email()),
    NOTIFICATION_TO: optional(z.string().email()),
  })
  .superRefine((data, ctx) => {
    if (data.REQUIRE_BACKEND === "true" && data.ALLOW_PREVIEW_EMBED === "true")
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ALLOW_PREVIEW_EMBED"],
        message: "Disable preview embedding before launch.",
      });
    const fields = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "RATE_LIMIT_SECRET",
    ] as const;
    if (data.REQUIRE_BACKEND === "true" || fields.some((key) => data[key]))
      for (const key of fields)
        if (!data[key])
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: "Required for the configured backend.",
          });
    if (data.RESEND_API_KEY)
      for (const key of ["NOTIFICATION_FROM", "NOTIFICATION_TO"] as const)
        if (!data[key])
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: "Required when email notifications are enabled.",
          });
    if (
      data.REQUIRE_BACKEND === "true" &&
      !data.NEXT_PUBLIC_SITE_URL.startsWith("https://")
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXT_PUBLIC_SITE_URL"],
        message: "Use an HTTPS production URL.",
      });
  });
export function validateEnv() {
  const result = schema.safeParse(process.env);
  if (!result.success)
    throw new Error(
      `Invalid environment: ${result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`,
    );
  return result.data;
}
export const env = validateEnv();
