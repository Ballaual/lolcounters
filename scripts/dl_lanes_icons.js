const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Pfad zur lanes.json Datei
const lanesFilePath = path.resolve(__dirname, '..', 'public', 'lanes.json');
// Verzeichnis, in dem die Bilder gespeichert werden
const imageDir = path.resolve(__dirname, '..', 'public', 'lanes');

// Funktion, um die Lanes-Liste aus lanes.json zu laden
const loadLanes = () => {
    const data = fs.readFileSync(lanesFilePath, 'utf8');
    return JSON.parse(data);
};

// Funktion zum Herunterladen eines Bildes
const downloadLaneImage = async (lane) => {
    const url = `https://cdn5.lolalytics.com/lane54/${lane.apiName.toLowerCase()}.webp`;
    const outputPath = path.resolve(imageDir, `${lane.apiName.toLowerCase()}.webp`);

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
        console.log(`Bild für Lane ${lane.displayName} erfolgreich heruntergeladen!`);
    } catch (error) {
        console.error(`Fehler beim Herunterladen des Bildes für Lane ${lane.displayName}: ${error.message}`);
    }
};

// Alle Bilder herunterladen
const downloadAllLaneImages = async () => {
    const lanes = loadLanes(); // Lanes aus der JSON-Datei laden

    for (const lane of lanes) {
        await downloadLaneImage(lane);
    }
};

// Skript ausführen
downloadAllLaneImages();
