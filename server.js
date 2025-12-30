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
    // Try multiple CDNs for better reliability
    const wasmUrls = [
        'https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/sql-wasm.wasm',
        'https://unpkg.com/sql.js@1.12.0/dist/sql-wasm.wasm'
    ];
    const wasmPath = '/tmp/sql-wasm.wasm';
    
    // Check if already downloaded
    if (fs.existsSync(wasmPath)) {
        try {
            const stats = fs.statSync(wasmPath);
            if (stats.size > 100000) { // WASM file should be > 100KB
                console.log('WASM file already exists:', wasmPath, `(${stats.size} bytes)`);
                return wasmPath;
            }
        } catch (err) {
            console.log('WASM file exists but invalid, re-downloading...');
        }
    }
    
    // Try each CDN URL
    for (let i = 0; i < wasmUrls.length; i++) {
        const wasmUrl = wasmUrls[i];
        console.log(`Attempting to download WASM from CDN ${i + 1}/${wasmUrls.length}: ${wasmUrl}`);
        
        try {
            const result = await new Promise((resolve, reject) => {
                // Set timeout (10 seconds per attempt)
                const timeout = setTimeout(() => {
                    file.destroy();
                    request.destroy();
                    reject(new Error('WASM download timeout after 10 seconds'));
                }, 10000);
                
                const file = fs.createWriteStream(wasmPath);
                
                const request = https.get(wasmUrl, { 
                    timeout: 8000,
                    headers: {
                        'User-Agent': 'Node.js/sql.js',
                        'Accept': '*/*'
                    }
                }, (response) => {
                    if (response.statusCode === 200) {
                        let downloadedBytes = 0;
                        response.on('data', (chunk) => {
                            downloadedBytes += chunk.length;
                        });
                        
                        response.pipe(file);
                        file.on('finish', () => {
                            clearTimeout(timeout);
                            file.close();
                            // Verify file was written
                            try {
                                const stats = fs.statSync(wasmPath);
                                if (stats.size > 100000) { // WASM should be > 100KB
                                    console.log(`WASM file downloaded successfully from CDN ${i + 1}:`, wasmPath, `(${stats.size} bytes, downloaded ${downloadedBytes} bytes)`);
                                    resolve(wasmPath);
                                } else {
                                    reject(new Error(`Downloaded WASM file too small: ${stats.size} bytes`));
                                }
                            } catch (err) {
                                reject(new Error('Failed to verify downloaded WASM file: ' + err.message));
                            }
                        });
                    } else {
                        clearTimeout(timeout);
                        file.destroy();
                        reject(new Error(`Failed to download WASM: HTTP ${response.statusCode}`));
                    }
                });
                
                request.on('error', (err) => {
                    clearTimeout(timeout);
                    file.destroy();
                    fs.unlink(wasmPath, () => {}); // Delete partial file
                    reject(new Error('WASM download error: ' + err.message));
                });
                
                request.on('timeout', () => {
                    clearTimeout(timeout);
                    request.destroy();
                    file.destroy();
                    reject(new Error('WASM download request timeout'));
                });
            });
            
            return result; // Success!
        } catch (err) {
            console.error(`CDN ${i + 1} failed:`, err.message);
            if (i === wasmUrls.length - 1) {
                // Last CDN failed, throw error
                throw new Error(`All CDN attempts failed. Last error: ${err.message}`);
            }
            // Try next CDN
            continue;
        }
    }
    
    throw new Error('All WASM download attempts failed');
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
            console.log('Environment:', { VERCEL: !!process.env.VERCEL, NODE_ENV: process.env.NODE_ENV });
            let wasmPath;
            
            // For Vercel/serverless, first try to find WASM in node_modules (might be bundled)
            // Only download if not found locally
            if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
                console.log('Vercel/production environment detected - checking for WASM file...');
                
                // First, check if WASM exists in node_modules (Vercel might bundle it)
                const possibleLocalPaths = [
                    path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
                    path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
                    '/var/task/node_modules/sql.js/dist/sql-wasm.wasm'
                ];
                
                let foundLocal = false;
                for (const localPath of possibleLocalPaths) {
                    try {
                        if (fs.existsSync(localPath)) {
                            const stats = fs.statSync(localPath);
                            if (stats.size > 100000) {
                                console.log(`Found WASM file in node_modules: ${localPath} (${stats.size} bytes)`);
                                wasmPath = localPath;
                                foundLocal = true;
                                break;
                            }
                        }
                    } catch (err) {
                        // Continue
                    }
                }
                
                // If not found locally, download from CDN
                if (!foundLocal) {
                    console.log('WASM not found in node_modules, downloading from CDN...');
                    try {
                        wasmPath = await downloadWasmFile();
                        console.log('WASM file downloaded successfully:', wasmPath);
                        // Verify it exists and is readable
                        if (!fs.existsSync(wasmPath)) {
                            throw new Error('Downloaded WASM file does not exist at: ' + wasmPath);
                        }
                        const stats = fs.statSync(wasmPath);
                        if (stats.size === 0) {
                            throw new Error('Downloaded WASM file is empty');
                        }
                        console.log(`WASM file verified: ${stats.size} bytes`);
                    } catch (err) {
                        console.error('Failed to download WASM from CDN:', err.message);
                        console.error('Will try to use node_modules path as fallback');
                        // wasmPath remains undefined, will try in locateFile
                    }
                }
            }
            
            // Create locateFile function that can access wasmPath variable
            const createLocateFile = (currentWasmPath) => {
                return (file) => {
                    if (file.endsWith('.wasm')) {
                        // Priority 1: Use downloaded WASM if available and valid
                        if (currentWasmPath) {
                            try {
                                if (fs.existsSync(currentWasmPath)) {
                                    const stats = fs.statSync(currentWasmPath);
                                    if (stats.size > 0) {
                                        console.log('Using downloaded WASM file:', currentWasmPath);
                                        return currentWasmPath;
                                    }
                                }
                            } catch (err) {
                                console.log('Downloaded WASM file invalid, trying alternatives...');
                            }
                        }
                        
                        // Priority 2: Try local paths for development
                        const possiblePaths = [
                            path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
                            path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
                            '/var/task/node_modules/sql.js/dist/sql-wasm.wasm'
                        ];
                        
                        for (const localPath of possiblePaths) {
                            try {
                                if (fs.existsSync(localPath)) {
                                    const stats = fs.statSync(localPath);
                                    if (stats.size > 0) {
                                        console.log('Found WASM file at:', localPath);
                                        return localPath;
                                    }
                                }
                            } catch (err) {
                                // Continue to next path
                            }
                        }
                        
                        // Priority 3: If on Vercel and no local file, try /tmp again (might have been downloaded)
                        if (process.env.VERCEL) {
                            const tmpPath = '/tmp/sql-wasm.wasm';
                            try {
                                if (fs.existsSync(tmpPath)) {
                                    const stats = fs.statSync(tmpPath);
                                    if (stats.size > 0) {
                                        console.log('Found WASM in /tmp:', tmpPath);
                                        return tmpPath;
                                    }
                                }
                            } catch (err) {
                                // Continue
                            }
                        }
                        
                        // Last resort: return a path that will fail with a clear error
                        console.error('WASM file not found in any expected location');
                        console.error('Tried paths:', possiblePaths);
                        if (currentWasmPath) {
                            console.error('Also tried:', currentWasmPath);
                        }
                        // Return a non-existent path - sql.js will fail with a clear error
                        return '/tmp/sql-wasm-not-found.wasm';
                    }
                    return file;
                };
            };
            
            // Verify WASM file exists before attempting initialization
            const verifyWasmFile = (pathToCheck) => {
                if (!pathToCheck) return false;
                try {
                    if (fs.existsSync(pathToCheck)) {
                        const stats = fs.statSync(pathToCheck);
                        return stats.size > 0;
                    }
                } catch (err) {
                    return false;
                }
                return false;
            };
            
            console.log('Initializing sql.js with config...');
            let initAttempts = 0;
            const maxAttempts = 3;
            
            while (initAttempts < maxAttempts) {
                try {
                    initAttempts++;
                    console.log(`sql.js initialization attempt ${initAttempts}/${maxAttempts}...`);
                    
                    // If first attempt failed and we're on Vercel, try downloading WASM again
                    if (initAttempts > 1 && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
                        console.log('Retrying WASM download...');
                        try {
                            wasmPath = await downloadWasmFile();
                            if (verifyWasmFile(wasmPath)) {
                                console.log('WASM re-downloaded and verified successfully');
                            } else {
                                throw new Error('Downloaded WASM file is invalid');
                            }
                        } catch (downloadErr) {
                            console.error('WASM re-download failed:', downloadErr.message);
                            // Continue to try with existing paths
                        }
                    }
                    
                    // On Vercel, ensure we have a valid WASM file before proceeding
                    if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && !verifyWasmFile(wasmPath)) {
                        // Try one more download
                        if (initAttempts === 1) {
                            console.log('WASM file not verified, attempting download...');
                            try {
                                wasmPath = await downloadWasmFile();
                                if (!verifyWasmFile(wasmPath)) {
                                    throw new Error('Downloaded WASM file verification failed');
                                }
                            } catch (downloadErr) {
                                console.error('WASM download failed:', downloadErr.message);
                                // Will try local paths in locateFile
                            }
                        }
                    }
                    
                    // Create config with current wasmPath
                    const sqlJsConfig = {
                        locateFile: createLocateFile(wasmPath)
                    };
                    
                    SQL = await Promise.race([
                        initSqlJs(sqlJsConfig),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('sql.js initialization timeout after 15 seconds')), 15000)
                        )
                    ]);
                    console.log('sql.js initialized successfully');
                    break; // Success, exit loop
                } catch (err) {
                    console.error(`sql.js initialization attempt ${initAttempts} failed:`, err.message);
                    if (initAttempts >= maxAttempts) {
                        console.error('All sql.js initialization attempts failed');
                        console.error('Stack:', err.stack);
                        throw new Error(`Failed to initialize sql.js after ${maxAttempts} attempts: ${err.message}`);
                    }
                    // Wait before retry (exponential backoff)
                    const waitTime = 2000 * initAttempts;
                    console.log(`Waiting ${waitTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
            
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
app.get('/api/health', async (req, res) => {
    let initStatus = dbReady ? 'ready' : (dbInitPromise ? 'initializing' : 'not_started');
    let errorMessage = null;
    
    // If initializing, wait a bit and check again (but don't block too long)
    if (dbInitPromise && !dbReady) {
        try {
            // Wait up to 2 seconds for initialization (non-blocking check)
            await Promise.race([
                dbInitPromise,
                new Promise((resolve) => setTimeout(() => resolve('timeout'), 2000))
            ]);
            // Check status after wait
            initStatus = dbReady ? 'ready' : 'initializing';
        } catch (err) {
            initStatus = 'failed';
            errorMessage = err.message;
        }
    }
    
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        database: initStatus,
        hasDb: !!db,
        hasSQL: !!SQL,
        error: errorMessage,
        vercel: !!process.env.VERCEL,
        nodeEnv: process.env.NODE_ENV,
        note: initStatus === 'initializing' ? 'Database is still initializing. This is normal on cold starts. Try again in a few seconds.' : null
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
        
        console.log('Starting CSV export...');
        
        // Get all registrations - optimized query
        const result = db.exec('SELECT id, first_name, last_name, email, phone_country, phone_number, full_phone, job_role, company, country, created_at FROM registrations ORDER BY created_at DESC');
        
        if (result.length === 0 || !result[0] || result[0].values.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No registrations found to export'
            });
        }
        
        const rows = result[0].values;
        const cols = result[0].columns;
        
        console.log(`Exporting ${rows.length} registrations...`);
        
        // Generate CSV efficiently
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone Country', 'Phone Number', 'Full Phone', 'Job Role', 'Company', 'Country', 'Registered Date'];
        const csvRows = [headers.join(',')];
        
        // Helper function to escape CSV values
        const escapeCsv = (val) => {
            if (val === null || val === undefined) return '""';
            const str = String(val);
            return `"${str.replace(/"/g, '""')}"`;
        };
        
        // Build CSV rows
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const csvRow = [
                row[cols.indexOf('id')] || '',
                escapeCsv(row[cols.indexOf('first_name')]),
                escapeCsv(row[cols.indexOf('last_name')]),
                escapeCsv(row[cols.indexOf('email')]),
                escapeCsv(row[cols.indexOf('phone_country')]),
                escapeCsv(row[cols.indexOf('phone_number')]),
                escapeCsv(row[cols.indexOf('full_phone')]),
                escapeCsv(row[cols.indexOf('job_role')]),
                escapeCsv(row[cols.indexOf('company')]),
                escapeCsv(row[cols.indexOf('country')]),
                escapeCsv(row[cols.indexOf('created_at')])
            ];
            csvRows.push(csvRow.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `registrations_${timestamp}.csv`;
        
        console.log(`CSV generated: ${csvContent.length} bytes`);
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));
        res.send(csvContent);
        
        console.log('CSV export completed');
        
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
