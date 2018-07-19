const puppeteer = require('puppeteer');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 3001;

app.get('/api/progress/:username', async function(req, res){
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://www.freecodecamp.org/' + req.params.username);
    await page.waitForSelector('.username');

    setTimeout(async function(){
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
    }, 1000);

    
});

app.listen(PORT, function(){
    console.log('process started on port', PORT);  
});

// (async () => {
  
  
//   let username = process.argv[2] || 'avermeulen';

  
  
  
//   //console.log(count);
//   //console.log(count.includes('Change the Color of Text'));  
  
// })();