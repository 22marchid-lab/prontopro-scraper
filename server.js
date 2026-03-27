const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('ProntoPro scraper online');
});

function extractRealProntoProUrl(inputUrl) {
  if (!inputUrl) return '';

  let decoded = inputUrl;

  for (let i = 0; i < 5; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }

  const openMatch = decoded.match(/https:\/\/open\.prontopro\.it\/[^\s"'<>]+/i);
  if (openMatch) {
    return openMatch[0];
  }

  const genericMatch = decoded.match(/https:\/\/[^\s"'<>]*prontopro\.it\/[^\s"'<>]+/i);
  if (genericMatch) {
    return genericMatch[0];
  }

  return inputUrl;
}

app.post('/scrape', async (req, res) => {
  console.log('POST /scrape ricevuto');
  console.log('BODY:', req.body);

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL mancante',
    });
  }

  let browser;

  try {
    console.log('Avvio browser');

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log('Browser avviato');

    const context = await browser.newContext({
      storageState: 'storageState.json',
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'it-IT',
      timezoneId: 'Europe/Rome',
    });
    console.log('Context creato con sessione salvata');

    const page = await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });
    console.log('Page creata');

    const targetUrl = extractRealProntoProUrl(url);

    console.log('URL ORIGINALE:', url);
    console.log('URL PULITO:', targetUrl);
    console.log('Vado sulla pagina lavoro:', targetUrl);

    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await page.waitForTimeout(6000);

    console.log('Pagina lavoro aperta:', page.url());

    const bodyText = await page.locator('body').innerText();
    console.log('Body letto con successo');

    await browser.close();

    return res.json({
      success: true,
      data: {
        url: targetUrl,
        testo_completo: bodyText,
      },
    });
  } catch (error) {
    console.error('ERRORE /scrape:', error);

    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Errore chiusura browser:', e);
      }
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Scraper attivo sulla porta ${PORT}`);
});
