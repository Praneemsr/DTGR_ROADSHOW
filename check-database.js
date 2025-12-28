const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'database', 'registrations.db');

console.log('========================================');
console.log('Database Verification Tool');
console.log('========================================');
console.log('');

// Check if database exists
if (!fs.existsSync(DB_PATH)) {
    console.log('❌ Database file not found!');
    console.log(`   Expected location: ${DB_PATH}`);
    console.log('');
    console.log('The database will be created automatically when you:');
    console.log('  1. Start the server (npm start or docker-compose up)');
    console.log('  2. Or run: npm run init-db');
    console.log('');
    process.exit(1);
}

console.log('✓ Database file found');
console.log(`   Location: ${DB_PATH}`);
console.log('');

// Get file size
const stats = fs.statSync(DB_PATH);
const fileSizeKB = (stats.size / 1024).toFixed(2);
console.log(`   Size: ${fileSizeKB} KB`);
console.log(`   Created: ${stats.birthtime.toLocaleString()}`);
console.log(`   Modified: ${stats.mtime.toLocaleString()}`);
console.log('');

(async () => {
    try {
        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(DB_PATH);
        const db = new SQL.Database(buffer);
        
        console.log('✓ Database connection successful');
        console.log('');

        // Check table structure
        const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
        const tables = tablesResult.length > 0 ? tablesResult[0].values.map(row => row[0]) : [];
        
        console.log('📊 Database Tables:');
        if (tables.length === 0) {
            console.log('   No tables found - database is empty');
        } else {
            tables.forEach(table => {
                console.log(`   ✓ ${table}`);
            });
        }
        console.log('');

        // Check registrations table structure
        try {
            const columnsResult = db.exec("PRAGMA table_info(registrations)");
            if (columnsResult.length > 0) {
                const columns = columnsResult[0].values.map(row => ({
                    name: row[1],
                    type: row[2],
                    notnull: row[3],
                    dflt_value: row[4]
                }));
                
                console.log('📋 Registrations Table Structure:');
                console.log('');
                console.log('   Column Name        | Type    | Null | Default');
                console.log('   -------------------|---------|------|----------');
                columns.forEach(col => {
                    const name = col.name.padEnd(19);
                    const type = col.type.padEnd(7);
                    const notNull = col.notnull ? 'NO' : 'YES';
                    const defaultVal = col.dflt_value || '';
                    console.log(`   ${name}| ${type}| ${notNull.padEnd(4)}| ${defaultVal}`);
                });
                console.log('');

                // Count registrations
                const countResult = db.exec("SELECT COUNT(*) as count FROM registrations");
                const count = countResult.length > 0 && countResult[0].values.length > 0 
                    ? countResult[0].values[0][0] : 0;
                
                console.log('📈 Registration Statistics:');
                console.log(`   Total Registrations: ${count}`);
                console.log('');

                if (count > 0) {
                    // Get latest registrations
                    const rowsResult = db.exec("SELECT id, first_name, last_name, email, company, country, created_at FROM registrations ORDER BY created_at DESC LIMIT 5");
                    if (rowsResult.length > 0) {
                        const cols = rowsResult[0].columns;
                        const rows = rowsResult[0].values.map(row => {
                            const obj = {};
                            cols.forEach((col, i) => {
                                obj[col] = row[i];
                            });
                            return obj;
                        });
                        
                        console.log('📝 Latest 5 Registrations:');
                        console.log('');
                        rows.forEach((reg, index) => {
                            console.log(`   ${index + 1}. ${reg.first_name} ${reg.last_name}`);
                            console.log(`      Email: ${reg.email}`);
                            console.log(`      Company: ${reg.company || 'N/A'}`);
                            console.log(`      Country: ${reg.country || 'N/A'}`);
                            console.log(`      Registered: ${new Date(reg.created_at).toLocaleString()}`);
                            console.log('');
                        });
                    }
                } else {
                    console.log('   No registrations yet.');
                    console.log('');
                }
            }
        } catch (err) {
            if (err.message.includes('no such table')) {
                console.log('⚠️  Registrations table does not exist yet');
                console.log('   It will be created when the server starts');
            } else {
                console.error('❌ Error:', err.message);
            }
        }

        db.close();
        console.log('========================================');
        console.log('✓ Database check complete!');
        console.log('========================================');
    } catch (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
})();
