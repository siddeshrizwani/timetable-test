const pool = require('./config/db');

async function cleanupConstraints() {
    const client = await pool.connect();
    try {
        console.log('🧹 Cleaning up duplicate constraints...');
        
        // Drop the old constraints that have NO ACTION
        const constraintsToRemove = [
            'class_sessions_new_batch_id_fkey',
            'class_sessions_new_batch_timeslot_id_fkey',
            'class_sessions_new_room_id_fkey',
            'class_sessions_new_subject_id_fkey',
            'class_sessions_new_teacher_id_fkey'
        ];
        
        for (const constraintName of constraintsToRemove) {
            try {
                await client.query(`ALTER TABLE class_sessions DROP CONSTRAINT IF EXISTS ${constraintName}`);
                console.log(`✅ Dropped constraint: ${constraintName}`);
            } catch (err) {
                console.warn(`⚠️  Could not drop ${constraintName}:`, err.message);
            }
        }
        
        console.log('✅ Constraint cleanup completed!');
        
    } finally {
        client.release();
        await pool.end();
    }
}

cleanupConstraints();
