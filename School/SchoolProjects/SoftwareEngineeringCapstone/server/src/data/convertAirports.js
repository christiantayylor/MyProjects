const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "airports.dat");
const outputFile = path.join(__dirname, "airports.json");

const raw = fs.readFileSync(inputFile, "utf-8");


const lines = raw.split("\n");

const airports = lines
    .map(line => {

        const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

        if (!parts || parts.length < 14) return null;

        return {
            id: parts[0],
            name: parts[1]?.replace(/"/g, ""),
            city: parts[2]?.replace(/"/g, ""),
            country: parts[3]?.replace(/"/g, ""),
            iata: parts[4]?.replace(/"/g, ""),
            icao: parts[5]?.replace(/"/g, ""),
            latitude: parts[6],
            longitude: parts[7],
        };
    })

    .filter(a => a && a.iata && a.iata !== "\\N");


fs.writeFileSync(outputFile, JSON.stringify(airports, null, 2));

console.log(`✅ Converted ${airports.length} airports to airports.json`);