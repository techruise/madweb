import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
for (const width of [360, 390, 768, 1440]) {
  const mobile = width < 768;
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    isMobile: mobile,
    hasTouch: mobile,
  });
  if (!mobile)
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
      Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
    });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.waitForTimeout(2700);
  assert.equal(await page.locator("h1").count(), 1);
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  if (mobile) {
    assert.equal(
      await page.locator("canvas").count(),
      0,
      "Touch devices use SVG",
    );
    await page.getByRole("button", { name: "Open menu" }).click();
    assert(await page.locator("#mobile-nav").isVisible());
    await page.getByRole("button", { name: "Close menu" }).click();
    await page.getByRole("button", { name: "Enquire", exact: true }).click();
    assert(await page.locator("#enquiry").isVisible());
    await page.keyboard.press("Escape");
    assert(!(await page.locator("#enquiry").isVisible()));
  } else if (width === 1440) {
    assert.equal(await page.locator("canvas").count(), 1, "R3F mounted");
    await page.mouse.move(1000, 400);
    await page.waitForTimeout(300);
    const before = await page
      .locator(".hero-scene")
      .evaluate((el) => getComputedStyle(el).transform);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1400);
    const after = await page
      .locator(".hero-scene")
      .evaluate((el) => getComputedStyle(el).transform);
    assert.notEqual(before, after, "GSAP scroll transform updates with Lenis");
    assert.equal(
      await page
        .locator(".cursor-ring")
        .evaluate((el) => getComputedStyle(el).opacity),
      "1",
    );
  }
  for (const id of ["company", "expertise", "leadership", "team", "areas"])
    assert.equal(await page.locator(`#${id}`).count(), 1);
  await page.getByRole("button", { name: "Valencia", exact: true }).click();
  assert((await page.locator(".area-detail h3").textContent()) === "Valencia");
  assert(
    (
      await page.locator(".area-detail a").first().getAttribute("href")
    ).includes("Valencia"),
  );
  assert.equal(await page.locator(".team-card").count(), 3);
  await page.locator(".faq-list summary").first().click();
  assert(
    (await page.locator(".faq-list details").first().getAttribute("open")) !==
      null,
  );
  assert.equal(await page.locator("#testimonials").count(), 0);
  assert.equal(await page.locator("iframe").count(), 0);
  assert.equal(
    await page
      .getByRole("form", { name: "Contact enquiry", exact: true })
      .count(),
    1,
  );
  assert.equal(
    await page.locator(".team-card p").count(),
    0,
    "unverified roles hidden",
  );
  assert.deepEqual(errors, []);
  console.log(
    `${width}px: hero, navigation, dialog, core content, area selector passed`,
  );
  await page.close();
}
const reduced = await browser.newPage({ reducedMotion: "reduce" });
await reduced.goto(base);
await reduced.waitForTimeout(1000);
assert.equal(await reduced.locator("canvas").count(), 0);
assert(await reduced.locator(".static-building").isVisible());
console.log("Reduced-motion fallback: passed");
for (const fallback of ["weak", "webgl"]) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.addInitScript((mode) => {
    Object.defineProperty(navigator, "hardwareConcurrency", {
      get: () => (mode === "weak" ? 2 : 8),
    });
    Object.defineProperty(navigator, "deviceMemory", {
      get: () => (mode === "weak" ? 2 : 8),
    });
    if (mode === "webgl") {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return type.includes("webgl")
          ? null
          : original.call(this, type, ...args);
      };
    }
  }, fallback);
  await page.goto(base);
  await page.waitForTimeout(1500);
  assert.equal(await page.locator("canvas").count(), 0);
  assert(await page.locator(".static-building").isVisible());
  await page.close();
  console.log(`${fallback} fallback: passed`);
}
const catalog = await browser.newPage({
  viewport: { width: 390, height: 844 },
});
await catalog.goto(`${base}/properties`);
await catalog.getByLabel("Area", { exact: true }).selectOption("DHA");
await catalog.getByLabel("Minimum price (PKR)").fill("1000000");
await catalog.getByLabel("Status", { exact: true }).selectOption("sold");
await catalog.getByRole("button", { name: "Apply filters" }).click();
await catalog.waitForURL("**/properties?**");
assert(catalog.url().includes("area=DHA"));
assert.equal(
  await catalog.getByLabel("Status", { exact: true }).inputValue(),
  "sold",
);
assert(await catalog.locator(".empty-state").isVisible());
assert(
  await catalog.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth,
  ),
);
await catalog.goto(`${base}/projects`);
assert(await catalog.locator(".empty-state").isVisible());
assert.equal(
  (await catalog.goto(`${base}/properties/not-a-real-listing`)).status(),
  404,
);
console.log(
  "Catalog filters, mobile layout, empty states and missing listing 404: passed (no live DB)",
);
const admin = await browser.newPage();
await admin.goto(`${base}/admin`);
assert(admin.url().endsWith("/admin/login"));
assert.equal(
  await admin.locator('meta[name="robots"]').getAttribute("content"),
  "noindex, nofollow, nocache",
);
const unauthorized = await admin.request.patch(`${base}/api/admin/properties`, {
  headers: { Origin: base },
  data: { id: "11111111-1111-4111-8111-111111111111", data: {} },
});
assert.equal(unauthorized.status(), 401);
const invalid = await admin.request.post(`${base}/api/inquiries`, {
  headers: { Origin: base },
  data: { name: "A", phone: "invalid" },
});
assert.equal(invalid.status(), 400);
const forbidden = await admin.request.post(`${base}/api/inquiries`, {
  headers: { Origin: "https://untrusted.invalid" },
  data: {},
});
assert.equal(forbidden.status(), 403);
const payload = {
  name: "Test Visitor",
  phone: "03001234567",
  email: "",
  service: "purchase",
  area: "DHA",
  message: "This is a test enquiry only.",
  source_page: "/",
  website: "",
  consent: true,
};
const unavailable = await admin.request.post(`${base}/api/inquiries`, {
  headers: { Origin: base },
  data: payload,
});
assert.equal(unavailable.status(), 503);
const trap = await admin.request.post(`${base}/api/inquiries`, {
  headers: { Origin: base },
  data: { ...payload, website: "bot" },
});
assert.equal(trap.status(), 202);
console.log(
  "Real HTTP: admin guard, unauthorized writes, enquiry validation, CSRF, unconfigured-backend 503 and honeypot passed",
);
for (const status of [201, 429]) {
  const formPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await formPage.route("**/api/inquiries", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(
        status === 201 ? { ok: true } : { error: "Rate limited" },
      ),
    }),
  );
  await formPage.goto(base);
  const form = formPage.getByRole("form", {
    name: "Contact enquiry",
    exact: true,
  });
  await form.getByLabel("Your name", { exact: true }).fill(payload.name);
  await form.getByLabel("Mobile number", { exact: true }).fill(payload.phone);
  await form.getByLabel("Service", { exact: true }).selectOption("purchase");
  await form.getByLabel("Preferred area", { exact: true }).selectOption("DHA");
  await form
    .getByLabel("How can we help?", { exact: true })
    .fill(payload.message);
  await form.locator('[name="consent"]').check();
  await form.getByRole("button", { name: "Send enquiry" }).click();
  if (status === 201)
    await formPage
      .getByText("Your enquiry has been received.", { exact: false })
      .waitFor();
  else
    await formPage
      .getByRole("alert")
      .filter({ hasText: "Too many requests" })
      .waitFor();
  console.log(
    `Inquiry UI ${status}: passed using explicitly mocked HTTP response`,
  );
  await formPage.close();
}
const seo = await browser.newPage();
await seo.goto(base);
assert.equal(
  await seo.locator('script[type="application/ld+json"]').count(),
  2,
);
assert.equal(await seo.locator('link[rel="canonical"]').count(), 1);
assert.equal((await seo.request.get(`${base}/sitemap.xml`)).status(), 200);
assert.equal((await seo.request.get(`${base}/robots.txt`)).status(), 200);
assert.equal((await seo.request.get(`${base}/opengraph-image`)).status(), 200);
assert(
  (await (await seo.request.get(`${base}/robots.txt`)).text()).includes(
    "Disallow: /admin",
  ),
);
console.log("Metadata, structured data, sitemap, robots and OG image: passed");
await browser.close();
