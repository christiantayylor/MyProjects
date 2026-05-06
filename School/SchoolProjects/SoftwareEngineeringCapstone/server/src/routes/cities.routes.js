const express = require('express');
const axios = require('axios');
const router = express.Router();

const cityCache = {};

let lastRequestTime = 0;
const MIN_REQUEST_GAP_MS = 1100;

router.get('/', async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const cacheKey = q.toLowerCase().trim();
    if (cityCache[cacheKey]) {
        return res.json(cityCache[cacheKey]);
    }

    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < MIN_REQUEST_GAP_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_GAP_MS - timeSinceLast));
    }
    lastRequestTime = Date.now();

    try {
        const response = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/cities', {
            params: {
                namePrefix: q,
                limit: 8,
                sort: '-population',
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
            },
        });

        const cities = response.data.data.map(city => {
            const region = city.region || city.city || '';
            return `${city.name}, ${region}, ${city.country}`;
        });

        cityCache[cacheKey] = cities;
        res.json(cities);
    } catch (err) {
        console.error('RapidAPI error:', err.response ? err.response.data : err.message);
        res.status(500).json({ error: 'Failed to fetch city suggestions' });
    }
});

module.exports = router;