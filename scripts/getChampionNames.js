const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs'); // Datei-System-Modul

const url = 'https://www.leagueoflegends.com/en-us/champions/';

async function scrapeChampions() {
    try {
        // Abrufen der HTML-Seite
        const { data } = await axios.get(url);

        // Laden des HTML in cheerio
        const $ = cheerio.load(data);

        // Array zum Speichern der Champion-Namen
        const champions = [];

        // Durchlaufen der Champion-Karten und Extrahieren der Namen
        $('a[role="button"]').each((i, element) => {
            const name = $(element).attr('aria-label');
            if (name) {
                champions.push(name);
            }
        });

        // Schreiben der Champion-Namen in eine JSON-Datei
        fs.writeFileSync('champions.json', JSON.stringify(champions, null, 2), 'utf8');

        console.log('Champion-Namen wurden in champions.json gespeichert.');

    } catch (error) {
        console.error('Fehler beim Abrufen der HTML-Seite:', error);
    }
}

scrapeChampions();
