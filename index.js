const bodyParser = require('body-parser');
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json());

app.post('/scrape', async (req, res) => {
  // collect params from request
  const timeout = parseInt(req.body.timeout) || 3 * 1000;
  const url = req.body.url;

  // bail out if no url
  if (!url) {
    return res.sendStatus(400);
  }

  try {
    // create a new page from the shared browser instance
    const page = await browser.newPage();

    // block images, stylesheets, and fonts
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if ([ 'image', 'stylesheet', 'font' ].indexOf(request.resourceType()) !== -1) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // load the page
    await page.goto(url, { timeout, waitUntil: 'load' });

    // scrape the content and pass it along
    const content =  await page.content();
    res.send(content);

  // pass along any error info
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// share a browser instance between requests
let browser;
(async () => {
  const args = [ '--no-sandbox', '--disable-setuid-sandbox' ];
  browser = await puppeteer.launch({ args });
  app.listen(8080, () => console.log('Server listening on 8080...'));
})();
