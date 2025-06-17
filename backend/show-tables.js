const pool = require('./config/db');

async function showTables() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        console.log('All tables in database:');
        result.rows.forEach(t => console.log('  ', t.table_name));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

showTables();
