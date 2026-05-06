CREATE TABLE IF NOT EXISTS expenses (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        tripId INTEGER NOT NULL,
                                        category TEXT NOT NULL,
                                        amount REAL NOT NULL,
                                        note TEXT,
                                        FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );