const express = require('express');
const router = express.Router();
const db = require('../config/database');
const axios = require('axios');


const RAPIDAPI_KEY = process.env.BOOKING_API_KEY;
const RAPIDAPI_HOST = process.env.BOOKING_API_HOST;


router.get('/:tripId', (req, res) => {
    const bookings = db.prepare('SELECT * FROM bookings WHERE tripId = ?').all(req.params.tripId);
    res.json(bookings);
});


router.post('/', (req, res) => {
    const { tripId, type, details, cost, bookingDate } = req.body;


    console.log("Incoming Booking Request:", JSON.stringify(req.body, null, 2));


    const detailsString = JSON.stringify(details);

    console.log("Fields Received:", {
        tripId,
        type,
        detailsString,
        cost,
        bookingDate,
    });


    if (!tripId || !type || !details || !bookingDate || cost == null) {
        console.error("Missing required fields for booking:", { tripId, type, details, cost, bookingDate });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare('INSERT INTO bookings (tripId, type, details, cost, bookingDate) VALUES (?, ?, ?, ?, ?)');

    try {
        const info = stmt.run(tripId, type, detailsString, cost, bookingDate);
        const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(info.lastInsertRowid);
        res.json(booking);
    } catch (error) {
        console.error('Error inserting booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});




router.delete('/:id', (req, res) => {
    const bookingId = req.params.id;
    console.log("Received DELETE request for booking ID:", bookingId);


    const existingBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    if (!existingBooking) {
        console.error(`Booking ID ${bookingId} not found for deletion`);
        return res.status(404).json({ error: 'Booking not found' });
    }


    const stmt = db.prepare('DELETE FROM bookings WHERE id = ?');
    const info = stmt.run(Number(bookingId));

    if (info.changes > 0) {
        console.log(`Booking with ID ${bookingId} deleted successfully.`);
        res.status(204).send();
    } else {
        console.error(`Failed to delete booking ID ${bookingId}`);
        res.status(404).json({ error: 'Booking not found' });
    }
});






router.get('/hotel/details/:hotelId', async (req, res) => {
    const { hotelId } = req.params;

    try {
        const response = await axios.get(
            'https://booking-com.p.rapidapi.com/v1/hotels/data',
            {
                params: {
                    hotel_id: hotelId,
                    locale: 'en-us'
                },
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
