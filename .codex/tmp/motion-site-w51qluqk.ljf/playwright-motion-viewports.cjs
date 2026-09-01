const { chromium } = require("playwright");

const TARGET_URL = "http://localhost:3000";
const OUTPUT_DIR = "C:/Users/PC/Desktop/Services/ags-platform/.codex/tmp/motion-site-w51qluqk.ljf";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
  await page.waitForSelector("canvas", { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUTPUT_DIR}/viewport-desktop-top.png` });

  await page.evaluate(() => window.scrollTo({ top: 1380, behavior: "instant" }));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUTPUT_DIR}/viewport-desktop-services.png` });

  await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll("section")).find((element) =>
      element.textContent?.includes("Engineered for reliable performance")
    );
    section?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUTPUT_DIR}/viewport-desktop-technical.png` });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
  await page.waitForSelector("canvas", { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUTPUT_DIR}/viewport-mobile-top.png` });

  console.log("Viewport screenshots saved");
  await browser.close();
})();
