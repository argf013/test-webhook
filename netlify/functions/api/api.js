const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const fetch = require('node-fetch');

const app = express();
const router = express.Router();

const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1253298686205624371/AfFZ4ewPzXtCcDWpGzH-zKsG-VK_yQs-MgruBc-HTmCzhn3FRo5QQ60Gueer1ViOmQPB';

// Middleware untuk mengparse payload JSON
app.use(bodyParser.json());

router.get('/hello', (req, res) => {
    res.send('Hello, world!');
});

// Fungsi untuk mengirim log ke Discord
const sendLogToDiscord = async (message) => {
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message }),
        });

        if (!response.ok) {
            console.error('Failed to send log to Discord:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending log to Discord:', error);
    }
};

// Endpoint untuk menerima webhook dari GitHub
router.post('/github-webhook', async (req, res) => {
    const payload = req.body;

    if (payload && payload.ref && payload.commits) {
        console.log('Received a push event on ref:', payload.ref);
        console.log('Commits:');
        let message = `Received a push event on ref: ${payload.ref}\nCommits:`;
        payload.commits.forEach(commit => {
            const commitMessage = `- ${commit.message} by ${commit.author.name}`;
            console.log(commitMessage);
            message += `\n${commitMessage}`;
        });

        // Kirim log ke Discord
        await sendLogToDiscord(message);
    } else {
        console.log('Received an unknown event');
        await sendLogToDiscord('Received an unknown event');
    }

    res.status(200).send('Webhook received successfully');
});

app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
