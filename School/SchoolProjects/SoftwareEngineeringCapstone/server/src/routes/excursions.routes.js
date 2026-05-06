const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/database');


const RAPIDAPI_KEY = process.env.EXCURSION_API_KEY;
const RAPIDAPI_HOST = process.env.EXCURSION_API_HOST || 'booking-com15.p.rapidapi.com';


const destIdCache = {};
const excursionCache = {};

router.get('/destid', async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'Missing required parameter: city' });

    const cacheKey = city.toLowerCase();
    if (destIdCache[cacheKey]) {
        console.log(`[ExcursionRoutes] destId cache hit for "${city}": ${destIdCache[cacheKey]}`);
        return res.json({ dest_id: destIdCache[cacheKey] });
    }

    try {
        const response = await axios.get(
            'https://booking-com15.p.rapidapi.com/api/v1/attraction/searchLocation',
            {
                params: { query: city, languagecode: 'en-us' },
                headers: {
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': RAPIDAPI_HOST,
                },
            }
        );

        const locations = response.data?.data?.products || [];
        if (!locations.length) {
            return res.status(404).json({ error: `No destination found for city: ${city}` });
        }

        const destId = locations[0].id;
        destIdCache[cacheKey] = destId;
        console.log(`[ExcursionRoutes] Resolved dest_id for "${city}": ${destId}`);
        res.json({ dest_id: destId });
    } catch (err) {
        console.error('[ExcursionRoutes] Error fetching dest_id:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch destination ID' });
    }
});






router.get('/search', async (req, res) => {
    const {
        city,
        startDate,
        endDate,
        orderBy = 'trending',
    } = req.query;

    if (!city || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required parameters: city, startDate, endDate' });
    }

    try {

        let destId;
        const destCacheKey = city.toLowerCase();

        if (destIdCache[destCacheKey]) {
            destId = destIdCache[destCacheKey];
            console.log(`[ExcursionRoutes] Using cached dest_id for "${city}": ${destId}`);
        } else {
            const locResponse = await axios.get(
                'https://booking-com15.p.rapidapi.com/api/v1/attraction/searchLocation',
                {
                    params: { query: city, languagecode: 'en-us' },
                    headers: {
                        'X-RapidAPI-Key': RAPIDAPI_KEY,
                        'X-RapidAPI-Host': RAPIDAPI_HOST,
                    },
                }
            );

            console.log('[ExcursionRoutes] searchLocation raw keys:', Object.keys(locResponse.data || {}));
            console.log('[ExcursionRoutes] searchLocation sample:', JSON.stringify(locResponse.data, null, 2).slice(0, 800));

            const locations = locResponse.data?.data?.products || locResponse.data?.data || [];

            if (!locations.length) {
                return res.status(404).json({ error: `No destination found for city: ${city}` });
            }




            const first = locations[0];
            destId = first.id;
            destIdCache[destCacheKey] = destId;
            console.log(`[ExcursionRoutes] Resolved dest_id for "${city}": ${destId} (cityUfi: ${first.cityUfi})`);
        }


        const excursionCacheKey = `${destId}|${startDate}|${endDate}|${orderBy}`;
        if (excursionCache[excursionCacheKey]) {
            console.log(`[ExcursionRoutes] Excursion cache hit`);
            return res.json({ results: excursionCache[excursionCacheKey] });
        }


        const attractionParams = {
            id: destId,
            startDate,
            endDate,
            sortBy: orderBy,
            currency_code: 'USD',
            languagecode: 'en-us',
            page: 1,
        };
        console.log('[ExcursionRoutes] Calling searchAttractions with params:', attractionParams);

        const attractionResponse = await axios.get(
            'https://booking-com15.p.rapidapi.com/api/v1/attraction/searchAttractions',
            {
                params: attractionParams,
                headers: {
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': RAPIDAPI_HOST,
                },
            }
        );


        console.log('[ExcursionRoutes] attractionSearch status:', attractionResponse.status);
        console.log('[ExcursionRoutes] attractionSearch top-level keys:', Object.keys(attractionResponse.data || {}));
        console.log('[ExcursionRoutes] attractionSearch sample:', JSON.stringify(attractionResponse.data, null, 2).slice(0, 1500));


        const data = attractionResponse.data;


        let raw = [];
        if (Array.isArray(data?.data?.products)) {
            raw = data.data.products;
        } else if (Array.isArray(data?.data)) {
            raw = data.data;
        } else if (Array.isArray(data?.products)) {
            raw = data.products;
        } else if (Array.isArray(data?.result)) {
            raw = data.result;
        } else if (Array.isArray(data)) {
            raw = data;
        }

        console.log(`[ExcursionRoutes] Raw items found: ${raw.length}`);
        if (raw.length > 0) {
            console.log('[ExcursionRoutes] First item keys:', Object.keys(raw[0]));
            console.log('[ExcursionRoutes] First item:', JSON.stringify(raw[0], null, 2).slice(0, 800));
        }


        const results = raw.map(item => ({
            id: item.id ?? item.product_id ?? null,
            title: item.name ?? item.title ?? 'Unnamed Excursion',
            description: item.shortDescription ?? item.short_description ?? item.description ?? '',
            price: item.representativePrice?.chargeAmount
                ?? item.price?.amount
                ?? item.price
                ?? item.priceFrom
                ?? null,
            currency: item.representativePrice?.currency ?? 'USD',
            rating: item.reviewsStats?.combinedNumericStats?.average
                ?? item.rating
                ?? item.score
                ?? null,
            reviewCount: item.reviewsStats?.combinedNumericStats?.total
                ?? item.reviewCount
                ?? null,
            imageUrl: item.primaryPhoto?.small
                ?? item.cover_image_url
                ?? item.image
                ?? '',
            duration: item.durationDescription ?? item.duration ?? '',
            bookingUrl: item.url ?? '',
        }));

        excursionCache[excursionCacheKey] = results;
        console.log(`[ExcursionRoutes] Returning ${results.length} normalized results`);
        res.json({ results });

    } catch (err) {
        console.error('[ExcursionRoutes] Error fetching excursions:');
        console.error('  Status:', err.response?.status);
        console.error('  Body:', JSON.stringify(err.response?.data, null, 2));
        console.error('  Message:', err.message);
        res.status(500).json({
            error: 'Failed to fetch excursions from Booking.com',
            detail: err.response?.data ?? err.message,
            paramsSent: { id: destId, startDate, endDate, sortBy: orderBy },
        });
    }
});




router.get('/:tripId', (req, res) => {
    const excursions = db.prepare('SELECT * FROM excursions WHERE tripId = ?').all(req.params.tripId);
    res.json(excursions);
});




router.post('/', (req, res) => {
    const { tripId, name, description, date, cost } = req.body;
    const stmt = db.prepare('INSERT INTO excursions (tripId, name, description, date, cost) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(tripId, name, description, date, cost);
    const excursion = db.prepare('SELECT * FROM excursions WHERE id = ?').get(info.lastInsertRowid);
    res.json(excursion);
});

module.exports = router;