// const puppeteer = require('puppeteer');
const CodecampScraper = require('./codecamp-progess-scraper');

(async () => {
    try {
        const codeCampScraper = CodecampScraper();
        // console.log(codeCampScraper);
        const result = await codeCampScraper.scrape('loras26');
        console.log(result);
    } catch (err) {
        console.log(err);
    }
})();
