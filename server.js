const express = require('express');
const initSqlJs = require('sql.js');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Use /tmp for database on Vercel (writable), otherwise use local database folder
const DB_PATH = process.env.VERCEL 
    ? '/tmp/registrations.db'
    : path.join(__dirname, 'database', 'registrations.db');

// Ensure database directory exists (only for local)
if (!process.env.VERCEL) {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// Initialize database
let db;
let SQL;
let dbReady = false;
let dbInitPromise = null;

// Helper function to download WASM file for serverless environments
async function downloadWasmFile() {
    const https = require('https');
    const wasmUrl = 'https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/sql-wasm.wasm';
    const wasmPath = '/tmp/sql-wasm.wasm';
    
    // Check if already downloaded
    if (fs.existsSync(wasmPath)) {
        return wasmPath;
    }
    
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(wasmPath);
        https.get(wasmUrl, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log('WASM file downloaded to:', wasmPath);
                    resolve(wasmPath);
                });
            } else {
                reject(new Error(`Failed to download WASM: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(wasmPath, () => {}); // Delete partial file
            reject(err);
        });
    });
}

// Initialize database function
async function initializeDatabase() {
    if (dbReady) {
        return; // Already initialized
    }
    
    if (dbInitPromise) {
        return dbInitPromise; // Initialization in progress
    }
    
    dbInitPromise = (async () => {
        try {
            console.log('Starting database initialization...');
            let wasmPath;
            
            // For Vercel/serverless, download WASM to /tmp
            if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
                try {
                    wasmPath = await downloadWasmFile();
                    console.log('WASM file ready');
                } catch (err) {
                    console.warn('Failed to download WASM from CDN, trying local paths:', err.message);
                    wasmPath = null;
                }
            }
            
            // Configure sql.js
            const sqlJsConfig = {
                locateFile: (file) => {
                    if (file.endsWith('.wasm')) {
                        // Use downloaded WASM if available
                        if (wasmPath && fs.existsSync(wasmPath)) {
                            return wasmPath;
                        }
                        
                        // Try local paths for development
                        const possiblePaths = [
                            path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
                            path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
                            '/var/task/node_modules/sql.js/dist/sql-wasm.wasm'
                        ];
                        
                        for (const localPath of possiblePaths) {
                            if (fs.existsSync(localPath)) {
                                console.log('Found WASM file at:', localPath);
                                return localPath;
                            }
                        }
                        
                        // If all else fails, return the downloaded path (will be created)
                        return wasmPath || '/tmp/sql-wasm.wasm';
                    }
                    return file;
                }
            };
            
            console.log('Initializing sql.js...');
            SQL = await initSqlJs(sqlJsConfig);
            console.log('sql.js initialized');
            
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
            
            // Save database to file (only if not on Vercel - /tmp is ephemeral)
            if (!process.env.VERCEL) {
                const data = db.export();
                fs.writeFileSync(DB_PATH, Buffer.from(data));
            }
            
            console.log('Database table ready');
            console.log(`Database location: ${DB_PATH}`);
            dbReady = true;
            console.log('Database initialization complete!');
        } catch (err) {
            console.error('Error initializing database:', err.message);
            console.error('Stack:', err.stack);
            dbReady = false;
            throw err;
        }
    })();
    
    return dbInitPromise;
}

// Start initialization immediately
initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
});

// Helper function to save database
function saveDatabase() {
    if (!db || !dbReady) {
        console.warn('Database not ready, skipping save');
        return;
    }
    try {
        const data = db.export();
        fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch (err) {
        console.error('Error saving database:', err.message);
    }
}

// Middleware to check if database is ready
async function checkDbReady(req, res, next) {
    if (!dbReady || !db) {
        // Try to initialize if not already in progress
        try {
            await initializeDatabase();
            if (!dbReady || !db) {
                return res.status(503).json({
                    success: false,
                    message: 'Database is initializing, please try again in a moment'
                });
            }
        } catch (err) {
            console.error('Database initialization error in middleware:', err);
            return res.status(503).json({
                success: false,
                message: 'Database initialization failed: ' + err.message
            });
        }
    }
    next();
}

// API Route: Register new attendee
app.post('/api/register', checkDbReady, (req, res) => {
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
        if (!db || !dbReady) {
            throw new Error('Database not initialized');
        }
        
        const stmt = db.prepare(sql);
        stmt.bind([me_firstname, me_lastname, me_email, phoneCountry, phoneNumber, me_phonenumber || '', jobRole || '', me_companyname, me_country]);
        stmt.step();
        const id = db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
        stmt.free();
        
        // Save database (only if not on Vercel - Vercel /tmp is ephemeral)
        if (!process.env.VERCEL) {
            saveDatabase();
        }
        
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
app.get('/api/registrations', checkDbReady, (req, res) => {
    try {
        if (!db || !dbReady) {
            throw new Error('Database not initialized');
        }
        
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
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        database: dbReady ? 'ready' : 'initializing'
    });
});

// API Route: Get all database tables
app.get('/api/tables', checkDbReady, (req, res) => {
    try {
        if (!db || !dbReady) {
            throw new Error('Database not initialized');
        }
        
        // Get all tables
        const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
        const tables = tablesResult.length > 0 ? tablesResult[0].values.map(row => row[0]) : [];
        
        // Get table info for each table
        const tableInfo = tables.map(tableName => {
            try {
                const columnsResult = db.exec(`PRAGMA table_info(${tableName})`);
                const columns = columnsResult.length > 0 ? columnsResult[0].values.map(row => ({
                    name: row[1],
                    type: row[2],
                    notNull: row[3] === 1,
                    defaultValue: row[4],
                    primaryKey: row[5] === 1
                })) : [];
                
                // Get row count
                const countResult = db.exec(`SELECT COUNT(*) as count FROM ${tableName}`);
                const count = countResult.length > 0 && countResult[0].values.length > 0 
                    ? countResult[0].values[0][0] : 0;
                
                return {
                    name: tableName,
                    columns: columns,
                    rowCount: count
                };
            } catch (err) {
                return {
                    name: tableName,
                    error: err.message
                };
            }
        });
        
        res.json({
            success: true,
            count: tables.length,
            tables: tableInfo
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching tables: ' + err.message
        });
    }
});

// Admin page route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// CSV Export endpoint (generates CSV directly)
app.get('/api/export-csv', checkDbReady, (req, res) => {
    try {
        if (!db || !dbReady) {
            throw new Error('Database not initialized');
        }
        
        // Get all registrations
        const result = db.exec('SELECT * FROM registrations ORDER BY created_at DESC');
        const rows = result.length > 0 ? result[0].values.map(row => {
            const cols = result[0].columns;
            const obj = {};
            cols.forEach((col, i) => {
                obj[col] = row[i];
            });
            return obj;
        }) : [];
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No registrations found to export'
            });
        }
        
        // Generate CSV
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone Country', 'Phone Number', 'Full Phone', 'Job Role', 'Company', 'Country', 'Registered Date'];
        const csvRows = [headers.join(',')];
        
        rows.forEach(row => {
            const csvRow = [
                row.id || '',
                `"${(row.first_name || '').replace(/"/g, '""')}"`,
                `"${(row.last_name || '').replace(/"/g, '""')}"`,
                `"${(row.email || '').replace(/"/g, '""')}"`,
                `"${(row.phone_country || '').replace(/"/g, '""')}"`,
                `"${(row.phone_number || '').replace(/"/g, '""')}"`,
                `"${(row.full_phone || '').replace(/"/g, '""')}"`,
                `"${(row.job_role || '').replace(/"/g, '""')}"`,
                `"${(row.company || '').replace(/"/g, '""')}"`,
                `"${(row.country || '').replace(/"/g, '""')}"`,
                `"${(row.created_at || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(csvRow.join(','));
        });
        
        const csvContent = csvRows.join('\n');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `registrations_${timestamp}.csv`;
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvContent);
        
    } catch (err) {
        console.error('CSV export error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error exporting CSV: ' + err.message
        });
    }
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
