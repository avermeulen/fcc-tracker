
const jsIntro = require('./data/javascript-intro.json');
const htmlIntro = require('./data/html5.json');
const cssIntro = require('./data/css-intro.json');

function calculateProgress (userActivityList, challangesList) {

    let activities = userActivityList.filter((activity) => challangesList.challenges.includes(activity));
    let progess = activities.length / challangesList.challenges.length;
    return Math.floor(progess * 100);
}

module.exports = function (browser) {

    async function scrape (username) {
        return new Promise(async function (resolve, reject) {
            try {

                const page = await browser.newPage();
                await page.goto('https://www.freecodecamp.org/' + username);
                await page.waitForSelector('.username', {
                    timeout: process.env.PAGE_LOAD_TIMEOUT || 3000
                });
                var { userActivity, userPoints, pageCount, lastActiveAt } = await getPageTotals(page);
                let activities = [...userActivity];	
                const context = {
                    username,
                    js: 0,
                    html: 0,
                    css: 0,
                    userPoints,
                    pageCount,
                    lastActiveAt
                };

                for (let currentCount = 1; currentCount < pageCount; currentCount++) {
                    const nextPageButton = "[aria-label='Go to Next page']";
                    await page.click(nextPageButton);
                    var { userActivity } = await getPageTotals(page);
                    // console.log(userActivity.length);

                    activities = activities.concat(userActivity);
                }

                context.js = calculateProgress(activities, jsIntro);
                context.html = calculateProgress(activities, htmlIntro);
                context.cssIntro = calculateProgress(activities, cssIntro);

                resolve({
                    username,
                    js: calculateProgress(activities, jsIntro),
                    html: calculateProgress(activities, htmlIntro),
                    css: calculateProgress(activities, cssIntro),
                    userPoints,
                    pageCount,
                    lastActiveAt
                });
                page.close();
            } catch (err) {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject({
                    status: 'error',
                    error: err.stack
                });
            }

        });

        async function getPageTotals (page) {
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
                return Number(elem.innerText.split(' ')[0]);
            }, '.text-center.points');

            const pageCount = await page.evaluate(function (sel) {
                let elems = document.querySelectorAll(sel);
                if (elems && elems.length > 1) {
                    let parts = elems[1].innerText.split('of');
                    return Number(parts[parts.length - 1]);
                }
                return 0;
            }, '.timeline-pagination_list_item');

            const lastActiveAt = await page.evaluate(function (sel) {
                let elem = document.querySelector(sel);
                if (elem) {
                    return elem.dateTime;
                }
                return null;
            }, 'time');


            await page.screenshot({path: 'page1.png'});

            return { 
                userActivity,
                userPoints,
                pageCount,
                lastActiveAt
            };
        }
    }

    return {
        scrape
    };
};
