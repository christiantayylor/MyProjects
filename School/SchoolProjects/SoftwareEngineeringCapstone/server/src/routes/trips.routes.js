const express = require('express');
const router = express.Router();
const db = require('../config/database');


router.get('/', (req, res) => {
    const trips = db.prepare('SELECT * FROM trips').all();
    res.json(trips);
});


router.get('/:id', (req, res) => {
    const tripId = req.params.id;
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId); // Fetch a specific trip

    if (trip) {
        res.json(trip); // If found, return the trip data
    } else {
        res.status(404).json({ message: 'Trip not found' }); // Handle not found scenario
    }
});


router.post('/', (req, res) => {
    const { userId, destination, startDate, endDate } = req.body;
    const stmt = db.prepare('INSERT INTO trips (userId, destination, startDate, endDate) VALUES (?, ?, ?, ?)');
    const info = stmt.run(userId, destination, startDate, endDate);

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(info.lastInsertRowid);
    res.json(trip);
});


router.put('/:id', (req, res) => {
    const tripId = req.params.id;
    const { destination, startDate, endDate } = req.body;

    const stmt = db.prepare('UPDATE trips SET destination = ?, startDate = ?, endDate = ? WHERE id = ?');

    try {
        const result = stmt.run(destination, startDate, endDate, tripId);

        if (result.changes > 0) {
            console.log(`Successfully updated trip with ID: ${tripId}`);
            res.status(200).json({ message: 'Trip updated successfully' });
        } else {
            console.log(`Trip with ID: ${tripId} not found or no changes made`);
            res.status(404).json({ message: 'Trip not found' });
        }
    } catch (error) {
        console.error('Error during trip update:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.delete('/:id', async (req, res) => {
    const tripId = req.params.id;
    console.log(`Attempting to delete trip with ID: ${tripId}`);

    try {
        db.prepare('DELETE FROM bookings WHERE tripId = ?').run(tripId);
        db.prepare('DELETE FROM excursions WHERE tripId = ?').run(tripId);
        db.prepare('DELETE FROM expenses WHERE tripId = ?').run(tripId);

        const stmt = db.prepare('DELETE FROM trips WHERE id = ?');
        const result = stmt.run(tripId);

        if (result.changes > 0) {
            console.log(`Successfully deleted trip with ID: ${tripId}`);
            res.status(200).json({ message: 'Trip deleted successfully' });
        } else {
            console.log(`Trip with ID: ${tripId} not found`);
            res.status(404).json({ message: 'Trip not found' });
        }
    } catch (error) {
        console.error('Error during trip deletion:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
