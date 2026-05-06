const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('qs');


const RAPIDAPI_KEY = process.env.BOOKING_API_KEY || 'YOUR_BOOKING_API_KEY';
const RAPIDAPI_HOST = process.env.BOOKING_API_HOST || 'booking-com.p.rapidapi.com';


const locationCache = {}; // city -> destination ID results
const hotelCache = {};    // city|checkIn|checkOut -> hotels list


router.get('/getLocation', async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'Missing city' });

    const cacheKey = city.toLowerCase();
    if (locationCache[cacheKey]) return res.json(locationCache[cacheKey]);

    try {
        const response = await axios.get(
            'https://booking-com.p.rapidapi.com/v1/hotels/locations',
            {
                params: { name: city, locale: 'en-us' },
                headers: {
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': RAPIDAPI_HOST
                }
            }
        );

        const results = response.data || [];
        locationCache[cacheKey] = results;
        res.json(results);
    } catch (err) {
        console.error('Error fetching location:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch location' });
    }
});


router.get('/search', async (req, res) => {
    const { city, checkin_date, checkout_date, filter_by_currency, units } = req.query;


    console.log('Incoming Query Params:', {
        city,
        checkin_date,
        checkout_date,
        filter_by_currency,
        units,
    });


    if (!city || !checkin_date || !checkout_date || !filter_by_currency || !units) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

    const cacheKey = `${city.toLowerCase()}|${checkin_date}|${checkout_date}`;
    if (hotelCache[cacheKey]) return res.json({ result: hotelCache[cacheKey] });

    try {

        const locRes = await axios.get('https://booking-com.p.rapidapi.com/v1/hotels/locations', {
            params: { name: city, locale: 'en-us' },
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            }
        });

        const locations = locRes.data || [];
        const location = locations.find(loc => loc.dest_type === 'city');

        if (!location) {
            console.error(`No valid city destination found for '${city}'.`);
            return res.status(404).json({ error: 'No valid city destination found' });
        }

        const destId = location.dest_id;
        const destType = location.dest_type;


        const hotelsRes = await axios.get('https://booking-com.p.rapidapi.com/v1/hotels/search', {
            params: {
                dest_id: destId,
                dest_type: destType,
                checkin_date,
                checkout_date,
                adults_number: 2,  // Change to dynamic if necessary
                room_number: 1,    // Static or dynamic setup
                room_distribution: JSON.stringify([{ adults: 2, children: [] }]),  // Adjust if necessary
                order_by: 'popularity',
                locale: 'en-us',
                filter_by_currency: 'USD', // Send currency
                units: 'imperial'  // Ensure this is being sent properly
            },
            paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            },
            validateStatus: () => true
        });


        console.log('Hotel Search Parameters:', {
            dest_id: destId,
            dest_type: destType,
            checkin_date,
            checkout_date,
            adults_number: 2,
            room_number: 1,
            filter_by_currency: 'USD',
            units: 'imperial' // Log what's being passed for units
        });


        if (hotelsRes.data.detail) {
            console.error('API Error Fields Missing:', hotelsRes.data.detail);
            return res.status(hotelsRes.data.code || 500).json({ error: hotelsRes.data.detail });
        }

        const hotels = (hotelsRes.data.result || []).map(h => ({
            hotelId: h.hotel_id,
            name: h.hotel_name,
            price: h.min_total_price || 0,
            address: h.address || '',
            stars: h.class || '',
            photo: h.main_photo_url || '',
            description: h.review_score_word || '',
        }));

        hotelCache[cacheKey] = hotels; // Cache results
        res.json({ result: hotels });
    } catch (err) {
        console.error('Error fetching hotels from Booking.com API:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch hotels' });
    }
});





router.get('/details/:hotelId', async (req, res) => {
    const { hotelId } = req.params;
    if (!hotelId) return res.status(400).json({ error: 'Missing hotelId parameter' });

    try {
        const response = await axios.get(
            'https://booking-com.p.rapidapi.com/v1/hotels/data',
            {
                params: { hotel_id: hotelId, locale: 'en-us' },
                headers: {
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': RAPIDAPI_HOST
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error('Error fetching hotel details:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch hotel details' });
    }
});

module.exports = router;
