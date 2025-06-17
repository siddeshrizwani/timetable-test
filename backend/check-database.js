const pool = require('./config/db');

async function checkDatabase() {
    const client = await pool.connect();
    try {
        console.log('🔍 Database Health Check');
        console.log('='.repeat(50));
        
        // Check all tables
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        console.log('\n📊 Tables in database:');
        tables.rows.forEach(t => console.log(`  ✓ ${t.table_name}`));
        
        // Check record counts
        const coreTables = ['users', 'batches', 'subjects', 'teachers', 'rooms', 'class_sessions', 'batch_timeslots'];
        console.log('\n📈 Record counts:');
        
        for (const table of coreTables) {
            try {
                const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`  ${table}: ${result.rows[0].count} records`);
            } catch (err) {
                console.log(`  ${table}: Table not found`);
            }
        }
        
        // Check foreign key constraints
        const constraints = await client.query(`
            SELECT 
                tc.table_name,
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                rc.delete_rule
            FROM information_schema.table_constraints AS tc
            LEFT JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            LEFT JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            LEFT JOIN information_schema.referential_constraints AS rc
                ON rc.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_name IN ('class_sessions', 'batch_timeslots', 'teacher_allocations', 'batch_subjects')
            ORDER BY tc.table_name, tc.constraint_name;
        `);
        
        console.log('\n🔗 Foreign Key Constraints:');
        let currentTable = '';
        constraints.rows.forEach(c => {
            if (c.table_name !== currentTable) {
                currentTable = c.table_name;
                console.log(`  ${currentTable}:`);
            }
            console.log(`    ${c.column_name} → ${c.foreign_table_name} (${c.delete_rule || 'NO ACTION'})`);
        });
        
        // Check for sample data
        console.log('\n📋 Sample Data:');
        
        try {
            const sampleBatch = await client.query('SELECT batch_name FROM batches LIMIT 1');
            if (sampleBatch.rows.length > 0) {
                console.log(`  ✓ Sample batch: ${sampleBatch.rows[0].batch_name}`);
            } else {
                console.log('  ⚠️  No batches found');
            }
        } catch (err) {
            console.log('  ❌ Error checking batches');
        }
        
        try {
            const sampleSubject = await client.query('SELECT subject_name FROM subjects LIMIT 1');
            if (sampleSubject.rows.length > 0) {
                console.log(`  ✓ Sample subject: ${sampleSubject.rows[0].subject_name}`);
            } else {
                console.log('  ⚠️  No subjects found');
            }
        } catch (err) {
            console.log('  ❌ Error checking subjects');
        }
        
        // Check batch timeslots
        try {
            const timeslotCount = await client.query('SELECT COUNT(*) as count FROM batch_timeslots');
            console.log(`  ✓ Batch timeslots: ${timeslotCount.rows[0].count}`);
        } catch (err) {
            console.log('  ❌ Error checking batch timeslots');
        }
        
        console.log('\n✅ Database check completed!');
        
    } catch (err) {
        console.error('❌ Database check failed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    checkDatabase().catch(console.error);
}

module.exports = { checkDatabase };
