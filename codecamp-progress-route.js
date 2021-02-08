const jsIntro = require('./data/javascript-intro.json');
const htmlIntro = require('./data/html5.json');
const cssIntro = require('./data/css-intro.json');

const CodecampScraper = require('./codecamp-progess-scraper');


function calculateProgress (userActivityList, challangesList) {
    
    let activities = userActivityList.filter((activity) => challangesList.challenges.includes(activity));
    let progess = activities.length / challangesList.challenges.length;
    return Math.floor(progess * 100);
}

module.exports = function () {
    return async function (req, res) {
        const username = req.params.username;
        try {
                        
            const codeCampScraper = CodecampScraper();

            const result = await codeCampScraper.scrape(username);

            return res.send(result);

        } catch (err) {
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
