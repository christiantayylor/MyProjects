const db = require('../config/database');

const result = db.prepare('SELECT sqlite_version() AS version').get();
console.log('SQLite version:', result.version);

