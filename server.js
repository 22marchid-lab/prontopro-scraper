const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('ProntoPro scraper online');
});

app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL mancante'
    });
  }

  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    const bodyText = await page.locator('body').innerText();

    await browser.close();

    return res.json({
      success: true,
      data: {
        url,
        testo_completo: bodyText
      }
    });
  } catch (error) {
    if (browser) await browser.close();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Scraper attivo sulla porta ${PORT}`);
});