const pool = require('./config/db');

async function checkData() {
    const client = await pool.connect();
    try {        // Check batches
        const batches = await client.query('SELECT * FROM batches LIMIT 5');
        console.log('Batches in database:');
        batches.rows.forEach(b => console.log('  ', JSON.stringify(b)));
        
        // Check subjects
        const subjects = await client.query('SELECT * FROM subjects LIMIT 5');
        console.log('\nSubjects in database:');
        subjects.rows.forEach(s => console.log('  ', JSON.stringify(s)));
        
        // Check teachers
        const teachers = await client.query('SELECT * FROM teachers LIMIT 5');
        console.log('\nTeachers in database:');
        teachers.rows.forEach(t => console.log('  ', JSON.stringify(t)));
        
        // Check rooms
        const rooms = await client.query('SELECT * FROM rooms LIMIT 5');
        console.log('\nRooms in database:');
        rooms.rows.forEach(r => console.log('  ', JSON.stringify(r)));
        
        // Check batch_subjects
        const batchSubjects = await client.query('SELECT * FROM batch_subjects LIMIT 5');
        console.log('\nBatch-Subject mappings:');
        batchSubjects.rows.forEach(bs => console.log('  ', bs.batch_id, bs.subject_id));
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkData();
