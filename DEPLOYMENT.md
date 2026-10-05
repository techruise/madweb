# Deploy MAD: beginner's guide

## Before you begin
This repository is implemented and locally tested, but **is not connected to an owner's Supabase project**. The current preview cannot save enquiries or authenticate an owner. A missing backend returns an honest 503; it never pretends to save data. Follow every step below before inviting customers.

You need a Git hosting account, a Supabase project and a Vercel project. Check the providers' current terms and usage limits yourself. No paid plan, email account, project or domain has been purchased. Email notifications remain optional and disabled.

## 1. Open the one project folder
Everything is under `mad/`. Keep this as your repository root. Install Node **22 LTS** (see `.nvmrc`). In a terminal in this folder:

```sh
npm ci
cp .env.example .env.local
npm run typecheck
npm run dev
```

Open http://localhost:3000. Without backend variables, public pages show empty collections and admin login explains the missing configuration. Keep `.env.local` private. Never upload it to Git. The `archive/` folder preserves original Phase 1 material; it is not another active app.

## 2. Create Supabase
1. Sign in to Supabase and create a project. Choose a suitable nearby region and store the database password securely.
2. Wait until the project is ready.
3. Open **SQL Editor → New query**. Open each file from `supabase/migrations/` and paste its entire contents into the editor. Run in order:
   - `001_schema.sql`
   - `002_policies.sql`
   - `003_storage.sql`
4. Each migration is re-runnable. A successful second run may show harmless notices about objects that already exist.
5. For **staging only**, run `supabase/seed.sql`. It adds one SAMPLE property and one SAMPLE project, with no fake photos, prices or testimonials. Do not publish them as real work.
6. Check **Storage**: `properties` and `projects` buckets should exist. They are public, with image MIME limits and 5 MB bucket limits. The website upload UI limits original files to 4 MB to stay below Vercel's request limit. It converts uploads to resized WebP and strips EXIF. Never store confidential documents in these buckets.
7. In **Authentication → Settings**, disable public signup. This is a staff-only system; ordinary signups must never gain a staff role.

## 3. Create the first admin
1. Open **Authentication → Users → Add user**.
2. Enter the owner's real email and a strong password (at least 12 characters recommended). Confirm the user, then copy its UUID.
3. In the SQL Editor, run the following with the **actual UUID** (do not type the placeholder literally):

```sql
insert into public.profiles (id, role)
values ('REPLACE_WITH_AUTH_USER_UUID'::uuid, 'admin')
on conflict (id) do update set role = excluded.role;
```

4. Only Auth users with an admin/editor profile can access the dashboard. Other authenticated accounts are denied.
5. Subsequent users can be added by an admin at `/admin/users`. Share temporary credentials securely. Do not send passwords through the website enquiry form. Staff password reset can be done through Supabase Auth; the custom admin UI does not implement a reset-email flow.

## 4. Configure environment variables
In **Project Settings → API**, find the project URL, anon/publishable key and server-only service role key. Use the appropriate project keys; never put the service role in a `NEXT_PUBLIC_` variable.

For local development, fill `.env.local`:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REQUIRE_BACKEND=false
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_SERVICE_ROLE_KEY
RATE_LIMIT_SECRET=GENERATE_A_RANDOM_SECRET
ALLOW_PREVIEW_EMBED=false
```

Generate the rate-limit secret with `openssl rand -hex 32`, or a password manager. Keep it stable across deployments. All four backend variables must be supplied together; partial configuration fails at startup. `REQUIRE_BACKEND=false` permits local HTTP, but does not disable a configured backend.

**Optional notifications:** only after owner approval, configure a verified sender with Resend and set `RESEND_API_KEY`, `NOTIFICATION_FROM` and `NOTIFICATION_TO`. A notification contains an admin link rather than enquiry personal data. Without these variables, enquiries still save normally. Nothing in this project enables or pays for Resend automatically.

## 5. Test locally with Supabase connected
1. Restart `npm run dev` after changing env variables.
2. Open `/admin/login`. Sign in and confirm the counts load.
3. Create a draft SAMPLE property, add two small licensed photos, change their order and descriptions. Confirm the draft URL is 404 for a signed-out browser.
4. Publish it; check the public detail page, gallery, WhatsApp title/URL and filters. Mark it sold and test the sold filter.
5. Repeat for a project, uploading **before** and **after** photos with the stage selector.
6. Test the contact form and the mobile Enquire dialog. Confirm the enquiry appears in admin, add notes, change status, and export a CSV.
7. Use a disposable staging project for automated integration tests below. The local smoke suite intentionally expects no configured backend; do not run that particular preview-mode suite against a populated production database.

## 6. Deploy on Vercel
1. Commit the code and push this `mad/` repository to your Git provider. Do not commit `.env.local` or credentials.
2. In Vercel choose **Add New → Project**, select the repository, and use the **Next.js** preset. If your repository contains a parent folder, set Root Directory to `mad`.
3. Select Node **22.x**. Standard commands are `npm ci` and `npm run build`.
4. Add every required variable in Vercel's environment settings. For production:
   - `NEXT_PUBLIC_SITE_URL=https://YOUR_PROJECT.vercel.app` initially, later your canonical custom domain.
   - `REQUIRE_BACKEND=true`
   - `ALLOW_PREVIEW_EMBED=false`
   - the four Supabase/rate-limit variables above.
