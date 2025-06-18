// Test the complete timetable generation system
const pool = require('./config/db');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testTimetableGeneration() {
    console.log('🧪 Testing complete timetable generation system...');
    
    const client = await pool.connect();
    
    try {
        const batchId = 'a263fa37-5ab0-4a59-91b5-9696f1d842b5'; // Use the existing batch
        
        console.log(`📋 Testing timetable generation for batch: ${batchId}`);
        
        // 1. Get batch subjects and teachers (similar to the API logic)
        const batchSubjectsQuery = `
            SELECT 
                bs.subject_id,
                s.name as subject_name,
                s.code as subject_code,
                s.lecture_credits,
                s.lab_credits
            FROM batch_subjects bs
            JOIN subjects s ON bs.subject_id = s.subject_id
            WHERE bs.batch_id = $1
        `;
        
        const batchSubjects = await client.query(batchSubjectsQuery, [batchId]);
        console.log(`📚 Found ${batchSubjects.rows.length} subjects for batch`);
        
        // 2. Get all teachers
        const teachersResult = await client.query('SELECT teacher_id, name FROM teachers');
        console.log(`👨‍🏫 Found ${teachersResult.rows.length} teachers`);
        
        // 3. Get all rooms
        const roomsResult = await client.query('SELECT room_id, room_name, capacity, is_lab FROM rooms');
        console.log(`🏫 Found ${roomsResult.rows.length} rooms`);
          // 4. Get batch-specific timeslots
        const batchTimeslotsResult = await client.query(`
            SELECT timeslot_id, batch_id, day_of_week, start_time, end_time, slot_index, slot_name 
            FROM batch_timeslots 
            WHERE batch_id = $1
            ORDER BY day_of_week, slot_index
        `, [batchId]);
        console.log(`⏰ Found ${batchTimeslotsResult.rows.length} batch-specific timeslots`);
        
        // 5. Create input data for the Python solver
        const inputData = {
            batch_id: batchId,
            subjects: batchSubjects.rows.map(s => ({
                subject_id: s.subject_id,
                name: s.subject_name,
                code: s.subject_code,
                lecture_credits: s.lecture_credits,
                lab_credits: s.lab_credits
            })),
            teachers: teachersResult.rows.map(t => ({
                teacher_id: t.teacher_id,
                name: t.name
            })),
            rooms: roomsResult.rows.map(r => ({
                room_id: r.room_id,
                name: r.room_name,
                capacity: r.capacity,
                is_lab: r.is_lab
            })),            timeslots: batchTimeslotsResult.rows.map(ts => ({
                timeslot_id: ts.timeslot_id,
                batch_id: ts.batch_id,
                day_of_week: ts.day_of_week,
                start_time: ts.start_time,
                end_time: ts.end_time,
                slot_index: ts.slot_index,
                slot_name: ts.slot_name
            }))
        };
        
        // 6. Write input data to file
        const inputFilePath = path.join(__dirname, 'engine', `input_${batchId}.json`);
        fs.writeFileSync(inputFilePath, JSON.stringify(inputData, null, 2));
        console.log(`💾 Created input file: ${inputFilePath}`);
          // 7. Run the Python solver
        console.log('🐍 Running Python solver...');
        const pythonProcess = spawn('python3', [
            path.join(__dirname, 'engine', 'solve_.py'),
            inputFilePath
        ]);
        
        let outputData = '';
        let errorData = '';
        
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });
        
        await new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Python process exited with code ${code}: ${errorData}`));
                }
            });
        });
        
        console.log('🎯 Python solver completed successfully!');
        if (outputData) console.log('Python output:', outputData);
        
        // 8. Check if output file was created
        const outputFilePath = path.join(__dirname, 'engine', 'outputs', `${batchId}_output.json`);
        if (fs.existsSync(outputFilePath)) {
            console.log(`✅ Output file created: ${outputFilePath}`);
            
            // 9. Parse and insert timetable data
            const outputFileContent = fs.readFileSync(outputFilePath, 'utf8');
            const timetableData = JSON.parse(outputFileContent);
              console.log('📊 Timetable data structure:', Object.keys(timetableData));
            
            if (timetableData.solution && timetableData.solution.timetable && Array.isArray(timetableData.solution.timetable)) {
                const schedule = timetableData.solution.timetable;
                console.log(`📅 Found ${schedule.length} scheduled sessions`);
                
                // Clear existing sessions for this batch
                await client.query('DELETE FROM class_sessions WHERE batch_id = $1', [batchId]);
                console.log('🗑️  Cleared existing sessions for batch');
                
                let insertedCount = 0;
                let skippedCount = 0;
                  for (const session of schedule) {
                    try {
                        // Find batch-specific timeslot by day_of_week and slot_index
                        const batchTimeslotQuery = 'SELECT timeslot_id FROM batch_timeslots WHERE batch_id = $1 AND day_of_week = $2 AND slot_index = $3';
                        const batchTimeslotResult = await client.query(batchTimeslotQuery, [batchId, session.day_of_week, session.slot_index]);
                        
                        if (batchTimeslotResult.rows.length === 0) {
                            console.warn(`⚠️  No batch timeslot found for ${session.day_of_week} slot ${session.slot_index}`);
                            skippedCount++;
                            continue;
                        }
                        
                        const batchTimeslotId = batchTimeslotResult.rows[0].timeslot_id;
                        
                        // Insert class session with batch_timeslot_id
                        const insertQuery = `
                            INSERT INTO class_sessions (subject_id, batch_id, teacher_id, batch_timeslot_id, room_id, session_type)
                            VALUES ($1, $2, $3, $4, $5, $6)
                        `;
                        
                        await client.query(insertQuery, [
                            session.subject_id,
                            batchId,
                            session.teacher_id,
                            batchTimeslotId,
                            session.room_id,
                            session.type === 'Lab' ? 'lab' : 'lecture'
                        ]);
                        
                        insertedCount++;
                    } catch (err) {
                        console.warn(`⚠️  Failed to insert session: ${err.message}`);
                        skippedCount++;
                    }
                }
                
                console.log(`✅ Inserted ${insertedCount} sessions, skipped ${skippedCount}`);
                  // 10. Verify the inserted sessions
                const verifyQuery = `
                    SELECT cs.*, s.name as subject_name, t.name as teacher_name, r.room_name,
                           bt.day_of_week, bt.start_time, bt.end_time, bt.slot_index, bt.slot_name
                    FROM class_sessions cs
                    JOIN subjects s ON cs.subject_id = s.subject_id
                    JOIN teachers t ON cs.teacher_id = t.teacher_id
                    JOIN rooms r ON cs.room_id = r.room_id
                    JOIN batch_timeslots bt ON cs.batch_timeslot_id = bt.timeslot_id
                    WHERE cs.batch_id = $1
                    ORDER BY bt.day_of_week, bt.slot_index
                    LIMIT 10
                `;
                
                const sessions = await client.query(verifyQuery, [batchId]);                console.log(`🔍 Sample scheduled sessions (${sessions.rows.length} total):`);
                sessions.rows.forEach(session => {
                    console.log(`  ${session.day_of_week} ${session.start_time}-${session.end_time} (${session.slot_name}): ${session.subject_name} with ${session.teacher_name} in ${session.room_name} [${session.session_type}]`);
                });
                
            } else {
                console.log('❌ Invalid timetable data structure');
            }
        } else {
            console.log('❌ Output file not created by Python solver');
        }
        
    } catch (err) {
        console.error('❌ Test failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

testTimetableGeneration();
