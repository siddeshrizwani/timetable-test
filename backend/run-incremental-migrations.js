const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runIncrementalMigrations() {
    const client = await pool.connect();
    try {
        console.log('🔄 Running incremental migrations for existing database...');
        
        const migrationFiles = [
            '001_update_schema.sql',
            '002_create_missing_tables.sql', 
            '003_batch_specific_timeslots.sql',
            '004_add_cascade_deletes.sql',
            '005_cleanup_constraints.sql'
        ];
        
        for (const migrationFile of migrationFiles) {
            console.log(`📄 Executing ${migrationFile}...`);
            
            const migrationPath = path.join(__dirname, 'migrations', migrationFile);
            if (!fs.existsSync(migrationPath)) {
                console.log(`⚠️  Migration file ${migrationFile} not found, skipping...`);
                continue;
            }
            
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
            
            try {
                await client.query(migrationSQL);
                console.log(`✅ ${migrationFile} executed successfully`);
            } catch (error) {
                console.error(`❌ Error in ${migrationFile}:`, error.message);
                // Continue with other migrations
            }
        }
        
        console.log('✅ Incremental migrations completed!');
        
    } catch (error) {
        console.error('❌ Error running incremental migrations:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

// Run if called directly
if (require.main === module) {
    runIncrementalMigrations()
        .then(() => {
            console.log('🏁 Incremental migration complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Incremental migration failed:', error);
            process.exit(1);
        });
}

module.exports = { runIncrementalMigrations };