5. Assign secrets to the appropriate environment only. Do not give preview deployments production credentials; use a separate staging database when possible.
6. Deploy. Public `NEXT_PUBLIC_*` values are baked into browser assets, so changing them requires a fresh deployment.
7. If a build/startup fails with `Invalid environment`, fix the named variables; do not disable checks to launch.
8. Vercel automatically sets `VERCEL=1`. The API trusts Vercel's overwritten client-IP header and uses the SQL rate limiter. On a different host, all visitors deliberately share a safe rate bucket until you implement a trusted-proxy IP strategy. Do not simply trust arbitrary `X-Forwarded-For` headers.

## 7. Configure Auth URLs and a custom domain
1. In Supabase **Authentication → URL Configuration**, set Site URL to the canonical deployed origin. Add only the exact local/staging/production redirect URLs you need; avoid broad wildcard production redirects.
2. In Vercel **Project → Settings → Domains**, add the domain you own. Follow the DNS records Vercel shows at your registrar; wait for verification and HTTPS issuance.
3. Choose one canonical origin (www or non-www), and configure the other to redirect to it.
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel and Supabase's Site URL to that HTTPS origin. Redeploy.
5. Check `/sitemap.xml`, `/robots.txt`, `/opengraph-image` and page source. No localhost canonical URLs should remain.
6. Ensure `ALLOW_PREVIEW_EMBED=false`; production should return `X-Frame-Options: DENY`. The Arena preview exception must not be used on the public site.

## 8. Run checks
In the explicit no-backend preview, with a production server on port 3000:

```sh
npm run typecheck
npm run build
npm start
# In another terminal:
npm run test:smoke
npm run test:schemas
npm run test:env
npm run test:a11y
npm audit
```

Install the browser once with `npx playwright install --with-deps chromium`. Actual local command logs and Lighthouse HTML/JSON are in `reports/`.

### Real integration tests (disposable staging only)
Configure a separate Supabase staging project with migrations, a first admin, and a deployed app. Wait for a fresh rate-limit window; the test sends six requests. Set these environment variables **in your shell or secret manager**, never in a committed file:

```sh
export TEST_BASE_URL=https://YOUR_STAGING_HOST
export TEST_ADMIN_EMAIL=YOUR_STAGING_ADMIN_EMAIL
# Enter TEST_ADMIN_PASSWORD securely in your shell; do not paste it into Git.
export TEST_LIVE_CONFIRM=disposable-staging
npm run test:live
```

This test exercises actual login, publication/draft isolation, file upload, image updates, galleries, property filters, enquiry persistence/429, staff notes and CSV. It removes its catalog fixtures; remove its five test enquiries from admin afterward. It was **not run against hosted Supabase during this build**, because credentials were not provided. Also manually test editor restrictions, logout/session refresh, image drag/drop on a phone, user management and optional notification delivery.

### RLS verification
`supabase/tests/rls.sql` runs inside a transaction and rolls back its fixtures. Run it with `psql "$STAGING_DATABASE_URL" -f supabase/tests/rls.sql` against a disposable staging database after migrations/seed. Do not paste `local-bootstrap.sql` into Supabase; it is only an emulation harness for plain PostgreSQL. Local results prove policy SQL, not hosted Auth/Storage behaviour.

### Mobile performance
The final local Lighthouse mobile run reached 94 performance / 100 accessibility / 100 best practices / 100 SEO on the homepage. This is one simulated local run, **not a guarantee for real visitors**. Re-run on the deployed domain after adding photos/content. Verify a real mid-range Android phone on a Pakistan mobile connection. Touch, reduced-motion, save-data, 2G and reported low-core/low-memory devices use a static SVG instead of loading Three.js.

## 9. Content, privacy and operational checks
- Fill only verified values in `config/site.ts`. For portraits, place approved images in `public/` (for example `public/ceo.jpg`) and set the matching `site.team[].photo` to `/ceo.jpg` or the correct local path. The existing Next/Image slots replace the initial panels automatically. CEO/team images remain labelled placeholders, and missing roles stay hidden. No licences, memberships or awards are assumed.
- Add real properties/projects, then delete SAMPLE records and their images before launch. Testimonials remain hidden until approved; obtain client consent before publication.
- Review `/privacy` with the owner; agree on retention, access and deletion procedures. Restrict staff access and review accounts regularly.
- Monitor Vercel function errors, Supabase storage/database limits and optional email delivery. Enable backups appropriate to your plan; test a restore before relying on it.
- Arrange who answers calls/enquiries and who maintains listings. Set a regular dependency/security update schedule.
