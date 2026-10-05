import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const results = [];
for (const width of [390, 1440])
  for (const path of [
    "/",
    "/properties",
    "/projects",
    "/privacy",
    "/admin/login",
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      isMobile: width < 768,
      hasTouch: width < 768,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:3000${path}`);
    await page.waitForTimeout(600);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    results.push({ width, path, violations: result.violations });
    console.log(
      width,
      path,
      result.violations.map((v) => `${v.id}: ${v.nodes.length}`).join(", ") ||
        "PASS",
    );
    if (path === "/") {
      await page.screenshot({
        path: `reports/home-${width}.png`,
        fullPage: true,
      });
      await page
        .getByRole("button", { name: "Enquire", exact: true })
        .count()
        .then(async (count) => {
          if (count && width < 768) {
            await page
              .getByRole("button", { name: "Enquire", exact: true })
              .click();
            const dialog = await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze();
            results.push({
              width,
              path: "enquiry dialog",
              violations: dialog.violations,
            });
          }
        });
    }
    await context.close();
  }
fs.writeFileSync(
  "reports/accessibility.json",
  JSON.stringify(results, null, 2),
);
await browser.close();
if (results.some((r) => r.violations.length)) process.exitCode = 1;
