const randomUseragent = require("random-useragent");
const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);
const fs = require("fs");

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function browser() {
  const userAgent = randomUseragent.getRandom();
  const browser = await chromium.launch({ headless: false });
  let storage = {};
  if (fs.existsSync("session.json")) {
    storage = fs.readFileSync("session.json", "utf8");
  }

  const context = await browser.newContext({
    userAgent: userAgent,
    viewport: {
      width: Math.floor(Math.random() * (1200 - 800 + 1)) + 800,
      height: Math.floor(Math.random() * (1000 - 600 + 1)) + 600,
    },
    locale: "en-US",
    timezoneId: "America/Los_Angeles",
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
