# Security model
- Next 16.3.8, React 19.3, locked dependencies. Original audit.json is historical; reports/security-audit.json is the upgrade audit. Re-audit before launch.
- Public queries use anon credentials and published/approved filters; RLS also enforces them.
- Anonymous users have NO direct table permissions on inquiries. The public API uses a server-only service-role client after origin, size, schema, honeypot and distributed rate-limit checks. This is deliberately stricter than an anonymous INSERT policy, which would bypass the API.
- Authenticated admin/editor content writes use the user's own session and RLS. Staff are looked up in profiles, never user-editable JWT metadata. Only admins manage profiles/Auth users or delete inquiries. Original inquiry fields are immutable to staff; status and notes are editable.
- Profiles are provisioned explicitly. Signing up does not grant staff access. Disable public signup in Supabase.
- Rate limit: atomic Postgres upsert, five attempts per 15 minutes per HMAC IP. Fail closed when unavailable. Vercel's overwritten x-vercel-forwarded-for header is trusted only when VERCEL=1; other hosts share one safe bucket until a trusted proxy implementation is configured. No raw IP is stored. Old counters are pruned after one day on subsequent submissions.
- Email notification is optional and sends an admin link, not customer PII. Delivery failure does not lose the already-saved enquiry. Monitor provider logs.
- Image upload verifies JPEG/PNG/WebP signatures and MIME, randomises names, requires staff role, limits app files to 4 MB for Vercel's 4.5 MB body limit, and buckets to 5 MB. SVG/HTML are rejected. Storage is PUBLIC, including unpublished draft images: never upload confidential documents. Deleting an item removes its referenced objects before cascading metadata.
- CSV exports escape quotes/newlines and neutralise formula prefixes. All admin APIs are no-store. Admin pages have noindex and an Auth proxy plus server-level role checks; APIs independently check roles.
- CSP restricts origins, fonts, connections, frames and objects. `unsafe-inline` is retained for Next hydration and motion inline styles (no unsafe-eval in production). This is a documented baseline, not a nonce-based strict CSP. React escapes plain content, input excludes HTML, and JSON-LD escapes '<'.
- Public production denies framing with X-Frame-Options DENY and frame-ancestors none. ALLOW_PREVIEW_EMBED=true only permits Arena-related origins for the local preview. Keep it false on production.
- Secrets are server-only, env validation runs at server startup, and partial backend configuration fails with variable names (not values). REQUIRE_BACKEND=true is mandatory for launch. Empty backend configuration is explicitly a frontend preview, with enquiries returning 503.
- Missing live credentials means Auth/session/upload integrations must still be tested against an actual Supabase project. Local SQL harness proves database policies, not managed-service behaviour.

## Image re-encoding
The upload route additionally decodes accepted bytes with Sharp (40-million-pixel ceiling), applies orientation, resizes to at most 2400×2400, strips metadata and writes WebP at quality 82. This reduces public payload size and prevents serving appended source payloads. A failed decode returns a generic upload error.
