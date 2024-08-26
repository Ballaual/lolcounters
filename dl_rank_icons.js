const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Pfad zur ranks.json Datei
const ranksFilePath = path.resolve(__dirname, 'public', 'ranks.json');
// Verzeichnis, in dem die Bilder gespeichert werden
const imageDir = path.resolve(__dirname, 'public', 'ranks');

// Funktion, um die Ranks-Liste aus ranks.json zu laden
const loadRanks = () => {
    const data = fs.readFileSync(ranksFilePath, 'utf8');
    return JSON.parse(data);
};

// Funktion zum Herunterladen eines Bildes
const downloadRankImage = async (rank) => {
    const url = `https://cdn5.lolalytics.com/emblem80/${rank.apiName2.toLowerCase()}.webp`;
    const outputPath = path.resolve(imageDir, `${rank.apiName2.toLowerCase()}.webp`);

    try {
        // Stelle sicher, dass der Zielordner existiert
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir, { recursive: true });
        }

        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
        });

        response.data.pipe(fs.createWriteStream(outputPath));
        console.log(`Bild für Rank ${rank.displayName} erfolgreich heruntergeladen!`);
    } catch (error) {
        console.error(`Fehler beim Herunterladen des Bildes für Rank ${rank.displayName}: ${error.message}`);
    }
};

// Alle Bilder herunterladen
const downloadAllRankImages = async () => {
    const ranks = loadRanks(); // Ranks aus der JSON-Datei laden

    for (const rank of ranks) {
        await downloadRankImage(rank);
    }
};

// Skript ausführen
downloadAllRankImages();
