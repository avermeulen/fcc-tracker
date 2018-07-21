const jsIntro = require('./data/javascript-intro.json');
const htmlIntro = require('./data/html5.json');
const cssIntro = require('./data/css-intro.json');

function calculateProgress (userActivityList, challangesList) {
    let activities = userActivityList.filter((activity) => challangesList.challenges.includes(activity));
    let progess = activities.length / challangesList.challenges.length;
    return Math.floor(progess * 100);
}

module.exports = function (browser) {
    return async function (req, res) {
        try {
            const username = req.params.username;
            const page = await browser.newPage();
            await page.goto('https://www.freecodecamp.org/' + username);
            await page.waitForSelector('.username', {
                timeout: 5000
            });
            setTimeout(async function () {
                try {
                    let userActivity = await page.evaluate(function (sel) {
                        let elems = document.querySelectorAll(sel);
                        let results = [];
                        for (let elem of elems) {
                            results.push(elem.innerHTML);
                        }
                        return results;
                    }, '.table-striped > tbody > tr > td > a');
                    res.json({
                        status: 'success',
                        data: {
                            username,
                            js: calculateProgress(userActivity, jsIntro),
                            html: calculateProgress(userActivity, htmlIntro),
                            css: calculateProgress(userActivity, cssIntro)
                        }
                    });
                } catch (err) {
                    return res.json({
                        status: 'error',
                        error: err.stack
                    });
                }
            }, 1000);
        } catch (err) {
            return res.json({
                status: 'error',
                error: err.stack
            });
        }
    };
};
