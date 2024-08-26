const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Pfad zur champions.json Datei
const championsFilePath = path.resolve(__dirname, 'public', 'champions.json');
// Verzeichnis, in dem die Bilder gespeichert werden
const imageDir = path.resolve(__dirname, 'public', 'champions');

// Funktion, um die Champions-Liste aus champions.json zu laden
const loadChampions = () => {
    const data = fs.readFileSync(championsFilePath, 'utf8');
    return JSON.parse(data);
};

// Funktion zum Herunterladen eines Bildes
const downloadImage = async (champion) => {
    const url = `https://cdn5.lolalytics.com/champx92/${champion.apiName.toLowerCase()}.webp`;
    const outputPath = path.resolve(imageDir, `${champion.apiName.toLowerCase()}.webp`);

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
        console.log(`Bild von ${champion.displayName} erfolgreich heruntergeladen!`);
    } catch (error) {
        console.error(`Fehler beim Herunterladen des Bildes von ${champion.displayName}: ${error.message}`);
    }
};

// Alle Bilder herunterladen
const downloadAllImages = async () => {
    const champions = loadChampions(); // Champions aus der JSON-Datei laden

    for (const champion of champions) {
        await downloadImage(champion);
    }
};

// Skript ausführen
downloadAllImages();
