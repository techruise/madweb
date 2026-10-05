# MAD — Mian Associates & Developers

Premium real estate and construction website for Lahore. Phase 1 is preserved and extended through Phases 2–6 in one project folder.

## Status
**Implemented and locally tested; owner configuration and hosted integration verification are still required before launch.** No Supabase credentials, domain, real listings, photos or testimonials were supplied. The preview has honest empty states and returns 503 for enquiry persistence until the backend is configured. It does not fabricate a successful save.

## Quick start
Node **22 LTS** required.
```sh
npm ci
cp .env.example .env.local
npm run dev
```
For production preview: `npm run build && npm start`.

## Stack
Next.js **16.3.8** App Router / React 19.3 / strict TypeScript / Tailwind 4 / Framer Motion / GSAP ScrollTrigger / Lenis / dynamically imported React Three Fiber / Supabase Postgres, Auth and Storage / Zod / Sharp.

The original vulnerable Next 14 dependency tree was upgraded on `chore/security-upgrade`, verified and merged. `audit.json` is historical; `reports/final-audit.json` is the current audit (0 vulnerabilities at the time tested). No blind force fix was used.

## What is included
- Preserved monogram/curtain, custom desktop cursor, magnetic buttons and architectural hero.
- Company, config-driven facts, CEO/team placeholders, services and interactive area selector.
- `/properties` and `/projects`: Supabase queries, filters, sort/pagination, details, galleries/lightbox and inquiry links. SQL seed is clearly SAMPLE-labelled.
- Process, approved-only testimonials, accessible FAQ, contact form, shared footer, mobile Call/WhatsApp/Enquire.
- Inquiry API with validation, same-origin controls, honeypot, bounded body, atomic database rate limit, persistence and optional notifications.
- `/admin`: Auth, role-based dashboard, inquiries/notes/status/CSV, content CRUD, publishing/featured/sold, images with accessible reorder controls and drag/drop, testimonials, FAQs and admin-only user management.
- RLS migrations, image buckets, privacy page, security headers, SEO/OG/schema/sitemap/robots, accessibility/performance checks and deployment documentation.

## Structure
```
app/                    App Router pages, APIs, admin and metadata
components/             Reusable public and admin components
config/site.ts          Single source: contact, services, areas, team, verified stats
config/content/         English content layer (ready to expand to other locales)
config/admin-fields.ts  Admin form labels and field definitions
lib/                    Validation, queries, Supabase clients, auth and SEO
supabase/migrations/    Numbered re-runnable schema, RLS and storage SQL
supabase/seed.sql        SAMPLE-only catalog data; no invented testimonials
supabase/tests/         RLS test and plain-Postgres harness
public/                 Local fonts, licences and labelled image placeholder
reports/                Actual command logs, audit, accessibility and Lighthouse output
archive/                Preserved Phase 1 files and earlier lockfiles
```

## Design/performance decisions
The existing palette and typography are unchanged. Local fonts are subset/compressed WOFF2; original TTFs remain preserved. The same transform-only preloader curtain uses CSS to avoid shipping a motion runtime to touch devices. Framer Motion reveals load only when desktop sections enter view. GSAP/Lenis/cursor code is desktop-only. Touch, weak-device, save-data, reduced-motion and missing-WebGL paths use SVG and do not mount Canvas. Desktop 3D pauses offscreen/when hidden; DPR stays capped at 1.5. Uploaded photos are decoded, stripped of metadata and resized to WebP.

## Commands
```sh
npm run typecheck
npm run build
npm run test:smoke    # App running on :3000; explicit no-backend preview fixtures
npm run test:schemas
npm run test:env
npm run test:a11y     # App running on :3000
npm run test:live     # Opt-in disposable hosted staging; requires credentials
npm audit
```
The smoke suite checks 360/390/768/1440px, mobile actions, scene/effects, weak/reduced/no-WebGL fallbacks, filters/empty states, admin guard, API rejection paths and SEO. Success/429 **UI** states use explicitly mocked responses; SQL rate/policy tests use real local PostgreSQL. Hosted Supabase Auth/Storage and successful API persistence are not claimed as verified.

## Read before launch
- [DEPLOYMENT.md](DEPLOYMENT.md): beginner setup, first admin, Vercel, Supabase and staging tests.
- [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md): missing owner inputs and manual launch gates.
- [SECURITY.md](SECURITY.md): RLS, key handling, rate limits, CSP and storage privacy.
- [FINAL_REPORT.md](FINAL_REPORT.md): implementation, measured results and remaining risks.

Keep secrets out of Git. Keep `ALLOW_PREVIEW_EMBED=false` and set `REQUIRE_BACKEND=true` for public production. No paid service has been provisioned or enabled.
