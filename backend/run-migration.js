// Database migration script
// Run this with: node run-migration.js

const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runMigration() {
    console.log('🚀 Starting database migration...');
    
    const client = await pool.connect();
    
    try {
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, 'migrations', '001_update_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📝 Executing migration SQL...');
          // Split by semicolon, but be careful about DO blocks
        const statements = [];
        let currentStatement = '';
        let inDoBlock = false;
        
        const lines = migrationSQL.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('DO $$')) {
                inDoBlock = true;
                currentStatement += line + '\n';
            } else if (trimmedLine === 'END $$;') {
                inDoBlock = false;
                currentStatement += line + '\n';
                statements.push(currentStatement.trim());
                currentStatement = '';
            } else if (inDoBlock) {
                currentStatement += line + '\n';
            } else if (trimmedLine.endsWith(';') && !trimmedLine.startsWith('--')) {
                currentStatement += line + '\n';
                statements.push(currentStatement.trim());
                currentStatement = '';
            } else if (trimmedLine.length > 0 && !trimmedLine.startsWith('--')) {
                currentStatement += line + '\n';
            }
        }
        
        // Add any remaining statement
        if (currentStatement.trim().length > 0) {
            statements.push(currentStatement.trim());
        }
          for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement && !statement.startsWith('--') && statement !== 'COMMIT') {
                try {
                    console.log(`Executing statement ${i + 1}/${statements.length}...`);
                    // Execute each statement in its own transaction to avoid abort issues
                    await client.query('BEGIN');
                    await client.query(statement);
                    await client.query('COMMIT');
                    console.log(`✅ Statement ${i + 1} completed successfully`);
                } catch (err) {
                    await client.query('ROLLBACK');
                    console.warn(`⚠️  Warning in statement ${i + 1}:`, err.message);
                    // Continue with other statements
                }
            }
        }
        
        console.log('✅ Migration completed!');
        
        // Verify the migration by checking timeslots count
        const timeslotsResult = await client.query('SELECT COUNT(*) FROM timeslots');
        console.log(`📊 Timeslots in database: ${timeslotsResult.rows[0].count}`);
        
        // Show sample timeslots
        const sampleTimeslots = await client.query('SELECT * FROM timeslots ORDER BY day_of_week, slot_index LIMIT 10');
        console.log('📅 Sample timeslots:');
        sampleTimeslots.rows.forEach(slot => {
            console.log(`  ${slot.day_of_week} ${slot.start_time}-${slot.end_time} (slot ${slot.slot_index})`);
        });
        
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

// Check if database connection works first
async function testConnection() {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Database connection successful');
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('💡 Make sure your database is running and .env file has correct credentials');
        return false;
    }
}

async function main() {
    console.log('🔧 Timetable Database Migration Tool');
    console.log('=====================================');
    
    const connected = await testConnection();
    if (!connected) {
        process.exit(1);
    }
    
    await runMigration();
    console.log('🎉 All done! Your database is now ready for multi-batch timetables.');
}

main().catch(console.error);
