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
        const username = req.params.username;
        try {
            const page = await browser.newPage();
            await page.goto('https://www.freecodecamp.org/' + username);
            await page.waitForSelector('.username', {
                timeout: process.env.PAGE_LOAD_TIMEOUT || 3000
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

                    const userPoints = await page.evaluate(function (sel) {
                        let elem = document.querySelector(sel);
                        return elem.innerText;
                    }, '.text-center.points');

                    const pageCount = await page.evaluate(function (sel) {
                        let elems = document.querySelectorAll(sel);
                        let parts = elems[1].innerText.split('of');
                        return Number(parts[parts.length - 1]);
                    }, '.timeline-pagination_list_item');

                    const lastActiveAt = await page.evaluate(function (sel) {
                        let elem = document.querySelector(sel);
                        if (elem) {
                            return elem.children[1].firstChild.dateTime;
                        }
                        // return null;
                    }, '.timeline-row');
                    
                    res.json({
                        status: 'success',
                        data: {
                            username,
                            js: calculateProgress(userActivity, jsIntro),
                            html: calculateProgress(userActivity, htmlIntro),
                            css: calculateProgress(userActivity, cssIntro),
                            userPoints,
                            pageCount,
                            lastActiveAt
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
