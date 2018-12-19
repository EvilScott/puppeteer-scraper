const bodyParser = require('body-parser');
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json());

app.post('/scrape', async (req, res) => {
  const url = req.body.url;
  // TODO handle no url
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load' });
    const content =  await page.content();
    res.send(content);
  } catch (err) {
    res.status(500).json({ err });
  }
});

let browser;
(async () => {
  const args = [ '--no-sandbox', '--disable-setuid-sandbox' ];
  browser = await puppeteer.launch({ args });
  app.listen(8080, () => console.log('Server listening on 8080...'));
})();
