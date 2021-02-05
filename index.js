const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const CodecampProgressTracker = require('./codecamp-progress-route');

async function start () {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const codecampProgressTracker = CodecampProgressTracker(browser);
    app.use(cors());
    app.get('/api/progress/:username', codecampProgressTracker);

    app.listen(PORT, function () {
        console.log('process running at:', PORT);
    });
}

start();
