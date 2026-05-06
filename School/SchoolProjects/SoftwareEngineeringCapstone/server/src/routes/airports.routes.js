const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

let airports = [];
const dataPath = path.join(__dirname, "../data/airports.json");
if (fs.existsSync(dataPath)) {
    airports = require("../data/airports.json");
}

function rankAirport(a) {
    const iata = a.iata?.toUpperCase();
    const name = a.name?.toLowerCase();

    const majorIata = ["ORD", "MDW"];
    if (majorIata.includes(iata)) return 0;
    if (name.includes("international")) return 1;
    if (name.includes("regional")) return 2;
    return 3;
}

router.get("/search", (req, res) => {
    const { query } = req.query;
    if (!query || query.trim().length < 2) {
        return res.json({ result: [] });
    }

    if (airports.length === 0) return res.json({ result: [] });

    const search = query.trim().toLowerCase();
    const matches = airports
        .filter(a => a.city && a.city.toLowerCase().includes(search))
        .sort((a, b) => rankAirport(a) - rankAirport(b))
        .map(a => ({
            name: a.name,
            city: a.city,
            country: a.country,
            iata: a.iata
        }));

    res.json({ result: matches.slice(0, 10) });
});

module.exports = router;