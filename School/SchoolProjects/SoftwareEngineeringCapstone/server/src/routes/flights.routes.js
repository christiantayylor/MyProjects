const express = require("express");
const axios = require("axios");
const router = express.Router();
const path = require("path");
const fs = require("fs");

let airports = [];
const dataPath = path.join(__dirname, "../data/airports.json");
if (fs.existsSync(dataPath)) {
    airports = require("../data/airports.json");
}

function getAirportCode(city) {
    if (!city || airports.length === 0) return null;
    const search = city.trim().toLowerCase();
    const match = airports
        .filter(a => a.city && a.city.toLowerCase().includes(search))
        .sort((a, b) => {
            const majorIata = ["ORD", "MDW", "JFK", "LAX", "ATL", "MIA", "DFW", "DEN", "SFO", "SEA"];
            const aScore = majorIata.includes(a.iata?.toUpperCase()) ? 0 :
                a.name?.toLowerCase().includes("international") ? 1 : 2;
            const bScore = majorIata.includes(b.iata?.toUpperCase()) ? 0 :
                b.name?.toLowerCase().includes("international") ? 1 : 2;
            return aScore - bScore;
        })[0];
    return match ? match.iata : null;
}

async function callWithRetry(params, headers, retries = 3, delay = 1000) {
    let lastError;
    const apiUrl = "https://flight-fare-search.p.rapidapi.com/v2/flights/";
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;
            console.log("Attempting URL:", url);
            const response = await axios.get(url, { headers });
            return response;
        } catch (err) {
            lastError = err;
            const status = err.response?.status;
            if (!status || (status < 500 || status >= 600) || attempt === retries) break;
            console.warn("Retrying after error:", err.message);
            await new Promise(res => setTimeout(res, delay * Math.pow(2, attempt)));
        }
    }
    throw lastError;
}

const flightCache = {};

const validateAndFormatDate = (date) => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date provided.');
    }
    return parsedDate.toISOString().split('T')[0];
};

router.get('/transportation/search', async (req, res) => {
    const { departureCity, destinationCity, departureDate } = req.query;

    console.log('Transportation search parameters:', { departureCity, destinationCity, departureDate });

    if (!departureCity || !destinationCity || !departureDate) {
        return res.status(400).json({ error: 'Missing required query parameters.' });
    }

    try {
        const formattedDepartureDate = validateAndFormatDate(departureDate);

        const departureCode = getAirportCode(departureCity) || departureCity;
        const destinationCode = getAirportCode(destinationCity) || destinationCity;

        console.log(`Resolved airport codes: ${departureCity} -> ${departureCode}, ${destinationCity} -> ${destinationCode}`);

        const cacheKey = `${departureCode.toLowerCase()}|${destinationCode.toLowerCase()}|${formattedDepartureDate}`;
        if (flightCache[cacheKey]) {
            return res.json(flightCache[cacheKey]);
        }

        const params = {
            from: departureCode,
            to: destinationCode,
            date: formattedDepartureDate,
            type: 'Economy',
            adult: 1,
            child: 0,
            infant: 0,
            currency: 'USD'
        };

        const headers = {
            'x-rapidapi-key': process.env.FLIGHT_API_KEY,
            'x-rapidapi-host': process.env.FLIGHT_API_HOST,
            'Content-Type': 'application/json'
        };

        console.log("Fetching flights with params:", params);
        const response = await callWithRetry(params, headers);

        if (!response?.data?.results?.length) {
            return res.status(404).json({ message: 'No flights found for the selected route and dates.' });
        }

        const formattedResults = response.data.results.map(flight => ({
            id: flight.id,
            flightNumber: flight.flight_code,
            airline: flight.flight_name,
            departureDate: departureDate,
            price: flight.totals.total,
            stops: flight.stops,
            cabinType: flight.cabinType,
            baggage: flight.baggage,
        }));

        flightCache[cacheKey] = formattedResults;
        res.json(formattedResults);

    } catch (error) {
        console.error('Error fetching transportation data:', error.message);
        res.status(500).json({ message: 'Internal server error while fetching flights.' });
    }
});

module.exports = router;