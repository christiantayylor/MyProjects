const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', (req, res) => {
    const users = db.prepare('SELECT * FROM users').all();
    res.json(users);
});

router.post('/', (req, res) => {
    const { name, email } = req.body;
    const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    const info = stmt.run(name, email);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.json(user);
});

module.exports = router;
