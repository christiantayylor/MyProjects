const db = require('../config/database');

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         name TEXT NOT NULL,
                                         email TEXT UNIQUE NOT NULL,
                                         createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    destination TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
);
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tripId INTEGER NOT NULL,
    type TEXT NOT NULL,
    details TEXT NOT NULL,
    cost REAL,
    bookingDate TEXT,
    FOREIGN KEY(tripId) REFERENCES trips(id)
);
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS excursions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tripId INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    date TEXT,
    cost REAL,
    FOREIGN KEY(tripId) REFERENCES trips(id)
);
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tripId INTEGER NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    note TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tripId) REFERENCES trips(id)
);
`).run();

console.log('All database tables initialized!');