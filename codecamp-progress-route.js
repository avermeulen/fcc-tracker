const CodecampScraper = require('./codecamp-progess-scraper');

module.exports = function () {
    let codeCampScraper = null;
    let scrapeCounter = 0;

    function codeCampScraperInstance () {

        if (!codeCampScraper || scrapeCounter === 100) {
            codeCampScraper = CodecampScraper();
            scrapeCounter = 0;
        }

        scrapeCounter++;
        return codeCampScraper;
        
    }



    return async function (req, res) {
        const username = req.params.username;
        try {
            const result = await codeCampScraperInstance().scrape(username);
            return res.send(result);
        } catch (err) {
            if (!err.stack) {
                return res.json({
                    status: 'error',
                    error: err
                });
            }

            if (err.stack.indexOf('failed: timeout') !== -1) {
                return res.json({
                    status: 'no-profile',
                    username
                });
            }
            
            return res.json({
                status: 'error',
                error: err.stack
            });
        }
    };
};
