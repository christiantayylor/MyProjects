CREATE TABLE IF NOT EXISTS bookings (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        tripId INTEGER NOT NULL,
                                        type TEXT NOT NULL,
                                        details TEXT NOT NULL,
                                        cost REAL NOT NULL,
                                        bookingDate TEXT NOT NULL,
                                        FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );