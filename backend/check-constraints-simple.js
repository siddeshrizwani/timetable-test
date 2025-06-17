const pool = require('./config/db');

async function checkConstraints() {
    const client = await pool.connect();
    try {
        // Check all constraints on class_sessions
        const allConstraints = await client.query(`
            SELECT 
                tc.constraint_name,
                tc.constraint_type,
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
            WHERE tc.table_name = 'class_sessions'
                AND tc.constraint_type = 'FOREIGN KEY'
            ORDER BY tc.constraint_name;
        `);
        
        console.log('All class_sessions foreign key constraints:');
        allConstraints.rows.forEach(c => {
            console.log(`  ${c.constraint_name}: ${c.column_name} → ${c.foreign_table_name} (${c.delete_rule || 'NO ACTION'})`);
        });
        
    } finally {
        client.release();
        await pool.end();
    }
}

checkConstraints();
