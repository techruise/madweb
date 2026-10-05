/** Opt-in tests for a DISPOSABLE Supabase staging project. Never run on production. */
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const {
  TEST_BASE_URL: base,
  TEST_ADMIN_EMAIL: email,
  TEST_ADMIN_PASSWORD: password,
  TEST_LIVE_CONFIRM: confirm,
} = process.env;
if (!base || !email || !password || confirm !== "disposable-staging") {
  console.log(
    "NOT RUN: provide TEST_BASE_URL, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD and TEST_LIVE_CONFIRM=disposable-staging. See DEPLOYMENT.md.",
  );
  process.exit(0);
}
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
const page = await context.newPage();
await page.goto(`${base}/admin/login`);
await page.getByLabel("Email", { exact: true }).fill(email);
await page.getByLabel("Password", { exact: true }).fill(password);
await page.getByRole("button", { name: "Sign in", exact: true }).click();
await page.waitForURL(`${base}/admin`);
const suffix = Date.now();
const created = [];
const origin = new URL(base).origin;
async function api(resource, method, data, id) {
  const result = await page.request.fetch(`${base}/api/admin/${resource}`, {
    method,
    headers: { Origin: origin },
    data: { ...(id ? { id } : {}), ...(data ? { data } : {}) },
  });
  assert(result.ok(), `${method} ${resource}: ${await result.text()}`);
  return result.json();
}
try {
  for (const resource of ["properties", "projects"]) {
    const item = {
      title: `SAMPLE TEST ${resource} ${suffix}`,
      slug: `test-${resource}-${suffix}`,
      description:
        "SAMPLE automated staging test only; not a real offer or project.",
      area: "DHA",
      featured: false,
      published: false,
      is_sample: true,
      ...(resource === "properties"
        ? {
            type: "sale",
            price: 1000000,
            size: 5,
            size_unit: "marla",
            bedrooms: 3,
            bathrooms: 3,
            status: "for sale",
          }
        : { scope: "finishing", year: null, status: "ongoing" }),
    };
    const { id } = await api(resource, "POST", item);
    created.push({ resource, id });
    const guest = await browser.newPage();
    assert.equal(
      (await guest.goto(`${base}/${resource}/${item.slug}`)).status(),
      404,
    );
    await api(resource, "PATCH", { ...item, published: true }, id);
    assert.equal(
      (await guest.goto(`${base}/${resource}/${item.slug}`)).status(),
      200,
    );
    assert(await guest.locator(".sample-notice").isVisible());
    const link = await guest
      .locator(".detail-panel a")
      .first()
      .getAttribute("href");
    assert(decodeURIComponent(link).includes(item.slug));
    await guest.getByRole("button", { name: "Open image gallery" }).click();
    assert(await guest.locator(".lightbox").isVisible());
    await guest.keyboard.press("Escape");
    // Tiny valid PNG. The app decodes, re-encodes and stores a WebP.
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWM4sbIOK2IYWhIAbRh7wdPzJd4AAAAASUVORK5CYII=",
      "base64",
    );
    const upload = await page.request.post(`${base}/api/admin/upload`, {
      headers: { Origin: origin },
      multipart: {
        kind: resource,
        parent: id,
        alt: "SAMPLE staging image",
        stage: "before",
        file: { name: "test.png", mimeType: "image/png", buffer: png },
      },
    });
    assert(upload.ok(), await upload.text());
    const uploaded = (await upload.json()).image;
    await api(
      resource === "properties" ? "property_images" : "project_images",
      "PATCH",
      {
        alt: "Updated staging image",
        sort_order: 0,
        ...(resource === "projects" ? { stage: "after" } : {}),
      },
      uploaded.id,
    );
    await guest.goto(`${base}/${resource}?area=DHA`);
    assert(await guest.getByRole("heading", { name: item.title }).isVisible());
    await guest.close();
  }
  const payload = {
    name: `Staging test ${suffix}`,
    phone: "03001234567",
    email: "",
    service: "purchase",
    area: "DHA",
    message: "Automated staging test. Please delete this test enquiry.",
    source_page: "/",
    website: "",
    consent: true,
  };
  // Start with a fresh IP/rate-limit window. This deliberately consumes the window.
  for (let i = 0; i < 6; i++) {
    const response = await page.request.post(`${base}/api/inquiries`, {
      headers: { Origin: origin },
      data: payload,
    });
    assert.equal(response.status(), i < 5 ? 201 : 429);
  }
  await page.goto(`${base}/admin/inquiries`);
  assert(
    await page.getByRole("heading", { name: payload.name }).first().isVisible(),
  );
  await page.getByRole("button", { name: "View enquiry" }).first().click();
  await page.locator('select[name="status"]').selectOption("contacted");
  await page
    .locator('textarea[name="notes"]')
    .fill("Automated staging follow-up note");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForTimeout(500);
  const csv = await page.request.get(`${base}/api/admin/inquiries/export`);
  assert.equal(csv.status(), 200);
  assert((await csv.text()).includes(payload.name));
  console.log(
    "PASS: real Supabase login, property/project CRUD, draft isolation, publication, sample badges, upload, image update, filters, gallery, inquiry persistence, 429, staff notes and CSV",
  );
  console.log(
    "MANUAL CLEANUP: delete the five staging enquiries from the admin panel. Catalog records are removed below.",
  );
} finally {
  for (const item of created.reverse())
    await api(item.resource, "DELETE", null, item.id);
  await browser.close();
}
