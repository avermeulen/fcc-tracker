const puppeteer = require('puppeteer');
const express = require('express');
const jsIntro = require('./data/javascript-intro.json');
const htmlIntro = require('./data/html5.json');
const cssIntro = require('./data/css-intro.json');
const app = express();
const PORT = process.env.PORT || 3001;

function calculateProgress(userActivityList, challangesList){
    let activities = userActivityList.filter((activity) => challangesList.challenges.includes(activity));
    let progess = activities.length / challangesList.challenges.length;  
    return Math.floor(progess * 100);
}

app.get('/api/progress/:username', async function(req, res, next){
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const username = req.params.username;
        const page = await browser.newPage();
        await page.goto('https://www.freecodecamp.org/' + username);
        await page.waitForSelector('.username', {
            timeout : 5000
        });
    
        setTimeout(async function(){
            try {
                let userActivity = await page.evaluate(function(sel){
                    let elems = document.querySelectorAll(sel);
                    let results = [];
                    for (let elem of elems) {
                        results.push(elem.innerHTML);
                    }
                    return (results);
                
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
                await browser.close();
            }
            catch(err) {
                return json.send({
                    status: 'error',
                    error: err.stack
                });
            }
        }, 1000);
    }
    catch(err){
        return json.send({
            status: 'error',
            error: err.stack
        });
    }
});

app.listen(PORT, function(){
    console.log('process running at:', PORT);  
});