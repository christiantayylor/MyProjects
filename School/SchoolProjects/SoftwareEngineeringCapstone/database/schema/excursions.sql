CREATE TABLE IF NOT EXISTS excursions (
                                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                                          tripId INTEGER NOT NULL,
                                          name TEXT NOT NULL,
                                          description TEXT,
                                          date TEXT,
                                          cost REAL,
                                          FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );