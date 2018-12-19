const bodyParser = require('body-parser');
const express = require('express');
const puppeteer = require('puppeteer');

const DEFAULT_PORT = 8080;
const DEFAULT_TIMEOUT = 5 * 1000;
const EXCLUDED_RESOURCES = [ 'image', 'stylesheet', 'font' ];

const app = express();
app.use(bodyParser.json());

// share a browser instance between requests
let browser;
async function getBrowser() {
  if (!browser || !browser.process()) {
    const args = [
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-setuid-sandbox',
      '--no-sandbox',
    ];
    console.log('Creating browser...');
    browser = await puppeteer.launch({ args, headless: true });
  }
  return browser;
}

app.post('/scrape', async (req, res) => {
  // collect params from request
  const timeout = parseInt(req.body.timeout) || DEFAULT_TIMEOUT;
  const url = req.body.url;

  // bail out if no url
  if (!url) {
    return res.sendStatus(422);
  }

  try {
    // get browser instance
    const browser = await getBrowser();

    // create a new page from the shared browser instance
    const page = await browser.newPage();

    // block images, stylesheets, and fonts
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (EXCLUDED_RESOURCES.indexOf(request.resourceType()) !== -1) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // load the page
    console.log(`Scraping ${url}`);
    await page.goto(url, { timeout, waitUntil: 'load' });

    // scrape the content
    const content = await page.content();

    // close tab to free memory
    await page.goto('about:blank');
    await page.close();

    // pass along the content
    console.log(`Retrieved content; Length: ${content.length}`);
    res.send(content);

  // pass along any error info
  } catch (err) {
    console.log(err.toString());
    await browser.close();
    res.status(500).send(err.toString());
  }
});

app.use('*', (req, res) => res.sendStatus(404));

(async () => {
  await getBrowser();
  app.listen(DEFAULT_PORT, () => console.log(`Server listening on ${DEFAULT_PORT}...`));
})();
