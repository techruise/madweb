# MAD website — final implementation report

**Date:** 5 October 2026  
**Working folder:** `mad/`  
**Status:** Phases 2–6 implemented and committed, with local verification completed. **Not yet cleared for public launch:** the owner must connect Supabase, supply verified content and complete hosted integration checks.

## 1. What was built

### Security first
The original Phase 1 snapshot was committed, then upgraded on `chore/security-upgrade` and merged after passing checks. Next 14.2.35 → **16.3.8**, React 18 → **19.3**, React Three Fiber 8 → **9.8.1**, Tailwind 3 → **4.3.3**, Framer Motion 11 → **14.0**. Supabase packages were updated and Node 22 is now required. No blind `npm audit fix --force` was used. The final audit reports **0 vulnerabilities**.

### Public site
- Phase 1 architectural hero, monogram, curtain, desktop cursor/magnetic actions and brand identity retained.
- Company, config-driven facts, CEO/team, services and area selector. Missing stats are visibly pending; unverified roles remain hidden. Portrait slots accept owner-supplied paths via `site.team[].photo`.
- Supabase-backed property/project collections and detail pages, filters, sorting, pagination, SAMPLE badges, lazy Next/Image galleries/lightbox and title/URL-prefilled WhatsApp links.
- Process, approved-only testimonials, FAQ, contact enquiry form and map/address conditional on verified config, mobile actions and full footer.
- Shared English content/config structure, privacy notice and honest unconfigured-backend empty/error states.

### Backend and admin
- Three numbered, re-runnable migrations for schema, RLS and Storage, plus SAMPLE-only catalog seed data. No fabricated testimonials.
- Public content reads restricted to published/approved rows. API-only public inquiry insertion; no direct anonymous inquiry read/write permissions.
- Zod validation, Pakistani phone normalization, honeypot, bounded body, origin checks, server-only key handling and atomic PostgreSQL IP-hash rate limiting.
- Optional Resend notifications, disabled until owner approval/credentials. An email failure does not discard the saved enquiry.
- Protected `/admin`, session handling and role checks; dashboard, inquiry workflow/notes/reply/call/CSV, content CRUD, featured/sold/publish controls, image upload/reordering, testimonials, FAQs and admin-only user management.
- Uploads decode/re-encode to resized WebP, strip metadata, reject unsupported types and enforce file/pixel limits.
- Security headers, noindex admin, startup env validation and deployment safeguards documented in SECURITY.md.

### SEO and quality
- Per-page metadata, canonicals, OG/Twitter image, verified-data business schema, FAQ schema, non-sample listing schema, sitemap and robots.
- Local subset WOFF2 fonts and original font licences; lazy/deferred motion libraries and image optimization.
- SVG fallback on touch, weak-device, reduced-motion, save-data/2G and missing-WebGL paths. Desktop 3D pauses when hidden/offscreen and keeps the 1.5 DPR cap.
- Deployment guide, launch checklist, public privacy notice, tests and actual reports.

## 2. What was actually run

All available local checks below passed. Logs are retained, not inferred.

| Check | Result | Evidence |
|---|---|---|
| TypeScript + Next route type generation | Pass | `reports/phase6-typecheck.txt` |
| Production build | Pass | `reports/phase6-build.txt` |
| Playwright: 360/390/768/1440px | Pass | `reports/phase6-smoke.txt` |
| Desktop Canvas, GSAP/Lenis scroll, cursor | Pass | Same smoke log |
| Touch, weak, reduced-motion, no-WebGL fallback | Pass | Same smoke log |
| Catalog filters/empty states/404 | Pass without live DB | Same smoke log |
| Real HTTP admin guard, write rejection, inquiry 400/403/503/honeypot | Pass | Same smoke log |
| Inquiry success/429 frontend handling | Pass **with explicitly mocked HTTP responses** | Same smoke log |
| Schema/input validation | Pass | `reports/schema-tests.txt` |
| Invalid/partial environment fail-closed checks | Pass | `reports/env-tests.txt` |
| Browser asset service-key-name scan | Pass | `reports/client-secret-scan.txt` |
| Migrations applied twice | Pass on local PostgreSQL 17 | `reports/phase5-sql.txt` |
| RLS, role restrictions, immutable inquiry fields, safe storage names, 5/15min RPC | Pass on local PostgreSQL | `reports/release-sql-rls.txt` |
| axe-core WCAG A/AA automated checks | 0 violations on tested pages/dialog | `reports/accessibility.json`, `reports/phase6-accessibility.txt` |
| npm audit | 0 vulnerabilities | `reports/final-audit.json` |
| Hosted Supabase integration | **Not run: credentials unavailable** | `reports/live-backend-status.txt` |

