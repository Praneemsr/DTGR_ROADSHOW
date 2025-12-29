const express = require('express');
const initSqlJs = require('sql.js');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
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

// Initialize database
let db;
let SQL;

(async () => {
    try {
        // Configure sql.js for Vercel/serverless environment
        // Load WASM from CDN for better compatibility with serverless
        SQL = await initSqlJs({
            locateFile: (file) => {
                if (file.endsWith('.wasm')) {
                    // For Vercel/serverless, use CDN as primary source
                    // This is more reliable than trying to load from filesystem
                    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
                        // Use jsDelivr CDN for sql.js WASM
                        return 'https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/sql-wasm.wasm';
                    }
                    
                    // For local development, try local paths
                    const possiblePaths = [
                        path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
                        path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
                    ];
                    
                    for (const wasmPath of possiblePaths) {
                        if (fs.existsSync(wasmPath)) {
                            console.log('Found WASM file at:', wasmPath);
                            return wasmPath;
                        }
                    }
                    
                    // Fallback to CDN
                    return 'https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/sql-wasm.wasm';
                }
                return file;
            }
        });
        
        // Load existing database or create new one
        let buffer;
        if (fs.existsSync(DB_PATH)) {
            buffer = fs.readFileSync(DB_PATH);
            db = new SQL.Database(buffer);
            console.log('Loaded existing database');
        } else {
            db = new SQL.Database();
            console.log('Created new database');
        }
        
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
        )`);
        
        // Save database to file
        const data = db.export();
        fs.writeFileSync(DB_PATH, Buffer.from(data));
        
        console.log('Database table ready');
        console.log(`Database location: ${DB_PATH}`);
    } catch (err) {
        console.error('Error initializing database:', err.message);
        process.exit(1);
    }
})();

// Helper function to save database
function saveDatabase() {
    try {
        const data = db.export();
        fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch (err) {
        console.error('Error saving database:', err.message);
    }
}

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

    try {
        const stmt = db.prepare(sql);
        stmt.bind([me_firstname, me_lastname, me_email, phoneCountry, phoneNumber, me_phonenumber || '', jobRole || '', me_companyname, me_country]);
        stmt.step();
        const id = db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
        stmt.free();
        
        // Save database
        saveDatabase();
        
        res.json({
            success: true,
            message: 'Registration successful',
            id: id
        });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed') || err.message.includes('UNIQUE')) {
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
});

// API Route: Get all registrations (for admin/testing purposes)
app.get('/api/registrations', (req, res) => {
    try {
        const result = db.exec('SELECT * FROM registrations ORDER BY created_at DESC');
        const rows = result.length > 0 ? result[0].values.map(row => {
            const cols = result[0].columns;
            const obj = {};
            cols.forEach((col, i) => {
                obj[col] = row[i];
            });
            return obj;
        }) : [];
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching registrations'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Admin page route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// CSV Export endpoint (triggers export script)
app.get('/api/export-csv', (req, res) => {
    const { exec } = require('child_process');
    const path = require('path');
    
    exec('npm run export-csv', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error('Export error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error exporting CSV: ' + error.message
            });
        }
        
        // Extract filename from output
        const match = stdout.match(/File: (.+)/);
        const filename = match ? match[1] : 'unknown';
        
        res.json({
            success: true,
            message: 'CSV exported successfully',
            filename: filename,
            output: stdout
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`\n📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`📝 Event Registration: http://localhost:${PORT}`);
    console.log(`\nTo export registrations to CSV, run: npm run export-csv`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    try {
        if (db) {
            saveDatabase();
            db.close();
            console.log('Database saved and closed');
        }
    } catch (err) {
        console.error('Error closing database:', err.message);
    }
    process.exit(0);
});
