const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });

  const filePath = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);

  // Section shots by scroll position
  const sections = [
    { name: 'header_hero', y: 0 },
    { name: 'new_arrivals', y: 620 },
    { name: 'scent_categories', y: 1080 },
    { name: 'footer', y: totalHeight - 900 },
  ];

  for (const s of sections) {
    await page.evaluate(y => window.scrollTo(0, y), s.y);
    await new Promise(r => setTimeout(r, 100));
    await page.screenshot({ path: `section_${s.name}.png` });
    console.log(`Saved section_${s.name}.png`);
  }

  await browser.close();
})();
