const puppeteer = require('puppeteer');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 3001;

app.get('/api/progress/:username', async function(req, res, next){
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto('https://www.freecodecamp.org/' + req.params.username);
        await page.waitForSelector('.username');
    
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
                
                res.json(userActivity);
                await browser.close();
            }
            catch(err) {
                res.send(err.stack);
            }
        }, 1000);
    }
    catch(err){
        res.send(err.stack);
    }

    
});

app.listen(PORT, function(){
    console.log('process running at:', PORT);  
});