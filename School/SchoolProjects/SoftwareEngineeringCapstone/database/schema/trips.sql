CREATE TABLE IF NOT EXISTS trips (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     userId INTEGER NOT NULL,
                                     destination TEXT NOT NULL,
                                     startDate TEXT NOT NULL,
                                     endDate TEXT NOT NULL
);