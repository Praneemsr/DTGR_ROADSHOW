const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'database', 'registrations.db');

// Check if database exists
if (!fs.existsSync(DB_PATH)) {
    console.error('Database not found at:', DB_PATH);
    console.log('Please run the server first or run: npm run init-db');
    process.exit(1);
}

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
function rowToCSV(row, columns) {
    return columns.map(col => escapeCSV(row[col])).join(',');
}

(async () => {
    try {
        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(DB_PATH);
        const db = new SQL.Database(buffer);
        
        // Fetch all registrations
        const result = db.exec('SELECT * FROM registrations ORDER BY created_at DESC');
        
        if (result.length === 0 || result[0].values.length === 0) {
            console.log('No registrations found in database.');
            db.close();
            return;
        }

        const columns = result[0].columns;
        const rows = result[0].values.map(row => {
            const obj = {};
            columns.forEach((col, i) => {
                obj[col] = row[i];
            });
            return obj;
        });

        // CSV Header
        const header = 'ID,First Name,Last Name,Email,Phone Country,Phone Number,Full Phone,Job Role,Company,Country,Registration Date';
        
        // Convert rows to CSV
        const csvRows = rows.map(row => rowToCSV(row, columns));
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

        db.close();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
