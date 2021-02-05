const puppeteer = require('puppeteer');
const CodecampScraper = require('./codecamp-progess-scraper');


(async () => {

	try{

		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
		
		const codeCampScraper = CodecampScraper(browser);
		// console.log(codeCampScraper);
		
		const result = await codeCampScraper.scrape("Tlangelani24");
		console.log(result);
	} catch (err) {
		console.log(err);
	}
})();