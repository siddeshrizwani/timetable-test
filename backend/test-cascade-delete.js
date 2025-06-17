// Test batch deletion with CASCADE constraints
const pool = require('./config/db');

async function testBatchDeletion() {
    console.log('🧪 Testing batch deletion with CASCADE constraints...');
    
    const client = await pool.connect();
    
    try {
        const batchId = 'a263fa37-5ab0-4a59-91b5-9696f1d842b5';
        
        // Check what exists before deletion
        console.log('📊 Before deletion:');
        
        const batchInfo = await client.query('SELECT * FROM batches WHERE batch_id = $1', [batchId]);
        console.log(`  Batch: ${batchInfo.rows[0]?.name || 'Not found'}`);
        
        const sessions = await client.query('SELECT COUNT(*) FROM class_sessions WHERE batch_id = $1', [batchId]);
        console.log(`  Class sessions: ${sessions.rows[0].count}`);
        
        const timeslots = await client.query('SELECT COUNT(*) FROM batch_timeslots WHERE batch_id = $1', [batchId]);
        console.log(`  Batch timeslots: ${timeslots.rows[0].count}`);
        
        const subjects = await client.query('SELECT COUNT(*) FROM batch_subjects WHERE batch_id = $1', [batchId]);
        console.log(`  Batch subjects: ${subjects.rows[0].count}`);
        
        // Test deletion
        console.log('\n🗑️  Testing CASCADE deletion...');
        
        await client.query('BEGIN');
        const deleteResult = await client.query('DELETE FROM batches WHERE batch_id = $1', [batchId]);
        console.log(`✅ Deleted ${deleteResult.rowCount} batch(es)`);
        
        // Verify cascade deletions
        console.log('\n📊 After deletion:');
        
        const sessionsAfter = await client.query('SELECT COUNT(*) FROM class_sessions WHERE batch_id = $1', [batchId]);
        console.log(`  Class sessions: ${sessionsAfter.rows[0].count}`);
        
        const timeslotsAfter = await client.query('SELECT COUNT(*) FROM batch_timeslots WHERE batch_id = $1', [batchId]);
        console.log(`  Batch timeslots: ${timeslotsAfter.rows[0].count}`);
        
        const subjectsAfter = await client.query('SELECT COUNT(*) FROM batch_subjects WHERE batch_id = $1', [batchId]);
        console.log(`  Batch subjects: ${subjectsAfter.rows[0].count}`);
        
        await client.query('ROLLBACK'); // Don't actually delete for testing
        console.log('\n🔄 Transaction rolled back (test only)');
        
        console.log('\n✅ CASCADE deletion test completed successfully!');
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Test failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

testBatchDeletion();
