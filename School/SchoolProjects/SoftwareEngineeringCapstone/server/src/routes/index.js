const express = require('express');
const router = express.Router();

const airportRoutes = require('./airports.routes');
const bookingRoutes = require('./bookings.routes');
const citiesRoutes = require('./cities.routes');
const excursionRoutes = require('./excursions.routes');
const expenseRoutes = require('./expenses.routes');
const flightRoutes = require('./flights.routes');
const hotelRoutes = require('./hotels.routes');
const tripRoutes = require('./trips.routes');
const userRoutes = require('./users.routes');

router.use('/airports', airportRoutes);
router.use('/bookings', bookingRoutes);
router.use('/cities', citiesRoutes);
router.use('/excursions', excursionRoutes);
router.use('/expenses', expenseRoutes);
router.use('/flights', flightRoutes);
router.use('/hotels', hotelRoutes);
router.use('/trips', tripRoutes);
router.use('/users', userRoutes);

module.exports = router;