### Actual command output excerpts

```text
> npm run typecheck
> next typegen && tsc --noEmit
Generating route types...
✓ Types generated successfully
```

```text
> npm run test:smoke
360px: hero, navigation, dialog, core content, area selector passed
390px: hero, navigation, dialog, core content, area selector passed
768px: hero, navigation, dialog, core content, area selector passed
1440px: hero, navigation, dialog, core content, area selector passed
Reduced-motion fallback: passed
weak fallback: passed
webgl fallback: passed
Catalog filters, mobile layout, empty states and missing listing 404: passed (no live DB)
Real HTTP: admin guard, unauthorized writes, enquiry validation, CSRF, unconfigured-backend 503 and honeypot passed
Inquiry UI 201: passed using explicitly mocked HTTP response
Inquiry UI 429: passed using explicitly mocked HTTP response
Metadata, structured data, sitemap, robots and OG image: passed
```

```text
PASS: anon isolation, API-only inquiry inserts, staff roles,
immutable inquiry fields, storage names, rate limiting, admin delete
```

The plain PostgreSQL harness supplies minimal Auth/Storage schema stand-ins. It verifies SQL permissions and functions, **not managed Supabase Auth, REST, file storage or session refresh**. `tests/live-backend.mjs` is provided for a disposable, owner-configured staging project.

## 3. Measured mobile Lighthouse result

Final recorded run: **Lighthouse 13.5.0**, local production server, mobile emulation, simulated slow network (150 ms RTT / ~1.6 Mbps) and 4× CPU slowdown.

| Category | Score |
|---|---:|
| Performance | **94** |
| Accessibility | **100** |
| Best practices | **100** |
| SEO | **100** |

- FCP: **1.2 s**
- LCP: **2.5 s** (rounded Lighthouse display)
- Total blocking time: **210 ms**
- Cumulative layout shift: **0**
- Speed index: **2.9 s**

Raw evidence: `reports/lighthouse-release.report.json`, `.html`, and `lighthouse-release-summary.json`. Earlier runs measured 78, 88 and 93; a release check measured 92 before the final check measured 94. Results vary with the test environment. This is not a real-device or deployed-database guarantee. Re-test the deployed site after adding real content. Automated accessibility results do not establish full manual WCAG compliance.

## 4. Pending owner actions / limits

1. **Connect and verify Supabase.** Until then, enquiry persistence returns 503 and staff cannot sign in. No fake success or local JSON database substitutes for Supabase.
2. Run the hosted staging test and manual checks: successful login/logout/session refresh, actual inquiry persistence/rate limiting, authenticated mobile admin screens, image upload/reordering, draft publication, editor restrictions, user management and optional notification delivery. These are implemented but are **not claimed as end-to-end verified on Supabase**.
3. Supply address/maps, email/socials, portraits and approval of CEO copy, missing team roles, verified stats, genuine listings/projects, testimonial consent and any licence/membership evidence.
4. Choose the real canonical HTTPS domain; deploy with `REQUIRE_BACKEND=true`, `ALLOW_PREVIEW_EMBED=false`, correct Auth URLs and protected secrets. No public deployment or paid service has been provisioned.
5. Review privacy/retention, backups, staff access and response ownership. Public storage URLs are public even for draft photos; never upload confidential documents.
6. On non-Vercel hosts, replace the safe shared rate bucket with a verified trusted-proxy IP strategy before accepting customer traffic.
7. CSP is a documented baseline allowing inline Next hydration/motion styles, not a nonce-based strict CSP. See SECURITY.md. Optional Urdu translation/RTL review is not shipped.

**Exact beginner setup and testing steps:** `DEPLOYMENT.md`.  
**Every outstanding content/manual item:** `LAUNCH_CHECKLIST.md`.

## 5. Handover organization

One active project folder, `mad/`, contains source, Git history, migrations, seed, docs and evidence. Original Phase 1 files were preserved in place or under `archive/`; no original source file was deleted. The security branch and phase-by-phase commits remain in Git. Generated dependency/build caches are not part of the handover archive. The final archive expands to one `mad/` folder and omits all local environment values and Git credential/config files.
