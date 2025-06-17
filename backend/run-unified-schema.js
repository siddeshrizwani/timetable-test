const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runUnifiedSchema() {
    const client = await pool.connect();
    try {
        console.log('🚀 Running unified database schema...');
        
        // Check if this is a fresh database (no tables exist)
        const tableCheck = await client.query(`
            SELECT COUNT(*) as table_count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'batches', 'subjects', 'teachers', 'rooms')
        `);
        
        const tableCount = parseInt(tableCheck.rows[0].table_count);
        
        if (tableCount > 0) {
            console.log('⚠️  Existing tables detected. Use incremental migrations instead.');
            console.log('   Run: npm run migrate-incremental');
            return;
        }
        
        // Read and execute unified schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📄 Executing unified schema...');
        await client.query(schemaSQL);
        
        console.log('✅ Database schema created successfully!');
        console.log('🎓 Ready for university timetable management!');
        
    } catch (error) {
        console.error('❌ Error running unified schema:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

// Run if called directly
if (require.main === module) {
    runUnifiedSchema()
        .then(() => {
            console.log('🏁 Schema deployment complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Schema deployment failed:', error);
            process.exit(1);
        });
}

module.exports = { runUnifiedSchema };
