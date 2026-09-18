const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3018";
const outputDir = path.resolve(__dirname, "../qa/screenshots");
const reportPath = path.resolve(__dirname, "../qa/visual-qa-report.json");

async function measure(page, name) {
  return page.evaluate((caseName) => {
    const chips = Array.from(document.querySelectorAll(".atrip-chip"));
    const primary = document.querySelector(".atrip-primary-button");
    const main = document.querySelector("main");

    return {
      case: caseName,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentScrollWidth: document.documentElement.scrollWidth,
      noPageHorizontalOverflow:
        document.documentElement.scrollWidth <= window.innerWidth,
      minChipHeight:
        chips.length > 0
          ? Math.min(...chips.map((chip) => chip.getBoundingClientRect().height))
          : null,
      primaryButtonHeight: primary?.getBoundingClientRect().height ?? null,
      contentBottomPadding: main
        ? Number.parseFloat(getComputedStyle(main.parentElement).paddingBottom)
        : null,
      selectedChipCount: document.querySelectorAll(
        '.atrip-chip[aria-pressed="true"]',
      ).length,
      selectedPresetCount: document.querySelectorAll(
        '.atrip-preset-card[aria-pressed="true"]',
      ).length,
    };
  }, name);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const report = [];

  try {
    for (const width of [320, 375, 390, 430]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      await page.goto(`${baseUrl}/wizard`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { name: "先選一個旅行模式" }).waitFor();
      report.push(await measure(page, `default-${width}`));
      await page.screenshot({
        path: path.join(outputDir, `wizard-default-${width}.png`),
        fullPage: false,
      });
      await page.close();
    }

    const expandedPage = await browser.newPage({ viewport: { width: 375, height: 844 } });
    await expandedPage.goto(`${baseUrl}/wizard`, { waitUntil: "networkidle" });
    await expandedPage
      .getByRole("button", { name: /已套用推薦組合/ })
      .click();
    await expandedPage.getByRole("group", { name: "住宿策略" }).waitFor();
    report.push(await measure(expandedPage, "expanded-375"));
    await expandedPage.screenshot({
      path: path.join(outputDir, "wizard-expanded-375.png"),
      fullPage: false,
    });
    await expandedPage.close();

    const selectedPage = await browser.newPage({ viewport: { width: 375, height: 844 } });
    await selectedPage.goto(`${baseUrl}/wizard`, { waitUntil: "networkidle" });
    await selectedPage.getByRole("button", { name: /運動賽事/ }).click();
    await selectedPage
      .getByPlaceholder("例：9/18 18:00 東京巨蛋")
      .fill("9/18 18:00 東京巨蛋");
    await selectedPage.getByRole("button", { name: "隨景點換宿" }).focus();
    report.push(await measure(selectedPage, "sports-selected-focus-375"));
    await selectedPage.screenshot({
      path: path.join(outputDir, "wizard-sports-selected-focus-375.png"),
      fullPage: false,
    });
    await selectedPage.close();

    const zoomPage = await browser.newPage({ viewport: { width: 320, height: 844 } });
    await zoomPage.goto(`${baseUrl}/wizard`, { waitUntil: "networkidle" });
    await zoomPage
      .getByRole("button", { name: /已套用推薦組合/ })
      .click();
    await zoomPage.evaluate(() => {
      document.documentElement.style.fontSize = "32px";
    });
    report.push(await measure(zoomPage, "expanded-320-text-200-percent"));
    await zoomPage.screenshot({
      path: path.join(outputDir, "wizard-expanded-320-text-200-percent.png"),
      fullPage: false,
    });
    await zoomPage.close();
  } finally {
    await browser.close();
  }

  const failures = report.filter(
    (entry) =>
      !entry.noPageHorizontalOverflow ||
      (entry.minChipHeight !== null && entry.minChipHeight < 44) ||
      (entry.primaryButtonHeight !== null && entry.primaryButtonHeight < 52) ||
      entry.selectedPresetCount !== 1,
  );

  fs.writeFileSync(
    reportPath,
    `${JSON.stringify({ baseUrl, report, failures }, null, 2)}\n`,
  );

  console.log(JSON.stringify({ report, failures }, null, 2));
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
