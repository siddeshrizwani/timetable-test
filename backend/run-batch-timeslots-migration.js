// Run the batch-specific timeslots migration
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runBatchTimeslotsMigration() {
    console.log('🚀 Running batch-specific timeslots migration...');
    
    const client = await pool.connect();
    
    try {
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, 'migrations', '003_batch_specific_timeslots.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📝 Executing batch timeslots migration SQL...');
        
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
            if (statement && !statement.startsWith('--')) {
                try {
                    console.log(`Executing statement ${i + 1}/${statements.length}...`);
                    await client.query('BEGIN');
                    await client.query(statement);
                    await client.query('COMMIT');
                    console.log(`✅ Statement ${i + 1} completed successfully`);
                } catch (err) {
                    await client.query('ROLLBACK');
                    console.warn(`⚠️  Warning in statement ${i + 1}:`, err.message);
                    // Don't continue if critical steps fail
                    if (statement.includes('CREATE TABLE') || statement.includes('ALTER TABLE')) {
                        console.error('Critical migration step failed, stopping...');
                        throw err;
                    }
                }
            }
        }
        
        console.log('✅ Batch timeslots migration completed!');
        
        // Verify the migration
        const batchTimeslots = await client.query('SELECT COUNT(*) FROM batch_timeslots');
        console.log(`📊 Batch timeslots created: ${batchTimeslots.rows[0].count}`);
        
        const newSessions = await client.query('SELECT COUNT(*) FROM class_sessions');
        console.log(`📅 Class sessions migrated: ${newSessions.rows[0].count}`);
        
        // Show sample batch timeslots
        const sampleBatchTimeslots = await client.query(`
            SELECT bt.*, b.name as batch_name 
            FROM batch_timeslots bt 
            JOIN batches b ON bt.batch_id = b.batch_id 
            ORDER BY b.name, bt.day_of_week, bt.slot_index 
            LIMIT 10
        `);
        console.log('📅 Sample batch timeslots:');
        sampleBatchTimeslots.rows.forEach(slot => {
            console.log(`  [${slot.batch_name}] ${slot.day_of_week} ${slot.start_time}-${slot.end_time} (slot ${slot.slot_index})`);
        });
        
    } catch (err) {
        console.error('❌ Batch timeslots migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

async function main() {
    console.log('🔧 Converting to Batch-Specific Timeslots');
    console.log('=========================================');
    
    await runBatchTimeslotsMigration();
    console.log('🎉 Successfully converted to batch-specific timeslots!');
    console.log('📝 Now each batch has its own independent timeslots!');
}

main().catch(console.error);
