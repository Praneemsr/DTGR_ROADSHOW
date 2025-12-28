const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'database', 'registrations.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

(async () => {
    try {
        const SQL = await initSqlJs();
        
        // Create new database
        const db = new SQL.Database();
        
        // Create table
        db.run(`CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone_country TEXT,
            phone_number TEXT,
            full_phone TEXT,
            job_role TEXT,
            company TEXT NOT NULL,
            country TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Save database to file
        const data = db.export();
        fs.writeFileSync(DB_PATH, Buffer.from(data));
        
        console.log('Database table created successfully');
        console.log('Database initialized at:', DB_PATH);
        db.close();
        console.log('Database connection closed');
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
