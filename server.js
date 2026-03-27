const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('ProntoPro scraper online');
});

app.post('/scrape', async (req, res) => {
  console.log('POST /scrape ricevuto');
  console.log('BODY:', req.body);

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL mancante'
    });
  }

  let browser;

  try {
    console.log('Avvio browser');

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Browser avviato');

    const context = await browser.newContext();
    console.log('Context creato');

    const page = await context.newPage();
    console.log('Page creata');

    // LOGIN PRONTOPRO
    console.log('Vado su login ProntoPro');

    await page.goto('https://pro.prontopro.it/login', {
      waitUntil: 'domcontentloaded'
    });

    console.log('Pagina login aperta:', page.url());

    await page.waitForTimeout(3000);

    console.log('Compilo email');
    await page.fill('input[type="email"]', process.env.PRONTOPRO_EMAIL);

    console.log('Compilo password');
    await page.fill('input[type="password"]', process.env.PRONTOPRO_PASSWORD);

    console.log('Click login');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(5000);

    console.log('Login inviato, URL attuale:', page.url());

    // PAGINA LAVORO
    console.log('Vado sulla pagina lavoro:', url);

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    console.log('Pagina lavoro aperta:', page.url());

    const bodyText = await page.locator('body').innerText();

    console.log('Body letto con successo');

    await browser.close();

    return res.json({
      success: true,
      data: {
        url,
        testo_completo: bodyText
      }
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
      stack: error.stack
    });
  }
});
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

// LOGIN PRONTOPRO
await page.goto("https://pro.prontopro.it/login", {
  waitUntil: "domcontentloaded",
  timeout: 60000
});

await page.waitForTimeout(3000);

await page.fill('input[type="email"]', process.env.PRONTOPRO_EMAIL);
await page.fill('input[type="password"]', process.env.PRONTOPRO_PASSWORD);
await page.click('button[type="submit"]');

await page.waitForTimeout(5000);

// PAGINA DEL LAVORO
await page.goto(url, {
  waitUntil: "domcontentloaded",
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
    stack: error.stack
  });
}


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Scraper attivo sulla porta ${PORT}`);
});
