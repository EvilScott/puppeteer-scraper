# Puppeteer Scraper

Usage:
```bash
docker build -t evilscott/puppeteer-scraper:latest .
docker run --rm -itd -p 8080:8080 --name puppeteer-scraper evilscott/puppeteer-scraper:latest
# wait a brief moment for the server
$ curl -X POST --header 'content-type:application/json' --data '{"url":"<URL HERE>"}' http://localhost:8080/scrape
```
