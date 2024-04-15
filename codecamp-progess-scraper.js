
const jsIntro = require('./data/javascript-intro.json');
const htmlIntro = require('./data/html5.json');
const cssIntro = require('./data/css-intro.json');
const puppeteer = require('puppeteer');

const catPhotoApp = createJSONFile('Learn HTML by Building a Cat Photo App', 69);
const cafeMenu = createJSONFile('Learn Basic CSS by Building a Cafe Menu', 91);

function calculateProgress (userActivityList, challangesList) {

    let activities = userActivityList.filter((activity) => challangesList.challenges.includes(activity));
    let progess = activities.length / challangesList.challenges.length;
    return Math.floor(progess * 100);
}

/**
 *
 *
 * @param {String} name - Project Name
 * @param {Number} numberOfSteps - Number of steps per project
 * @return {Object} Object containing project name and challenges
 */
function createJSONFile (name, numberOfSteps) {
    var challenges = [];
    for (var i = 1; i <= numberOfSteps; i++) {
        challenges.push(`${name} - Step ${i}`);
    }
    return {
        name,
        challenges
    };
}

module.exports = function () {
    let browser = null;

    async function getBrowser () {
        if (!browser) {
            browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu']
            });
            // console.log('create browser')
        }
        return browser;
    }

    async function scrape (username) {
        return new Promise(async function (resolve, reject) {
            try {
                const theBrowser = await getBrowser();
                let page = await theBrowser.newPage();

                await page.setRequestInterception(true);
                // ignore stylesheets, images & fonts
                page.on('request', (req) => {
                    if (req.resourceType() === 'stylesheet' ||
                        req.resourceType() === 'font' ||
                        req.resourceType() === 'image') {
                        req.abort();
                    } else {
                        req.continue();
                    }
                });

                await page.goto('https://www.freecodecamp.org/' + username);
                await page.waitForSelector('.username', {
                    timeout: process.env.PAGE_LOAD_TIMEOUT || 5000
                });
                var { userActivity, userPoints, pageCount, lastActiveAt } = await getPageTotals(page);
                let activities = [...userActivity];
                const context = {
                    username,
                    js: 0,
                    html: 0,
                    css: 0,
                    catPhotoApp: 0,
                    cafeMenu: 0,
                    userPoints,
                    pageCount,
                    lastActiveAt
                };

                for (let currentCount = 1; currentCount < pageCount; currentCount++) {
                    const nextPageButton = "[aria-label='Go to next page']";
                    await page.click(nextPageButton);
                    // await page.screenshot({path: `page${currentCount}.png`});

                    var { userActivity } = await getPageTotals(page);
                    // console.log(userActivity.length);

                    activities = activities.concat(userActivity);
                }

                context.js = calculateProgress(activities, jsIntro);
                context.html = calculateProgress(activities, htmlIntro);
                context.cssIntro = calculateProgress(activities, cssIntro);
                context.catPhotoApp = calculateProgress(activities, catPhotoApp);
                context.cafeMenu = calculateProgress(activities, cafeMenu);

                resolve({
                    username,
                    js: calculateProgress(activities, jsIntro),
                    html: calculateProgress(activities, htmlIntro),
                    css: calculateProgress(activities, cssIntro),
                    catPhotoApp: calculateProgress(activities, catPhotoApp),
                    cafeMenu: calculateProgress(activities, cafeMenu),
                    userPoints,
                    pageCount,
                    lastActiveAt
                });
                await page.close();
                // await browser.close();
                page = null;
            } catch (err) {
                // eslint-disable-next-line prefer-promise-reject-errors
                console.log(err);
                browser = null;
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
            }, '.table-auto > tbody > tr > td > a');

            const userPoints = await page.evaluate(function (sel) {
                let elem = document.querySelector(sel);
                return Number(elem.innerText.split(': ')[1]);
            }, '.text-center.points');

            const pageCount = await page.evaluate(function (sel) {
                let elems = document.querySelectorAll(sel);
                if (elems && elems.length > 1) {
                    const pageCountElement = [...elems].find(el => el.innerText.includes('of'));
                    console.log(pageCountElement);
                    let parts = pageCountElement.innerText.split('of');

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

            return {
                userActivity,
                userPoints,
                pageCount,
                lastActiveAt
            };
        }
    }

    function cleanup () {
        if (browser) {
            browser.close();
            console.log('cleaning browser up');
            browser = null;
        }
    }

    return {
        cleanup,
        scrape
    };
};
