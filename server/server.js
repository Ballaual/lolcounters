const express = require('express');
const https = require('https');
const fs = require('fs');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();

// Pfade zu den Zertifikatsdateien
const key = fs.readFileSync('./privkey.pem', 'utf8');
const cert = fs.readFileSync('./fullchain.pem', 'utf8');

const options = {
    key: key,
    cert: cert
};

app.use(cors({
    origin: 'https://lol.ballaual.de', // Erlaube nur die Produktions-URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

let processingStatus = {
    isProcessing: false,
    progress: 0,
    message: 'Idle'
};

// Hilfsfunktion zum Verzögern (1 Sekunde)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Endpunkt zur Überprüfung des Serverstatus
app.get('/status', (req, res) => {
    res.json({ status: 'online' });
});

// Endpunkt zur Überprüfung des Verarbeitungsstatus
app.get('/processing-status', (req, res) => {
    res.json(processingStatus);
});

app.get('/fetch-data', async (req, res) => {
    const { champion, lane, tier, patch } = req.query;

    processingStatus.isProcessing = true;
    processingStatus.progress = 0;
    processingStatus.message = 'Starting data fetch...';
    console.log("Starting webscraping process...");

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await delay(300);
    processingStatus.progress = 25;
    processingStatus.message = 'Navigating to page...';

    try {
        // Generiere den Link und logge ihn
        const url = `https://lolalytics.com/lol/${champion}/counters/?lane=${lane}&tier=${tier}&vslane=${lane}&patch=${patch}`;
        console.log(`Received user inputs | Champion: ${champion} | Lane: ${lane} | Rank: ${tier} | Patch: ${patch}`)
        console.log(`Navigating to URL: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle2',
        });

        processingStatus.progress = 50;
        processingStatus.message = 'Page loaded, waiting for content...';

        await page.waitForSelector('div.flex.flex-wrap.justify-between');

        await delay(300);
        processingStatus.progress = 75;
        processingStatus.message = 'Extracting data...';
        console.log("Extracting data from website...");

        let data = await page.evaluate(() => {
            const rows = [];
            document.querySelectorAll('div.flex.flex-wrap.justify-between > span').forEach(span => {
                const championNameElement = span.querySelector('a > div > div:first-child');
                const championName = championNameElement ? championNameElement.textContent.trim() : '';

                const winRateVsElement = span.querySelector('div.text-center.text-xs.text-green-300');
                const winRateVs = winRateVsElement
                    ? parseFloat((100 - parseFloat(winRateVsElement.textContent.trim().split(' ')[0].replace('%', '').replace('VS', '').trim())).toFixed(2))
                    : '';

                const allChampsWinRateElement = span.querySelector('div.text-xs.text-green-500');
                const allChampsWinRate = allChampsWinRateElement
                    ? parseFloat((100 - parseFloat(allChampsWinRateElement.textContent.trim().split(' ')[0].replace('%', '').replace('VS', '').trim())).toFixed(2))
                    : '';

                const gamesCountElement = span.querySelector('div.text-xs.text-gray-500');
                const gamesCount = gamesCountElement
                    ? parseInt(gamesCountElement.textContent.trim().replace(' Games', '').replace(/,/g, ''), 10)
                    : '';

                if (championName && winRateVs && allChampsWinRate && gamesCount) {
                    rows.push({
                        championName,
                        winRateVs: winRateVs,
                        allChampsWinRate: allChampsWinRate,
                        gamesCount: gamesCount,
                    });
                }
            });
            return rows;
        });

        await delay(500);
        processingStatus.progress = 100;
        processingStatus.message = 'Data extraction complete';
        console.log("Sending results to frontend...");
        console.log("Webscraping process completed!");

        await browser.close();

        processingStatus.isProcessing = false;
        processingStatus.progress = 0;
        processingStatus.message = 'Idle';

        res.json(data);
    } catch (error) {
        processingStatus.isProcessing = false;
        processingStatus.progress = 0;
        processingStatus.message = `Error: ${error.message}`;
        res.status(500).json({ error: 'Failed to fetch data' });
        console.log(`Error: ${error.message}`)
    }
});

const PORT = process.env.PORT || 54321;

https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
});
