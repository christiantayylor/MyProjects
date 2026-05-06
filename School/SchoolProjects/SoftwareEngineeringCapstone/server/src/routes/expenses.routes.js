const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/:tripId', (req, res) => {
    const expenses = db.prepare('SELECT * FROM expenses WHERE tripId = ?').all(req.params.tripId);
    res.json(expenses);
});

router.post('/', (req, res) => {
    const { tripId, category, amount, note } = req.body;
    const stmt = db.prepare('INSERT INTO expenses (tripId, category, amount, note) VALUES (?, ?, ?, ?)');
    const info = stmt.run(tripId, category, amount, note);

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
    res.json(expense);
});

module.exports = router;