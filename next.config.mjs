const previewEmbed = process.env.ALLOW_PREVIEW_EMBED === "true";
const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const storageOrigin = storageUrl ? new URL(storageUrl).origin : "";
// Inline styles are required by R3F/motion; inline scripts by Next's RSC payload.
// No unsafe-eval in production. See SECURITY.md for the CSP trade-off.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob: ${storageOrigin}`,
  `connect-src 'self' ${storageOrigin} ${storageOrigin.replace("https:", "wss:")}`,
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  previewEmbed
    ? "frame-ancestors https://arena.ai https://*.arena.ai https://*.e2b.app https://*.lmarena.ai"
    : "frame-ancestors 'none'",
].join("; ");
/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: storageUrl
      ? [
          {
            protocol: "https",
            hostname: new URL(storageUrl).hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          ...(previewEmbed ? [] : [{ key: "X-Frame-Options", value: "DENY" }]),
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};
export default nextConfig;
