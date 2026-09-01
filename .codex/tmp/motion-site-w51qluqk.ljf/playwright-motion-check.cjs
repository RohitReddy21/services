const { chromium } = require("playwright");

const TARGET_URL = "http://localhost:3000";
const OUTPUT_DIR = "C:/Users/PC/Desktop/Services/ags-platform/.codex/tmp/motion-site-w51qluqk.ljf";

async function waitForSettledHome(page) {
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForSelector("canvas", { timeout: 20000 });
  await page.waitForFunction(() => document.fonts?.status === "loaded", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

async function canvasReport(page) {
  return page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    return Array.from(document.querySelectorAll("canvas")).map((canvas, index) => {
      const rect = canvas.getBoundingClientRect();
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      let nonBlankSamples = 0;
      let sampled = 0;

      if (gl && canvas.width > 0 && canvas.height > 0) {
        const pixel = new Uint8Array(4);
        for (let x = 1; x <= 8; x += 1) {
          for (let y = 1; y <= 8; y += 1) {
            gl.readPixels(
              Math.floor((canvas.width * x) / 9),
              Math.floor((canvas.height * y) / 9),
              1,
              1,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              pixel
            );
            sampled += 1;
            if (pixel[3] > 0 && pixel[0] + pixel[1] + pixel[2] > 16) {
              nonBlankSamples += 1;
            }
          }
        }
      }

      return {
        index,
        cssWidth: Math.round(rect.width),
        cssHeight: Math.round(rect.height),
        top: Math.round(rect.top),
        inViewport:
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth,
        drawingWidth: canvas.width,
        drawingHeight: canvas.height,
        sampled,
        nonBlankSamples,
      };
    });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await waitForSettledHome(page);
  const desktopTop = await canvasReport(page);
  await page.screenshot({ path: `${OUTPUT_DIR}/home-desktop-top.png`, fullPage: true });

  await page.mouse.wheel(0, 1300);
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(600);
  const desktopScrolled = await canvasReport(page);
  await page.screenshot({ path: `${OUTPUT_DIR}/home-desktop-scrolled.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await waitForSettledHome(page);
  const mobileTop = await canvasReport(page);
  await page.screenshot({ path: `${OUTPUT_DIR}/home-mobile-top.png`, fullPage: true });

  const visibleTextOverlap = await page.evaluate(() => {
    const selectors = ["h1", "h2", "h3", "p", "a", "button"];
    return selectors.flatMap((selector) =>
      Array.from(document.querySelectorAll(selector)).map((element) => {
        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);
        return {
          selector,
          text: (element.textContent || "").trim().slice(0, 80),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          visible:
            rect.width > 0 &&
            rect.height > 0 &&
            styles.visibility !== "hidden" &&
            styles.display !== "none",
        };
      })
    ).filter((item) => item.visible && (item.width < 4 || item.height < 4));
  });

  console.log(
    JSON.stringify(
      {
        url: page.url(),
        desktopTop,
        desktopScrolled,
        mobileTop,
        screenshots: [
          `${OUTPUT_DIR}/home-desktop-top.png`,
          `${OUTPUT_DIR}/home-desktop-scrolled.png`,
          `${OUTPUT_DIR}/home-mobile-top.png`,
        ],
        tinyVisibleTextNodes: visibleTextOverlap,
      },
      null,
      2
    )
  );

  await browser.close();
})();
