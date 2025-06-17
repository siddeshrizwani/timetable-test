const pool = require('./config/db');

async function checkSchema() {
    const client = await pool.connect();
    try {
        // Check timeslots count
        const result = await client.query('SELECT COUNT(*) FROM timeslots');
        console.log('Timeslots count:', result.rows[0].count);
        
        // Check timeslots constraints
        const constraints = await client.query(`
            SELECT conname, contype 
            FROM pg_constraint 
            WHERE conrelid = 'timeslots'::regclass
        `);
        console.log('Timeslots constraints:');
        constraints.rows.forEach(c => console.log('  ', c.conname, c.contype));
        
        // Check if class_sessions table has session_type column
        const columns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'class_sessions'
        `);
        console.log('\nClass sessions columns:');
        columns.rows.forEach(c => console.log('  ', c.column_name, c.data_type));
        
        // Check if other tables exist
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name IN ('teacher_allocations', 'timetable_generations', 'blocked_timeslots')
        `);
        console.log('\nNew tables:');
        tables.rows.forEach(t => console.log('  ', t.table_name));
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkSchema();
