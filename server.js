const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database', 'registrations.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// Initialize database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        // Create table if it doesn't exist
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
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Database table ready');
            }
        });
    }
});

// API Route: Register new attendee
app.post('/api/register', (req, res) => {
    const {
        me_firstname,
        me_lastname,
        me_email,
        me_phonenumber,
        me_companyname,
        me_country,
        jobRole
    } = req.body;

    // Validate required fields
    if (!me_firstname || !me_lastname || !me_email || !me_companyname || !me_country) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    // Extract phone country and number if provided
    const phoneParts = me_phonenumber ? me_phonenumber.split(' ') : ['', ''];
    const phoneCountry = phoneParts[0] || '';
    const phoneNumber = phoneParts.slice(1).join(' ') || '';

    // Insert into database
    const sql = `INSERT INTO registrations 
        (first_name, last_name, email, phone_country, phone_number, full_phone, job_role, company, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
        me_firstname,
        me_lastname,
        me_email,
        phoneCountry,
        phoneNumber,
        me_phonenumber || '',
        jobRole || '',
        me_companyname,
        me_country
    ], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({
                    success: false,
                    message: 'This email is already registered'
                });
            }
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }

        res.json({
            success: true,
            message: 'Registration successful',
            id: this.lastID
        });
    });
});

// API Route: Get all registrations (for admin/testing purposes)
app.get('/api/registrations', (req, res) => {
    db.all('SELECT * FROM registrations ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching registrations'
            });
        }
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database location: ${DB_PATH}`);
    console.log(`\nTo export registrations to CSV, run: npm run export-csv`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});

