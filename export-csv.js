const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'database', 'registrations.db');

// Check if database exists
if (!fs.existsSync(DB_PATH)) {
    console.error('Database not found at:', DB_PATH);
    console.log('Please run the server first or run: npm run init-db');
    process.exit(1);
}

// Open database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

// Function to escape CSV fields
function escapeCSV(field) {
    if (field === null || field === undefined) {
        return '';
    }
    const str = String(field);
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

// Function to convert row to CSV line
function rowToCSV(row) {
    return [
        row.id,
        row.first_name,
        row.last_name,
        row.email,
        row.phone_country,
        row.phone_number,
        row.full_phone,
        row.job_role,
        row.company,
        row.country,
        row.created_at
    ].map(escapeCSV).join(',');
}

// Fetch all registrations
db.all('SELECT * FROM registrations ORDER BY created_at DESC', (err, rows) => {
    if (err) {
        console.error('Error fetching registrations:', err.message);
        db.close();
        process.exit(1);
    }

    if (rows.length === 0) {
        console.log('No registrations found in database.');
        db.close();
        return;
    }

    // CSV Header
    const header = 'ID,First Name,Last Name,Email,Phone Country,Phone Number,Full Phone,Job Role,Company,Country,Registration Date';
    
    // Convert rows to CSV
    const csvRows = rows.map(rowToCSV);
    const csvContent = [header, ...csvRows].join('\n');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `registrations_${timestamp}.csv`;
    const filepath = path.join(__dirname, filename);

    // Write to file
    fs.writeFileSync(filepath, csvContent, 'utf8');

    console.log(`\n✓ Successfully exported ${rows.length} registration(s) to CSV`);
    console.log(`  File: ${filepath}`);
    console.log(`  Size: ${(csvContent.length / 1024).toFixed(2)} KB\n`);

    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        }
    });
});

