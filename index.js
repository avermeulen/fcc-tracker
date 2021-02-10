const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const CodecampProgressTracker = require('./codecamp-progress-route');

app.use(express.static('public'));

async function start () {
    const codecampProgressTracker = CodecampProgressTracker();
    app.use(cors());
    app.get('/api/progress/:username', codecampProgressTracker);

    app.listen(PORT, function () {
        console.log('process running at:', PORT);
    });
}

start();
