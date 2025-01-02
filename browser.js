const { chromium } = require("playwright");
const fs = require("fs");

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function browser() {
  const browser = await chromium.launch({ headless: false });

  // Load storage state from session.json if it exists
  let storage = {};
  if (fs.existsSync("session.json")) {
    storage = fs.readFileSync("session.json", "utf8");
  }

  const context = await browser.newContext({
    storageState: storage ? JSON.parse(storage) : {},
  });

  const page = await context.newPage();
  await page.waitForLoadState("load");
  await delay(2 * 60 * 1000);
  const newStorage = await context.storageState();
  fs.writeFileSync("session.json", JSON.stringify(newStorage));

  await browser.close();
}

browser();
