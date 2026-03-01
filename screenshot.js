const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });

  const filePath = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  // Full page screenshot
  await page.screenshot({ path: 'screenshot_full.png', fullPage: true });
  console.log('Full-page screenshot saved: screenshot_full.png');

  // Above-fold screenshot
  await page.screenshot({ path: 'screenshot_fold.png', fullPage: false });
  console.log('Above-fold screenshot saved: screenshot_fold.png');

  await browser.close();
})();
